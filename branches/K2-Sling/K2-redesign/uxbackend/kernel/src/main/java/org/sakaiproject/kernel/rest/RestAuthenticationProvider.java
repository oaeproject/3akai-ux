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
package org.sakaiproject.kernel.rest;

import com.google.inject.Inject;

import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.session.SessionImpl;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Authentication, this is an RestProvider is internal to the kernel.
 */
public class RestAuthenticationProvider implements RestProvider {

  /**
   *
   */
  private static final long serialVersionUID = -2118658526409944277L;
  private static final String KEY = "login";
  private static final org.sakaiproject.kernel.util.rest.RestDescription DESCRIPTION = new RestDescription();

  static {
    DESCRIPTION.setShortDescription("Authentication Rest Service");
    DESCRIPTION.setBackUrl("../__describe__");
    DESCRIPTION.setTitle("Login Service");
    DESCRIPTION
        .addSection(
            1,
            "Introduction",
            "Provides support for a client to perform user login."
                + "Based on the request that is made, one of a number of"
                + "login methods will be envoked, these include BASIC, "
                + "FORM and container TRUSTED. If a login is performed "
                + "the session state associated with the login will be "
                + "updated. Where the request does not invoke login, no "
                + "action will be perfomed. Login action is performed with "
                + "a query parameter of l = 1. The authentiation method is "
                + "specified in the parameter 'a' whicih may be one of BASIC, FORM, TRUSTED.");
    DESCRIPTION
        .addSection(
            2,
            "BASIC",
            "Where Basic is request, the HTTP method must be GET, and the "
                + "Authenticate header must contain a valid authentication information, "
                + "as per RFC 1945. If authentication is successfull a JSON { response : \"OK\" } "
                + "will be retruend with a status code of 200. If authentication failes"
                + "a status code of 401 will be sent.");
    DESCRIPTION
        .addSection(
            2,
            "FORM",
            "Where Form authentication is requested, the HTTP method must be "
                + "POST. The parameter u will be set to the username"
                + "and the parameter p will be set to the password. If authentication "
                + "is sucessfull a JSON response of { response: \"OK\" } "
                + "will be sent with a status code of 200. If authentication fails a "
                + "status code of 401 will be sent. ");
    DESCRIPTION
        .addSection(
            2,
            "TRUSTED",
            "Where Trusted authentication is request, the web container is consulted "
                + "for the remote user. If no remote user is present at the "
                + "container level, a 401 status code is sent. Otherwise a status code of "
                + "200 is sent, and the response contains { response: \"OK\"}");
    DESCRIPTION.addURLTemplate("all",
        "All URLs are considered the same, no template is applied");
    DESCRIPTION
        .addParameter(
            "l",
            "If set to 1, the login will be processed, if set to 0 the request will be ignored");
    DESCRIPTION
        .addParameter(
            "a",
            "May be set to BASIC, FORM or TRUSTED. BASIC indicates the request contains "
                + "Basic Authentication request headers as specified by RFC 1945. FORM indicates that the "
                + "request contains form based authentication and TRUSTED indicates the authentication "
                + "process should look in the trusted headers for the user id.");
    DESCRIPTION.addParameter("u",
        "Where FORM based authentication is requests, u contains the username");
    DESCRIPTION.addParameter("p",
        "Where FORM based authentication is requests, p contains the password");
    DESCRIPTION
        .addHeader(
            "Authenticate",
            "Where BASIC authentication is requested the Authenticate header must be set according to RFC 1945");

    DESCRIPTION
        .addResponse("401",
            " 401 will be sent if authentication is requested and authentication fails");
    DESCRIPTION
        .addResponse(
            "200",
            " a response of {response: \"OK\"} will be sent at all times except where a 401 is sent");

  }

  /**
   *
   */
  @Inject
  public RestAuthenticationProvider(RegistryService registryService) {
    Registry<String, RestProvider> restRegistry = registryService
        .getRegistry(RestProvider.REST_REGISTRY);
    restRegistry.add(this);
  }

  /**
   * @throws IOException
   *
   */
  private void doCheckLogin(HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    String login = request.getParameter("l");
    if ("1".equals(login)) {
      Object o = request.getAttribute(Authentication.REQUESTTOKEN);
      if (o == null) {
        response.reset();
        // login didnt happen, so it must be a 401
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        return;
      }

      // clear and previous logins
      HttpSession session = request.getSession();
      session.removeAttribute(SessionImpl.USER);
      if (session instanceof SessionImpl) {
        // this is protected, we have to bind to the impl and it will only work
        // inside the kernel classloader.
        ((SessionImpl) session).setBaseAttribute(SessionImpl.UNRESOLVED_UID,
            ((Authentication) o).getUid());
      } else {
        session.setAttribute(SessionImpl.UNRESOLVED_UID, ((Authentication) o)
            .getUid());

      }

      // pull the authentication token trough to the user
      request.getRemoteUser();
      response.setContentType(RestProvider.CONTENT_TYPE);
      response.getWriter().write("{\"response\": \"OK\"}");

      // clean out any authentication tokens
      request.setAttribute(Authentication.REQUESTTOKEN, null);
    } else {
      response.reset();
      response.sendError(HttpServletResponse.SC_BAD_REQUEST,
          "Please set the parameter l=1 to activate login");
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestProvider#dispatch(java.lang.String[],
   *      javax.servlet.http.HttpServletRequest,
   *      javax.servlet.http.HttpServletResponse)
   */
  public void dispatch(String[] elements, HttpServletRequest request,
      HttpServletResponse response) {
    try {
      if ("POST".equals(request.getMethod())) {
        doCheckLogin(request, response);
      } else {
        throw new RestServiceFaultException(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
      }
    } catch ( SecurityException ex ) {
      throw ex;
    } catch (RestServiceFaultException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new RestServiceFaultException(ex.getMessage(), ex);
    }

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return KEY;
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
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestProvider#getDescription()
   */
  public RestDescription getDescription() {
    return DESCRIPTION;
  }

}
