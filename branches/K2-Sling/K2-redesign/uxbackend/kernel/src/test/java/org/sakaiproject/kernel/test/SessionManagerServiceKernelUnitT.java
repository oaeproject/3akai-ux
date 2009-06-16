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
package org.sakaiproject.kernel.test;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertSame;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.session.SessionManagerService;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * 
 */
public class SessionManagerServiceKernelUnitT {
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
  public void testSessionManagerNewSession() {
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = createMock(HttpSession.class);

    String sessionID = "12345654321";
    // no session
    expect(request.getRequestedSessionId()).andReturn(null);
    
    // no cookies
    expect(request.getCookies()).andReturn(null);
    
    // should try and create a session, but not force it
    expect(request.getSession(false)).andReturn(session);
    
  
    response.addCookie((Cookie) anyObject());
    expectLastCall();

    expect(session.getId()).andReturn(sessionID).atLeastOnce();

    
    
    
    replay(request, response, session);

    KernelManager kernelManager = new KernelManager();
    SessionManagerService sessionManager = kernelManager
        .getService(SessionManagerService.class);

    System.err.println("============CREATE NEW SESSION========");
    HttpSession newSession = sessionManager
        .getSession(request, response, false);
    System.err.println("============DONE========");
    assertSame(session, newSession);
    
    verify(request, response, session);
    
    CacheManagerService cacheManagerService = kernelManager
    .getService(CacheManagerService.class);
    cacheManagerService.unbind(CacheScope.REQUEST);
    cacheManagerService.unbind(CacheScope.THREAD);
    
    reset(request, response, session);
    
    expect(request.getRequestedSessionId()).andReturn(sessionID);
    expect(session.getAttribute("check-valid")).andReturn(null).anyTimes();
    
    // no cookies, not called should come from the map
    // expect(request.getCookies()).andReturn(null);
    
    
  
    replay(request, response, session);
    System.err.println("============GET EXISTING SESSION========");
    HttpSession newSession2 = sessionManager
    .getSession(request, response, false);
    System.err.println("============DONE========");

    assertSame(session, newSession2);
    verify(request, response, session);
    
  }
  
  
  @Test
  public void testSessionManagerNewSessionCetFromCookie() {
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = createMock(HttpSession.class);

    String sessionID = "12345654321-2";
    // no session
    expect(request.getRequestedSessionId()).andReturn(null);
    
    // no cookies
    expect(request.getCookies()).andReturn(null);
    
    // should try and create a session, but not force it
    expect(request.getSession(false)).andReturn(session);
    
  
    response.addCookie((Cookie) anyObject());
    expectLastCall();
    
    expect(session.getId()).andReturn(sessionID).atLeastOnce();
    expect(session.getAttribute("check-valid")).andReturn(null).anyTimes();
    
    
    
    replay(request, response, session);

    KernelManager kernelManager = new KernelManager();
    SessionManagerService sessionManager = kernelManager
        .getService(SessionManagerService.class);
    System.err.println("============CREATE NEW SESSION========");
    HttpSession newSession = sessionManager
        .getSession(request, response, false);
    System.err.println("============DONE========");
    assertSame(session, newSession);
    
    verify(request, response, session);

    CacheManagerService cacheManagerService = kernelManager
    .getService(CacheManagerService.class);
    cacheManagerService.unbind(CacheScope.REQUEST);
    cacheManagerService.unbind(CacheScope.THREAD);

    reset(request, response, session);
    
    expect(request.getRequestedSessionId()).andReturn(null);
    
    Cookie cookie = new Cookie("SAKAIID",sessionID); // from kernel-component.properties
    // came from the cookie
    expect(request.getCookies()).andReturn(new Cookie[] {cookie});
    expect(session.getAttribute("check-valid")).andReturn(null).anyTimes();
    
    
  
    replay(request, response, session);
    System.err.println("============GET OLD SESSION FROM COOKIE========");
    HttpSession newSession2 = sessionManager
    .getSession(request, response, false);
    System.err.println("============DONE========");
    assertSame(session, newSession2);
    verify(request, response, session);
  }

  @Test
  public void testSessionManagerExpiredSession() {
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = createMock(HttpSession.class);

    String sessionID = "12345654321-2";
    // no session
    expect(request.getRequestedSessionId()).andReturn(null);
    
    // no cookies
    expect(request.getCookies()).andReturn(null);
    
    // should try and create a session, but not force it
    expect(request.getSession(false)).andReturn(session);
    
  
    response.addCookie((Cookie) anyObject());
    expectLastCall();
    
    expect(session.getId()).andReturn(sessionID).atLeastOnce();
    expect(session.getAttribute("check-valid")).andReturn(null).anyTimes();
    
    
    
    replay(request, response, session);

    KernelManager kernelManager = new KernelManager();
    SessionManagerService sessionManager = kernelManager
        .getService(SessionManagerService.class);
    System.err.println("============CREATE NEW SESSION========");
    HttpSession newSession = sessionManager
        .getSession(request, response, false);
    System.err.println("============DONE========");
    assertSame(session, newSession);
    
    verify(request, response, session);
    CacheManagerService cacheManagerService = kernelManager
    .getService(CacheManagerService.class);
    cacheManagerService.unbind(CacheScope.REQUEST);
    cacheManagerService.unbind(CacheScope.THREAD);
    
    reset(request, response, session);
    
    // the session ID does not exist
    expect(request.getRequestedSessionId()).andReturn("23423423");
    expect(session.getAttribute("check-valid")).andReturn(null).anyTimes();

    // but the cookie does, and we should still get the one we want.
    Cookie cookie = new Cookie("SAKAIID",sessionID); // from kernel-component.properties
    // came from the cookie
    expect(request.getCookies()).andReturn(new Cookie[] {cookie});
    
    
  
    replay(request, response, session);
    System.err.println("============GET OLD SESSION FROM COOKIE========");
    HttpSession newSession2 = sessionManager
    .getSession(request, response, false);
    System.err.println("============DONE========");
    assertSame(session, newSession2);
    verify(request, response, session);
  }

}
