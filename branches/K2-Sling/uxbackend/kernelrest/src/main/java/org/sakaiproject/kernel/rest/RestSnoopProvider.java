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
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * 
 */
public class RestSnoopProvider implements RestProvider, Initialisable {

  private static final RestDescription DESCRIPTION = new RestDescription();

  static {
    DESCRIPTION.setTitle("Snoop Service");
    DESCRIPTION.setBackUrl("../__describe__");
    DESCRIPTION
        .setShortDescription("The Snoop service provides information about "
            + "the current user session and request");
    DESCRIPTION
        .addSection(
            1,
            "Introduction",
            "The Snoop Service, when queried will respond with a representation of the reques and the current users session.");
    DESCRIPTION.addParameter("anything",
        "The service accepts any parameters, but does nothing with them");
    DESCRIPTION
        .addHeader("none",
            "The service neither looks for headers nor sets any non standard headers");
    DESCRIPTION
        .addURLTemplate("me*",
            "The service is selected by /rest/me any training path will be ignored");
    DESCRIPTION.addResponse("200",
        "The service returns a JSON body with containing the response ");

  }

  private BeanConverter beanConverter;
  private Registry<String, RestProvider>  registry;

  /**
   * 
   */
  @Inject
  public RestSnoopProvider(RegistryService registryService,
      BeanConverter beanConverter) {
    registry = registryService
        .getRegistry(RestProvider.REST_REGISTRY);
    registry.add(this);
    this.beanConverter = beanConverter;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.webapp.Initialisable#init()
   */
  public void init() {
  }
  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.webapp.Initialisable#destroy()
   */
  public void destroy() {
    registry.remove(this);    
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
      Map<String, Object> snoop = new HashMap<String, Object>();

      Map<String, Object> session = new HashMap<String, Object>();
      snoop.put("session", session);
      Map<String, Object> req = new HashMap<String, Object>();
      snoop.put("request", req);
      Map<String, Object> sessionAttributes = new HashMap<String, Object>();
      session.put("attributes", sessionAttributes);
      HttpSession hs = request.getSession();
      for (Enumeration<?> e = hs.getAttributeNames(); e.hasMoreElements();) {
        String n = (String) e.nextElement();
        sessionAttributes.put(n, hs.getAttribute(n));
      }

      Map<String, Object> requestAttributes = new HashMap<String, Object>();
      req.put("attributes", requestAttributes);
      for (Enumeration<?> e = request.getAttributeNames(); e.hasMoreElements();) {
        String n = (String) e.nextElement();
        requestAttributes.put(n, request.getAttribute(n));
      }

      Map<String, Object> requestParamiters = new HashMap<String, Object>();
      req.put("parameters", requestParamiters);
      for (Enumeration<?> e = request.getParameterNames(); e.hasMoreElements();) {
        String n = (String) e.nextElement();
        requestParamiters.put(n, request.getParameter(n));
      }

      Map<String, Object> cookies = new HashMap<String, Object>();
      snoop.put("cookies", cookies);
      if (request.getCookies() != null) {
        for (Cookie c : request.getCookies()) {
          Map<String, Object> keys = new HashMap<String, Object>();
          cookies.put(c.getName(), keys);
          keys.put("path", c.getPath());
          keys.put("value", c.getValue());
        }
      }

      snoop.put("user", "Remote User " + request.getRemoteUser());

      response.setContentType(RestProvider.CONTENT_TYPE);
      ServletOutputStream outputStream = response.getOutputStream();
      outputStream.print(beanConverter.convertToString(snoop));
    } catch (SecurityException ex) {
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
    return "snoop";
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
