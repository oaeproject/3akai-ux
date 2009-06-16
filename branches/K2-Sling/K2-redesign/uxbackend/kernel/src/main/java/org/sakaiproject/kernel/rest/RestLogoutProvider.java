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
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.session.SessionImpl;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Logout Rest Provider, internal to the kernel
 */
public class RestLogoutProvider implements RestProvider {

  private static final RestDescription DESCRIPTION = new RestDescription();

  /**
   *
   */
  @Inject
  public RestLogoutProvider(RegistryService registryService) {
    Registry<String, RestProvider> restRegistry = registryService
        .getRegistry(RestProvider.REST_REGISTRY);
    restRegistry.add(this);
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
        if (request.getRemoteUser() != null) {
          request.setAttribute(Authentication.REQUESTTOKEN, null);
          HttpSession session = request.getSession(false);
          if (session instanceof Session) {
            Session ss = (Session) session;
            ss.removeUser();
          } else if (session != null) {
            session.removeAttribute(SessionImpl.UNRESOLVED_UID);
            session.removeAttribute(SessionImpl.USER);
          }
          response.setContentType(RestProvider.CONTENT_TYPE);
          response.getOutputStream().print("{ \"response\" : \"OK\" }");
        } else {
          response.setContentType(RestProvider.CONTENT_TYPE);
          response.getOutputStream().print(
              "{ \"response\" : \"Not Logged In\" }");
        }
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

  static {
    DESCRIPTION.setTitle("Logout Service");
    DESCRIPTION.setBackUrl("../__describe__");
    DESCRIPTION.setShortDescription("The Logout service logs the user out ");
    DESCRIPTION
        .addURLTemplate(
            "*",
            "The service is selected by /rest/logout any training path will be ignored. "
                + "On POST the user will be logged out if the user is logged in, if they are not logged in a 200 will "
                + "still be returned, but there will be a Not Logged In in the response rather than OK ");
    DESCRIPTION
        .addResponse(
            "200",
            "If the user is logged out, there is a  { \"response\" : \"OK\" } with a status code of 200 ");
    DESCRIPTION.addResponse("405", "If the service is invoked with a GET ");

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestProvider#getDescription()
   */
  public RestDescription getDescription() {
    return DESCRIPTION;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return "logout";
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getPriority()
   */
  public int getPriority() {
    return 0;
  }

}
