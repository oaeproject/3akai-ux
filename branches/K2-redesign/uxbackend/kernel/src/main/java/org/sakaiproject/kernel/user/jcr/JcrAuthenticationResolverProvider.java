/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
package org.sakaiproject.kernel.user.jcr;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.api.user.AuthenticationManagerProvider;
import org.sakaiproject.kernel.api.user.AuthenticationResolverProvider;
import org.sakaiproject.kernel.api.user.IdPwPrincipal;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.JCRIdPwEvidence;
import org.sakaiproject.kernel.user.AuthenticationImpl;
import org.sakaiproject.kernel.util.PathUtils;
import org.sakaiproject.kernel.util.StringUtils;
import org.sakaiproject.kernel.util.user.AnonUser;

import java.security.Principal;

import javax.jcr.Node;
import javax.jcr.Property;

/**
 * Performs authentication against a property on the user env file containing a
 * SHA1 hash of the password
 */
public class JcrAuthenticationResolverProvider implements
    AuthenticationResolverProvider, AuthenticationManagerProvider {

  public static final String JCRPASSWORDHASH = "sakai:sha1-password-hash";
  private String userEnvironmentBase;
  private JCRNodeFactoryService jcrNodeFactoryService;
  private UserResolverService userResolverService;
  private SessionManagerService sessionManagerService;
  private UserEnvironmentResolverService userEnvironmentResolverService;
  private AuthzResolverService authzResolverService;

  /**
   * @param userResolverService
   *
   */
  @Inject
  public JcrAuthenticationResolverProvider(
      JCRNodeFactoryService jcrNodeFactoryService,
      @Named(KernelConstants.JCR_USERENV_BASE) String userEnvironmentBase,
      UserResolverService userResolverService, RegistryService registryService,
      SessionManagerService sessionManagerService,
      UserEnvironmentResolverService userEnvironmentResolverService,
      AuthzResolverService authzResolverService) {
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.userEnvironmentBase = userEnvironmentBase;
    this.userResolverService = userResolverService;
    this.sessionManagerService = sessionManagerService;
    this.userEnvironmentResolverService = userEnvironmentResolverService;
    this.authzResolverService = authzResolverService;
    // register as a resolver and a manager
    Registry<String, AuthenticationResolverProvider> authResolverRegistry = registryService
        .getRegistry(KernelConstants.AUTHENTICATION_PROVIDER_REGISTRY);
    authResolverRegistry.add(this);
    Registry<String, AuthenticationManagerProvider> authManagerRegistry = registryService
        .getRegistry(KernelConstants.MANAGER_PROVIDER_REGISTRY);
    authManagerRegistry.add(this);

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.AuthenticationResolverProvider#authenticate(java.security.Principal)
   */
  public Authentication authenticate(Principal principal)
      throws SecurityException {
    if (principal instanceof IdPwPrincipal) {
      // resolve the location of the users security file, which is the Userenv
      // file

      IdPwPrincipal idPwPrincipal = (IdPwPrincipal) principal;
      User user = userResolverService.resolve(idPwPrincipal.getIdentifier());
      if (user != null) {
        try {
          authzResolverService.setRequestGrant("Authenticating user ");
          String userEnvPath = getUserEnvPath(user.getUuid());
          Node n = jcrNodeFactoryService.getNode(userEnvPath);
          if (n != null) {
            Property p = n.getProperty(JCRPASSWORDHASH);
            String hash = p.getString();
            String nonce = StringUtils.sha1Hash(idPwPrincipal.getPassword());
            if (nonce.equals(hash)) {
              return new AuthenticationImpl(user);
            }
          }
        } catch (Exception ex) {
          throw new SecurityException("user "
              + idPwPrincipal.getIdentifier() + ": problem authenticating.", ex);
        } finally {
          authzResolverService.clearRequestGrant();
        }
      }
      throw new SecurityException("user "
          + idPwPrincipal.getIdentifier() + ": problem resolving");
    }
    throw new SecurityException("Authentication Principal " + principal
        + " not suitable for " + this.getClass().getName());
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.AuthenticationManagerProvider#setAuthentication(java.security.Principal,
   *      java.security.Principal)
   */
  public boolean setAuthentication(Principal oldPrincipal,
      Principal newPrincipal) throws SecurityException {
    if (oldPrincipal instanceof JCRIdPwEvidence
        && newPrincipal instanceof JCRIdPwEvidence) {

      Session session = sessionManagerService.getCurrentSession();
      if (session == null) {
        throw new SecurityException("User Has Not been logged in");
      }
      UserEnvironment ue = userEnvironmentResolverService.resolve(session);
      if (ue == null) {
        throw new SecurityException("User Has Not been logged in");
      }
      User thisUser = ue.getUser();
      if (thisUser == null || thisUser instanceof AnonUser) {
        throw new SecurityException("User Has Not been logged in");
      }
      boolean superUser = ue.isSuperUser();

      IdPwPrincipal oldIdPwPrincipal = (IdPwPrincipal) oldPrincipal;
      IdPwPrincipal newIdPwPrincipal = (IdPwPrincipal) newPrincipal;
      if (oldIdPwPrincipal.getIdentifier().equals(
          newIdPwPrincipal.getIdentifier())) {
        User user = userResolverService.resolve(oldIdPwPrincipal
            .getIdentifier());
        if (thisUser.getUuid().equals(user.getUuid())) {
          // even the super user must specify the old password to change their
          // own.
          superUser = false;
        } else if (!superUser) {
          throw new SecurityException(
              "Only a super user can change others passwords");
        }

        String userEnvPath = getUserEnvPath(user.getUuid());
        try {
          authzResolverService.setRequestGrant("Setting passsword ");
          Node n = jcrNodeFactoryService.getNode(userEnvPath);
          if (n == null) {
            throw new SecurityException(
                "User does not exist, cant set password");
          } else {
            Property p = n.getProperty(JCRPASSWORDHASH);
            String hash = p.getString();
            String nonce = StringUtils.sha1Hash(oldIdPwPrincipal.getPassword());
            if (superUser || nonce.equals(hash)) {
              nonce = StringUtils.sha1Hash(newIdPwPrincipal.getPassword());
              n.setProperty(JCRPASSWORDHASH, nonce);
              // we really do want to do this.
              n.save();
              return true; // success
            } else {
              throw new SecurityException(
                  "Old Passwords do not match, password was not changed ");
            }
          }
        } catch (Exception ex) {
          throw new SecurityException("Failed to set password :"
              + ex.getMessage(), ex);
        } finally {
          authzResolverService.clearRequestGrant();
        }
      } else {
        throw new SecurityException(
            "Princiapls do not reference the same user, password not changed ");
      }
    }
    return false;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return "jcr-authn-provider-sha1-hash";
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getPriority()
   */
  public int getPriority() {
    return 0;
  }

  /**
   * @return
   */
  public String getUserEnvPath(String userId) {
    String prefix = PathUtils.getUserPrefix(userId);
    return userEnvironmentBase + prefix + KernelConstants.USERENV;
  }
}
