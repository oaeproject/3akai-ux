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
package org.sakaiproject.kernel.rest.test;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import net.sf.json.JSONObject;

import org.junit.Test;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.registry.RegistryServiceImpl;
import org.sakaiproject.kernel.rest.RestAuthenticationProvider;
import org.sakaiproject.kernel.user.AuthenticationImpl;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;
import org.sakaiproject.kernel.webapp.test.InternalUser;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * 
 */
public class RestAuthenticationProviderUT {

  @Test
  public void testGet() throws ServletException, IOException {
    RegistryService registryService = new RegistryServiceImpl();
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    expect(request.getMethod()).andReturn("GET").anyTimes();
    expect(request.getParameter("l")).andReturn("0").anyTimes();

    replay(request, response);

    RestAuthenticationProvider a = new RestAuthenticationProvider(
        registryService);
    try {
      a.dispatch(new String[0], request, response);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(405, ex.getStatusCode());
    }

    verify(request, response);
  }

  @Test
  public void testGetWithLogin() throws ServletException, IOException {
    RegistryService registryService = new RegistryServiceImpl();
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpSession session = createMock(HttpSession.class);
    expect(request.getMethod()).andReturn("GET").anyTimes();

    expect(request.getParameter("l")).andReturn("1").anyTimes();

    replay(request, response, session);
    RestAuthenticationProvider a = new RestAuthenticationProvider(
        registryService);
    try {
      a.dispatch(new String[0], request, response);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(405, ex.getStatusCode());
    }

    // assertEquals("{\"response\": \"OK\"}", sw.toString());

    verify(request, response, session);
  }

  @Test
  public void testGetWithFailedLogin() throws ServletException, IOException {
    RegistryService registryService = new RegistryServiceImpl();
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    expect(request.getMethod()).andReturn("GET").anyTimes();

    expect(request.getParameter("l")).andReturn("1").anyTimes();

    replay(request, response);
    RestAuthenticationProvider a = new RestAuthenticationProvider(
        registryService);
    try {
      a.dispatch(new String[0], request, response);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(405, ex.getStatusCode());
    }

    verify(request, response);
  }

  @Test
  public void testPost() throws ServletException, IOException {
    RegistryService registryService = new RegistryServiceImpl();
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    expect(request.getMethod()).andReturn("POST").anyTimes();
    expect(request.getParameter("l")).andReturn("0").anyTimes();

    response.reset();
    expectLastCall();
    response.sendError(400, "Please set the parameter l=1 to activate login");
    expectLastCall();

    replay(request, response);
    RestAuthenticationProvider a = new RestAuthenticationProvider(
        registryService);
    a.dispatch(new String[0], request, response);

    verify(request, response);
  }

  @Test
  public void testPostWithLogin() throws ServletException, IOException {
    RegistryService registryService = new RegistryServiceImpl();
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpSession session = createMock(HttpSession.class);
    expect(request.getMethod()).andReturn("POST").anyTimes();
    expect(request.getSession()).andReturn(session).anyTimes();

    expect(request.getParameter("l")).andReturn("1").anyTimes();
    AuthenticationImpl authN = new AuthenticationImpl(new InternalUser("ieb"));
    expect(request.getAttribute(Authentication.REQUESTTOKEN)).andReturn(authN);

    session.setAttribute("_uu", "ieb");
    expectLastCall();
    session.removeAttribute("_u");
    expectLastCall();

    request.setAttribute("_uuid", null);
    expectLastCall();

    expect(request.getRemoteUser()).andReturn(null).anyTimes();
    StringWriter sw = new StringWriter();
    PrintWriter pw = new PrintWriter(sw);
    expect(response.getWriter()).andReturn(pw).anyTimes();
    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall().anyTimes();

    replay(request, response, session);
    RestAuthenticationProvider a = new RestAuthenticationProvider(
        registryService);
    a.dispatch(new String[0], request, response);

    assertEquals("{\"response\": \"OK\"}", sw.toString());

    verify(request, response, session);
  }

  @Test
  public void testPostWithFailedLogin() throws ServletException, IOException {
    RegistryService registryService = new RegistryServiceImpl();
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    expect(request.getMethod()).andReturn("POST").anyTimes();

    expect(request.getParameter("l")).andReturn("1").anyTimes();
    expect(request.getAttribute(Authentication.REQUESTTOKEN)).andReturn(null);
    response.reset();
    expectLastCall();
    response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    expectLastCall();

    replay(request, response);
    RestAuthenticationProvider a = new RestAuthenticationProvider(
        registryService);
    a.dispatch(new String[0], request, response);

    verify(request, response);
  }

  @Test
  public void testDescription() throws Exception {
    RegistryService registryService = new RegistryServiceImpl();
    RestAuthenticationProvider a = new RestAuthenticationProvider(
        registryService);
    RestDescription description = a.getDescription();

    // does not work without a network XmlUtils.parse(description.toXml());
    System.err.println(description.toXml());
    System.err.println(description.toHtml());
    // does not work without a network XmlUtils.parse(description.toHtml());
    // validate the json
    JSONObject.fromObject(description.toJson());
  }
}
