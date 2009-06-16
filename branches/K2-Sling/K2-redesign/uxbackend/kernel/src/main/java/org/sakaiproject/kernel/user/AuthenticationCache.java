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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.api.user.IdPrincipal;
import org.sakaiproject.kernel.api.user.IdPwPrincipal;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;

/**
 * Because DAV clients do not understand the concept of secure sessions, a DAV
 * user will end up asking Sakai to re-authenticate them for every action. To
 * ease the overhead, this class checks a size-limited timing-out cache of
 * one-way encrypted successful authentication IDs and passwords.
 * <p>
 * There's nothing DAV-specific about this class, and it's also independent of
 * any Sakai classes other than the "Authentication" user ID and EID holder.
 *
 */
public class AuthenticationCache {
  private static final Log LOG = LogFactory.getLog(AuthenticationCache.class);

  private static final boolean debug = LOG.isDebugEnabled();

  private Cache<AuthenticationRecord> authCache;

  /**
   *
   */

  @Inject
  public AuthenticationCache(CacheManagerService cacheManager) {
    this.authCache = cacheManager.getCache(AuthenticationCache.class.getName(),
        CacheScope.INSTANCE);
  }

  public Authentication getAuthentication(IdPrincipal idPrincipal)
      throws SecurityException {
    Authentication auth = null;
    try {
      AuthenticationRecord record = authCache.get(idPrincipal.getIdentifier());
      if (record.withpassword) {

        if (idPrincipal instanceof IdPwPrincipal) {
          IdPwPrincipal idPwPrincipal = (IdPwPrincipal) idPrincipal;
          if (MessageDigest.isEqual(record.encodedPassword,
              getEncrypted(idPwPrincipal.getPassword()))) {
            if (record.authentication == null) {
              if (debug) {
                LOG
                    .debug("getAuthentication: replaying authentication failure for authenticationId="
                        + idPrincipal.getIdentifier());
              }
              throw new SecurityException("repeated invalid login");
            } else {
              if (debug) {
                LOG
                    .debug("getAuthentication: returning record for authenticationId="
                        + idPrincipal.getIdentifier());
              }
              auth = record.authentication;
            }
          } else {
            // Since the passwords didn't match, we're no longer getting
            // repeats,
            // and so the record should be removed.
            if (debug) {
              LOG.debug("getAuthentication: record for authenticationId="
                  + idPrincipal.getIdentifier() + " failed password check");
            }
            authCache.remove(idPrincipal.getIdentifier());
          }
        }
      }
    } catch (NullPointerException e) {
      // this is ok and generally expected to indicate the value is not in the
      // cache
      auth = null;
    }
    return auth;
  }

  public void putAuthentication(IdPrincipal principal,
      Authentication authentication) {
    putAuthenticationRecord(principal, authentication);
  }

  public void putAuthenticationFailure(IdPrincipal principal) {
    putAuthenticationRecord(principal, null);
  }

  public void expireCache(Principal principal) {
    if (principal instanceof IdPrincipal) {
      authCache.remove(((IdPrincipal) principal).getIdentifier());
    }
  }

  protected void putAuthenticationRecord(IdPrincipal principal,
      Authentication authentication) {

    if (authCache.containsKey(principal.getIdentifier())) {
      // Don't indefinitely renew the cached record -- we want to force
      // real authentication after the timeout.
    } else {
      if (principal instanceof IdPwPrincipal) {
        IdPwPrincipal idPassIdPwPrincipal = (IdPwPrincipal) principal;
        authCache.put(principal.getIdentifier(), new AuthenticationRecord(
            getEncrypted(idPassIdPwPrincipal.getPassword()), authentication,
            System.currentTimeMillis()));
      }
    }
  }

  private byte[] getEncrypted(String plaintext) {
    try {
      MessageDigest messageDigest = MessageDigest.getInstance("SHA");
      messageDigest.update(plaintext.getBytes("UTF-8"));
      return messageDigest.digest();
    } catch (NoSuchAlgorithmException e) {
      // This seems highly unlikely.
      throw new RuntimeException(e);
    } catch (UnsupportedEncodingException e) {
      throw new RuntimeException(e);
    }
  }

  static class AuthenticationRecord {
    protected byte[] encodedPassword;
    protected Authentication authentication; // Null for failed authentication
    protected long createTimeInMs;
    protected boolean withpassword;

    public AuthenticationRecord(Authentication authentication,
        long createTimeInMs) {
      this.withpassword = false;
      this.authentication = authentication;
      this.createTimeInMs = createTimeInMs;
    }

    public AuthenticationRecord(byte[] encodedPassword,
        Authentication authentication, long createTimeInMs) {
      this.withpassword = true;
      this.encodedPassword = encodedPassword;
      this.authentication = authentication;
      this.createTimeInMs = createTimeInMs;
    }

  }

}
