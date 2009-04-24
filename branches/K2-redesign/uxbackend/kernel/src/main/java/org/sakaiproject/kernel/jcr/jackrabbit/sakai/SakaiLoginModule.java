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

package org.sakaiproject.kernel.jcr.jackrabbit.sakai;

import org.apache.jackrabbit.core.security.CredentialsCallback;
import org.sakaiproject.kernel.api.KernelConfigurationException;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.api.user.AuthenticationResolverService;
import org.sakaiproject.kernel.jcr.jackrabbit.JCRAnonymousPrincipal;
import org.sakaiproject.kernel.jcr.jackrabbit.JCRSystemPrincipal;

import java.security.Principal;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.jcr.Credentials;
import javax.jcr.SimpleCredentials;
import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.security.auth.login.FailedLoginException;
import javax.security.auth.login.LoginException;
import javax.security.auth.spi.LoginModule;

public class SakaiLoginModule implements LoginModule {
  private static final String SAKAI_SYSTEM_USER = "sakaisystem";

  private static final String SAKAI_ANON_USER = ".anon";

  private Subject subject;

  private CallbackHandler callbackHandler;

  private final Set<Principal> principals = new HashSet<Principal>();

  private AuthenticationResolverService authenticationResolver;

  private SessionManagerService sessionManagerService;

  /**
   * Constructor
   *
   * @throws KernelConfigurationException
   */
  public SakaiLoginModule() throws KernelConfigurationException {
    KernelManager km = new KernelManager();
    this.sessionManagerService = km.getService(SessionManagerService.class);
    this.authenticationResolver = km.getService(AuthenticationResolverService.class);
  }

  /**
   * {@inheritDoc}
   * @see javax.security.auth.spi.LoginModule#initialize(javax.security.auth.Subject, javax.security.auth.callback.CallbackHandler, java.util.Map, java.util.Map)
   */
  public void initialize(Subject subject, CallbackHandler callbackHandler,
      Map<String, ?> sharedState, Map<String, ?> options) {
    this.subject = subject;
    this.callbackHandler = callbackHandler;
  }

  /**
   * {@inheritDoc}
   * @see javax.security.auth.spi.LoginModule#login()
   */
  public boolean login() throws LoginException {
    // prompt for a user name and password
    if (callbackHandler == null) {
      throw new LoginException("no CallbackHandler available");
    }

    boolean authenticated = false;
    principals.clear();
    try {

      // Get credentials using a JAAS callback
      CredentialsCallback ccb = new CredentialsCallback();
      callbackHandler.handle(new Callback[] { ccb });
      Credentials creds = ccb.getCredentials();
      // Use the credentials to set up principals
      if (creds != null) {
        if (creds instanceof SimpleCredentials) {
          SimpleCredentials sc = (SimpleCredentials) creds;
          // authenticate

          Authentication auth = null;
          try {
            auth = authenticationResolver.authenticate(new JCRIdPwEvidence(sc.getUserID(), new String(sc.getPassword())));
          } catch (SecurityException e) {
            auth = null;
          }
          if (auth == null) {
            principals.add(new JCRAnonymousPrincipal(SAKAI_ANON_USER));
          } else {
            principals.add(new SakaiUserPrincipalImpl(auth.getUid()));
          }
          authenticated = true;
        } else if (creds instanceof SakaiJCRCredentials) {
          principals.add(new JCRSystemPrincipal(SAKAI_SYSTEM_USER));
          authenticated = true;
        }
      } else {
        // authenticated via Session or Sakai Wrapper
        String userId = sessionManagerService.getCurrentUserId();
        if (userId == null || userId.equals("anon")  ) {
          principals.add(new JCRAnonymousPrincipal(SAKAI_ANON_USER));
        } else {
          principals.add(new SakaiUserPrincipalImpl(userId));
        }
        authenticated = true;
      }
    } catch (java.io.IOException ioe) {
      throw new LoginException(ioe.toString());
    } catch (UnsupportedCallbackException uce) {
      throw new LoginException(uce.getCallback().toString() + " not available");
    }

    if (authenticated) {
      return !principals.isEmpty();
    } else {
      principals.clear();
      throw new FailedLoginException();
    }
  }

  /**
   * {@inheritDoc}
   * @see javax.security.auth.spi.LoginModule#commit()
   */
  public boolean commit() throws LoginException {
    if (principals.isEmpty()) {
      return false;
    } else {
      // add a principals (authenticated identities) to the Subject
      subject.getPrincipals().addAll(principals);
      return true;
    }
  }

  /**
   * {@inheritDoc}
   * @see javax.security.auth.spi.LoginModule#abort()
   */
  public boolean abort() throws LoginException {
    if (principals.isEmpty()) {
      return false;
    } else {
      logout();
    }
    return true;
  }

  /**
   * {@inheritDoc}
   * @see javax.security.auth.spi.LoginModule#logout()
   */
  public boolean logout() throws LoginException {
    subject.getPrincipals().removeAll(principals);
    principals.clear();
    return true;
  }
}
