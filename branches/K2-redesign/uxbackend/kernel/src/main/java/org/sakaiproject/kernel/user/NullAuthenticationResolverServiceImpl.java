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
import com.google.inject.Singleton;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.api.user.AuthenticationManagerService;
import org.sakaiproject.kernel.api.user.AuthenticationResolverService;
import org.sakaiproject.kernel.api.user.IdPrincipal;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserResolverService;

import java.security.Principal;

/**
 * A Null implementation of the AuthenticationResolverService, that
 * authenticates everything. We may remove this in the near future.
 */
@Singleton
public class NullAuthenticationResolverServiceImpl implements
    AuthenticationResolverService, AuthenticationManagerService {

  private static final Log LOG = LogFactory.getLog(NullAuthenticationResolverServiceImpl.class);
  private UserResolverService userResolverService;

  /**
   *
   */
  @Inject
  public NullAuthenticationResolverServiceImpl(
      UserResolverService userResolverService) {
    this.userResolverService = userResolverService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.AuthenticationResolverService#authenticate(java.security.Principal)
   */
  public Authentication authenticate(Principal principal)
      throws SecurityException {
    if (principal instanceof IdPrincipal) {
      User u = userResolverService.resolve(((IdPrincipal) principal)
          .getIdentifier());
      LOG.warn("NON PRODUCTION CODE: NULL Authentication of user "+u.getUuid());
      return new AuthenticationImpl(u);
    }
    return null;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.AuthenticationManagerService#setAuthentication(java.security.Principal, java.security.Principal)
   */
  public boolean setAuthentication(Principal oldPrincipal, Principal newPrincipal)
      throws SecurityException {
    return true;
  }

}
