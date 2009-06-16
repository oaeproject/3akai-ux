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
import static org.easymock.EasyMock.expectLastCall;

import org.easymock.EasyMock;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.webapp.filter.SakaiRequestFilter;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 
 */
public class RequestFilterKernelUnitT extends KernelIntegrationBase {
  
  private static boolean shutdown;
  @BeforeClass
  public static void beforeThisClass() throws ComponentActivatorException {
    shutdown = KernelIntegrationBase.beforeClass();
  }
  
  @AfterClass
  public static void afterThisClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  /**
   * Test the request Filter
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testSakaiRequestFilter() throws ServletException, IOException {
    FilterConfig filterConfig = EasyMock.createMock(FilterConfig.class);
    HttpServletRequest request = EasyMock.createMock(HttpServletRequest.class);
    HttpServletResponse response = EasyMock.createMock(HttpServletResponse.class);
    FilterChain chain = EasyMock.createMock(FilterChain.class);
  
    EasyMock.expect(filterConfig.getInitParameter("time-requests")).andReturn("true");
    EasyMock.expect(request.getMethod()).andReturn("GET");
    response.addCookie((Cookie) anyObject());
    expectLastCall().anyTimes();

    EasyMock.expect(request.getRequestURI()).andReturn("xyz").anyTimes();
    EasyMock.expect(request.getMethod()).andReturn("GET").anyTimes();
    EasyMock.expect(request.getPathInfo()).andReturn("/sdata/f");
    EasyMock.expect(request.getRemoteUser()).andReturn("ib236").anyTimes();
    EasyMock.expect(filterConfig.getInitParameter("no-session")).andReturn(null).anyTimes();
    EasyMock.expect(request.getRequestedSessionId()).andReturn(null).anyTimes();
    EasyMock.expect(request.getSession(false)).andReturn(null).anyTimes();
    chain.doFilter((ServletRequest)EasyMock.anyObject(), (ServletResponse)EasyMock.anyObject());
    EasyMock.replay(filterConfig,request,response,chain);
    
    SakaiRequestFilter requestFilter = new SakaiRequestFilter();
    requestFilter.init(filterConfig);
    requestFilter.doFilter(request, response, chain);
    
    EasyMock.verify(filterConfig,request,response,chain);
  }
  /**
   * Test the request fileter with no settings
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testSakaiRequestFilterSettings() throws ServletException, IOException {
    FilterConfig filterConfig = EasyMock.createMock(FilterConfig.class);
    HttpServletRequest request = EasyMock.createMock(HttpServletRequest.class);
    HttpServletResponse response = EasyMock.createMock(HttpServletResponse.class);
    FilterChain chain = EasyMock.createMock(FilterChain.class);
  
    EasyMock.expect(request.getRequestURI()).andReturn("xyz").anyTimes();
    EasyMock.expect(request.getMethod()).andReturn("GET").anyTimes();
    EasyMock.expect(filterConfig.getInitParameter("time-requests")).andReturn(null);
    EasyMock.expect(request.getRemoteUser()).andReturn("ib236").anyTimes();
    response.addCookie((Cookie) anyObject());
    expectLastCall().anyTimes();

    EasyMock.expect(filterConfig.getInitParameter("no-session")).andReturn(null).anyTimes();
    EasyMock.expect(request.getRequestedSessionId()).andReturn(null).anyTimes();
    EasyMock.expect(request.getSession(false)).andReturn(null).anyTimes();
    chain.doFilter((ServletRequest)EasyMock.anyObject(), (ServletResponse)EasyMock.anyObject());
    EasyMock.replay(filterConfig,request,response,chain);
    
    SakaiRequestFilter requestFilter = new SakaiRequestFilter();
    requestFilter.init(filterConfig);
    requestFilter.doFilter(request, response, chain);
    
    EasyMock.verify(filterConfig,request,response,chain);
  }
  
  

}
