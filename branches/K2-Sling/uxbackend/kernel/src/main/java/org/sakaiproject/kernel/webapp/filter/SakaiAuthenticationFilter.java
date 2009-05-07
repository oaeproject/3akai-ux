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
package org.sakaiproject.kernel.webapp.filter;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.api.user.AuthenticationResolverService;
import org.sakaiproject.kernel.api.user.ExternalTrustedPrincipal;
import org.sakaiproject.kernel.api.user.IdPwPrincipal;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Performs one of three types of authentication, form, basic or container
 * controlled by the url parameter a which should be "FORM", "BASIC" or
 * "TRUSTED". If BASIC, the Authenticate header will be used, if FORM, a POST is
 * expected with the parameters u and p for username and password. If TRUSTED,
 * the request object will have the username from the container. To activate the
 * parameter l should be 1
 */
public class SakaiAuthenticationFilter implements Filter {

  private static final Log LOG = LogFactory
      .getLog(SakaiAuthenticationFilter.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private AuthenticationResolverService authenticationResolverService;

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.Filter#destroy()
   */
  public void destroy() {
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest,
   *      javax.servlet.ServletResponse, javax.servlet.FilterChain)
   */
  public void doFilter(ServletRequest request, ServletResponse response,
      FilterChain chain) throws IOException, ServletException {
    HttpServletRequest hrequest = (HttpServletRequest) request;
    HttpServletResponse hresponse = (HttpServletResponse) response;
    if (hrequest.getHeader("Authorization") != null) {
      try {
        doBasicAuth(hrequest);
      } catch (SecurityException se) {
        // catch any Security exceptions and send a 401
        LOG.info("Login Failed: " + se.getMessage());
        hresponse.reset();
        hresponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, se
            .getMessage());
        return;
      }
    } else {
      if ("1".equals(hrequest.getParameter("l"))) {
        try {
          AuthenticationType authNType = AuthenticationType.valueOf(request
              .getParameter("a"));
          if (debug) {
            LOG.debug("Authentication Filter: " + authNType);
          }
          switch (authNType) {
          case BASIC:
            doBasicAuth(hrequest);
            break;
          case FORM:
            doForm(hrequest);
            break;
          case TRUSTED:
            doTrusted(hrequest);
            break;
          }
        } catch (SecurityException se) {
          // catch any Security exceptions and send a 401
          LOG.info("Login Failed " + se.getMessage());
          hresponse.reset();
          hresponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, se
              .getMessage());
          return;
        } catch (IllegalArgumentException e) {
          LOG.info("Authentication type " + request.getParameter("a")
              + " is not supported by this filter");
        }
      }
    }

    chain.doFilter(request, response);

  }

  /**
   * @param hrequest
   */
  private void doTrusted(HttpServletRequest hrequest) {
    // use the remote user object.
    final String eid = hrequest.getRemoteUser();
    ExternalTrustedPrincipal ep = new ExternalTrustedPrincipal() {

      public String getIdentifier() {
        return eid;
      }

      public String getName() {
        return SakaiAuthenticationFilter.class.getName() + " Trusted";
      }
    };
    Authentication a = authenticationResolverService.authenticate(ep);
    if (a != null) {
      hrequest.setAttribute(Authentication.REQUESTTOKEN, a);
    }
  }

  /**
   * @param hrequest
   */
  private void doForm(HttpServletRequest hrequest) {
    // extract the username and password from the request (should only be a
    // post)
    if ("POST".equals(hrequest.getMethod())) {
      final String eid = hrequest.getParameter("u");
      final String password = hrequest.getParameter("p");
      if (eid != null && eid.trim().length() > 0 && password != null
          && password.trim().length() > 0) {
        IdPwPrincipal principal = new IdPwPrincipal() {

          public String getPassword() {
            return password;
          }

          public String getIdentifier() {
            return eid;
          }

          public String getName() {
            return SakaiAuthenticationFilter.class.getName() + " form";
          }

        };
        if (debug) {
          LOG.debug("Performing authentication for " + eid + " with "
              + principal);
        }
        Authentication a = authenticationResolverService
            .authenticate(principal);
        if (a != null) {
          if (debug) {
            LOG.debug("Sucess for " + eid + " with " + a);
          }
          hrequest.setAttribute(Authentication.REQUESTTOKEN, a);
        } else {
          throw new SecurityException("Failed to perform Form login for " + eid);
        }

      }
    }
  }

  /**
   * @param hrequest
   * @throws UnsupportedEncodingException
   */
  private void doBasicAuth(HttpServletRequest hrequest)
      throws UnsupportedEncodingException {
    String auth = hrequest.getHeader("Authorization");
    if (auth != null && auth.trim().length() > 0) {
      auth = auth.trim();
      if (auth.startsWith("Basic")) {
        auth = auth.substring(5).trim();
        auth = new String(Base64.decodeBase64(auth.getBytes("UTF-8")), "UTF-8");
        final String[] unpw = StringUtils.split(auth, ":", 2);
        if (unpw != null && unpw.length == 2 && unpw[0] != null
            && unpw[0].trim().length() > 0 && unpw[1] != null
            && unpw[1].trim().length() > 0) {
          IdPwPrincipal principal = new IdPwPrincipal() {

            public String getPassword() {
              return unpw[1];
            }

            public String getIdentifier() {
              return unpw[0];
            }

            public String getName() {
              return SakaiAuthenticationFilter.class.getName() + " basic";
            }
          };
          Authentication a = authenticationResolverService
              .authenticate(principal);
          if (a != null) {
            hrequest.setAttribute(Authentication.REQUESTTOKEN, a);
          } else {
            throw new SecurityException("Failed to perform Form login for "
                + unpw[0]);
          }
        }
      }
    }

  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
   */
  public void init(FilterConfig filterConfig) throws ServletException {
    KernelManager km = new KernelManager();
    authenticationResolverService = km
        .getService(AuthenticationResolverService.class);
  }

}
