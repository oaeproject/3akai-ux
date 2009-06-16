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
package org.sakaiproject.kernel.user;

import com.google.inject.Inject;

import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.api.user.AuthenticationManagerProvider;
import org.sakaiproject.kernel.api.user.AuthenticationManagerService;
import org.sakaiproject.kernel.api.user.AuthenticationResolverProvider;
import org.sakaiproject.kernel.api.user.AuthenticationResolverService;

import java.security.Principal;
import java.util.List;

/**
 * This class acts as a container for authentication mechanisms that are
 * registered from elsewhere
 */
public class ProviderAuthenticationResolverService implements
    AuthenticationResolverService, AuthenticationManagerService {

  private NullAuthenticationResolverServiceImpl nullService;
  private Registry<String,AuthenticationResolverProvider> registry;
  private Registry<String,AuthenticationManagerProvider> managerRegistry;

  /**
   *
   */
  @Inject
  public ProviderAuthenticationResolverService(
      NullAuthenticationResolverServiceImpl nullService,
      RegistryService registryService) {
    this.nullService = nullService;
    this.registry = registryService
        .getRegistry(KernelConstants.AUTHENTICATION_PROVIDER_REGISTRY);

   this.managerRegistry = registryService.getRegistry(KernelConstants.MANAGER_PROVIDER_REGISTRY);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.AuthenticationResolverService#authenticate(java.security.Principal)
   */
  public Authentication authenticate(Principal principal)
      throws SecurityException {

    List<AuthenticationResolverProvider> providers = registry.getList();
    if (providers.size() == 0) {
      return nullService.authenticate(principal);
    }
    StringBuilder messages = new StringBuilder();
    for (AuthenticationResolverProvider authN : providers) {
      try {
        return authN.authenticate(principal);
      } catch (SecurityException se) {
        se.printStackTrace();
        if (messages.length() == 0) {
          messages.append("Authentication Failed:\n");
        }
        messages.append("\t").append(authN).append(" said ").append(
            se.getMessage()).append("\n");
      }
    }
    throw new SecurityException(messages.toString());
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.AuthenticationManagerService#setAuthentication(java.security.Principal, java.security.Principal)
   */
  public boolean setAuthentication(Principal oldPrincipal, Principal newPrincipal)
      throws SecurityException {
    List<AuthenticationManagerProvider> providers = managerRegistry.getList();
    if (providers.size() == 0) {
      nullService.setAuthentication(oldPrincipal, newPrincipal);
    }
    StringBuilder messages = new StringBuilder();
    for (AuthenticationManagerProvider authN : providers) {
      try {
        if ( authN.setAuthentication(oldPrincipal, newPrincipal) ) {
          return true;
        }
      } catch (SecurityException se) {
        if (messages.length() == 0) {
          messages.append("Faield to set authentication:\n");
        }
        messages.append("\t").append(authN).append(" said ").append(
            se.getMessage()).append("\n");
      }
    }
    if ( messages.length() == 0 ) {
      return false;
    }
    throw new SecurityException(messages.toString());
  }

}
