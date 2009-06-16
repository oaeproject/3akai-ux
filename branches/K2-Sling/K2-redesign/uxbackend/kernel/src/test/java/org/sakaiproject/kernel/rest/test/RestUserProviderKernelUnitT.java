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

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertTrue;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.rest.RestUserProvider;
import org.sakaiproject.kernel.test.KernelIntegrationBase;
import org.sakaiproject.kernel.webapp.SakaiServletRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Locale;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * 
 */
public class RestUserProviderKernelUnitT extends KernelIntegrationBase {

  
  @SuppressWarnings("unused")
  private static final Log LOG = LogFactory.getLog(RestUserProviderKernelUnitT.class);
  private static boolean shutdown;

  @BeforeClass
  public static void beforeThisClass() throws ComponentActivatorException {
    shutdown = KernelIntegrationBase.beforeClass();
  }

  @AfterClass
  public static void afterThisClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  @Test
  public void testGet() throws ServletException, IOException {
    KernelManager km = new KernelManager();
    SessionManagerService sessionManagerService = km
        .getService(SessionManagerService.class);
    CacheManagerService cacheManagerService = km
        .getService(CacheManagerService.class);
    UserResolverService userResolverService = km
        .getService(UserResolverService.class);

    RegistryService registryService = km.getService(RegistryService.class);
    Registry<String, RestProvider> registry = registryService
        .getRegistry(RestProvider.REST_REGISTRY);
    RestUserProvider rup = (RestUserProvider) registry.getMap().get("user");

    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = createMock(HttpSession.class);
    
    expect(request.getMethod()).andReturn("GET").anyTimes();
    response.sendError(405);
    
    
    /*
    expect(request.getRequestedSessionId()).andReturn("SESSIONID-123-1").anyTimes();
    expect(session.getId()).andReturn("SESSIONID-123-1").anyTimes();
    Cookie cookie = new Cookie("SAKAIID","SESSIONID-123-1");
    expect(request.getCookies()).andReturn(new Cookie[]{cookie}).anyTimes();


    expect(request.getAttribute("_no_session")).andReturn(null).anyTimes();
    expect(request.getSession(true)).andReturn(session).anyTimes();
    expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
    expect(session.getAttribute("_u")).andReturn(null).anyTimes();
    expect(session.getAttribute("_uu")).andReturn(null).anyTimes();
    expect(request.getLocale()).andReturn(new Locale("en", "US")).anyTimes();
    expect(session.getAttribute("sakai.locale.")).andReturn(null).anyTimes();
    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall().atLeastOnce();
    response.addCookie((Cookie) anyObject());
    expectLastCall().anyTimes();
    final ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ServletOutputStream out = new ServletOutputStream() {

      @Override
      public void write(int b) throws IOException {
        baos.write(b);
      }

    };
    expect(response.getOutputStream()).andReturn(out).anyTimes();
  */
    
    replay(request, response, session);

    SakaiServletRequest sakaiServletRequest = new SakaiServletRequest(request,
        response,  userResolverService, sessionManagerService);
    sessionManagerService.bindRequest(sakaiServletRequest);

    rup.dispatch(new String[] { "user", "new" }, request, response);


    cacheManagerService.unbind(CacheScope.REQUEST);
    verify(request, response, session);

  }


  @Test
  public void testNewUser() throws ServletException, IOException {
    KernelManager km = new KernelManager();
    SessionManagerService sessionManagerService = km
        .getService(SessionManagerService.class);
    CacheManagerService cacheManagerService = km
        .getService(CacheManagerService.class);
    UserResolverService userResolverService = km
        .getService(UserResolverService.class);

    RegistryService registryService = km.getService(RegistryService.class);
    Registry<String, RestProvider> registry = registryService
        .getRegistry(RestProvider.REST_REGISTRY);
    RestUserProvider rup = (RestUserProvider) registry.getMap().get("user");

    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = createMock(HttpSession.class);
    

    
    expect(request.getMethod()).andReturn("POST").anyTimes();

    expect(request.getParameter("firstName")).andReturn("Ian").atLeastOnce();
    expect(request.getParameter("lastName")).andReturn("Ian").atLeastOnce();
    expect(request.getParameter("email")).andReturn("ian@sakai.org").atLeastOnce();
    expect(request.getParameter("eid")).andReturn("ib236").atLeastOnce();
    expect(request.getParameter("password")).andReturn("password").atLeastOnce();
    expect(request.getParameter("userType")).andReturn("student").atLeastOnce();
    
    response.setContentType("text/plain");
    expectLastCall().atLeastOnce();
    
    final ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ServletOutputStream out = new ServletOutputStream() {

      @Override
      public void write(int b) throws IOException {
        baos.write(b);
      }

    };
    expect(response.getOutputStream()).andReturn(out).anyTimes();

    expect(request.getRemoteUser()).andReturn(null).anyTimes();
    expect(request.getRequestedSessionId()).andReturn("SESSIONID-123-1").anyTimes();
    expect(session.getId()).andReturn("SESSIONID-123-1").anyTimes();
    Cookie cookie = new Cookie("SAKAIID","SESSIONID-123-1");
    expect(request.getCookies()).andReturn(new Cookie[]{cookie}).anyTimes();


    expect(request.getAttribute("_no_session")).andReturn(null).anyTimes();
    expect(request.getSession(true)).andReturn(session).anyTimes();
    expect(request.getSession(false)).andReturn(session).anyTimes();
    expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
    expect(session.getAttribute("_u")).andReturn(null).anyTimes();
    expect(session.getAttribute("_uu")).andReturn(null).anyTimes();
    expect(request.getLocale()).andReturn(new Locale("en", "US")).anyTimes();
    expect(session.getAttribute("sakai.locale.")).andReturn(null).anyTimes();
    response.addCookie((Cookie) anyObject());
    expectLastCall().anyTimes();
    
    replay(request, response, session);

    SakaiServletRequest sakaiServletRequest = new SakaiServletRequest(request,
        response,  userResolverService, sessionManagerService);
    sessionManagerService.bindRequest(sakaiServletRequest);

    rup.dispatch(new String[] { "user", "new" }, request, response);
    
    String respBody = new String(baos.toByteArray(),"UTF-8");
    System.err.println("Response Was "+respBody);
    assertTrue(respBody.indexOf("uuid") > 0 );
    assertTrue(respBody.indexOf("OK") > 0 );


    cacheManagerService.unbind(CacheScope.REQUEST);
    verify(request, response, session);

  }
  
  

}
