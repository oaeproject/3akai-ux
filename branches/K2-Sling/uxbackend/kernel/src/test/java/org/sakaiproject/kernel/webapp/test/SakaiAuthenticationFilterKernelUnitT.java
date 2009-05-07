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
package org.sakaiproject.kernel.webapp.test;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.test.KernelIntegrationBase;
import org.sakaiproject.kernel.webapp.filter.SakaiAuthenticationFilter;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;

import javax.jcr.RepositoryException;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 
 */
public class SakaiAuthenticationFilterKernelUnitT extends KernelIntegrationBase {

  private static final String BASE64AUTH = "Basic aWViOnBhc3N3b3Jk"; // ieb:password
  private static final String BADBASE64AUTH = "Basic asdfasdfsfsd9921xx==";
  private static boolean shutdown;
  @BeforeClass
  public static void beforeThisClass() throws ComponentActivatorException,
      RepositoryException, JCRNodeFactoryServiceException, IOException, InterruptedException, NoSuchAlgorithmException {
    shutdown = KernelIntegrationBase.beforeClass();
    KernelIntegrationBase.loadTestUsers();
  }
  

  @AfterClass
  public static void afterClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  @Test
  public void testAuthenticationFilterInit() throws ServletException {
    FilterConfig filterConfig = createMock(FilterConfig.class);

    replay(filterConfig);
    SakaiAuthenticationFilter filter = new SakaiAuthenticationFilter();
    filter.init(filterConfig);

    verify(filterConfig);
  }

  @Test
  public void testAuthenticationFilterDoFilter() throws ServletException,
      IOException {
    FilterConfig filterConfig = createMock(FilterConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    FilterChain chain = createMock(FilterChain.class);

    expect(request.getHeader("Authorization")).andReturn(null).anyTimes();
    expect(request.getParameter("l")).andReturn(null).anyTimes();
    chain.doFilter(request, response);
    expectLastCall().atLeastOnce();

    replay(filterConfig, request, response, chain);
    SakaiAuthenticationFilter filter = new SakaiAuthenticationFilter();
    filter.init(filterConfig);

    filter.doFilter(request, response, chain);

    verify(filterConfig, request, response, chain);

  }

  @Test
  public void testAuthenticationFilterDoFilterBASIC() throws ServletException,
      IOException {
    FilterConfig filterConfig = createMock(FilterConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    FilterChain chain = createMock(FilterChain.class);

    expect(request.getParameter("l")).andReturn("1").anyTimes();
    expect(request.getParameter("a")).andReturn("BASIC").anyTimes();
    expect(request.getHeader("Authorization")).andReturn(BASE64AUTH).anyTimes();

    request.setAttribute((String) anyObject(), anyObject());
    expectLastCall().atLeastOnce();
    
    chain.doFilter(request, response);
    expectLastCall().atLeastOnce();

    replay(filterConfig, request, response, chain);
    SakaiAuthenticationFilter filter = new SakaiAuthenticationFilter();
    filter.init(filterConfig);

    filter.doFilter(request, response, chain);

    verify(filterConfig, request, response, chain);
  }

  @Test
  public void testAuthenticationFilterDoFilterBadBASIC() throws ServletException,
      IOException {
    FilterConfig filterConfig = createMock(FilterConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    FilterChain chain = createMock(FilterChain.class);

    expect(request.getParameter("l")).andReturn("1").anyTimes();
    expect(request.getParameter("a")).andReturn("BASIC").anyTimes();
    expect(request.getHeader("Authorization")).andReturn(BADBASE64AUTH).anyTimes();

    
    chain.doFilter(request, response);
    expectLastCall().atLeastOnce();

    replay(filterConfig, request, response, chain);
    SakaiAuthenticationFilter filter = new SakaiAuthenticationFilter();
    filter.init(filterConfig);

    filter.doFilter(request, response, chain);

    verify(filterConfig, request, response, chain);
  }

  @Test
  public void testAuthenticationFilterDoFilterFORM() throws ServletException,
      IOException {
    FilterConfig filterConfig = createMock(FilterConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    FilterChain chain = createMock(FilterChain.class);
    expect(request.getHeader("Authorization")).andReturn(null).anyTimes();
    expect(request.getParameter("l")).andReturn("1").atLeastOnce();
    expect(request.getParameter("a")).andReturn("FORM").atLeastOnce();
    expect(request.getMethod()).andReturn("POST").atLeastOnce();
    expect(request.getParameter("u")).andReturn("ieb").atLeastOnce();
    expect(request.getParameter("p")).andReturn("password").atLeastOnce();
    
    
    request.setAttribute((String) anyObject(), anyObject());
    expectLastCall().atLeastOnce();
    chain.doFilter(request, response);
    expectLastCall().atLeastOnce();
  
    replay(filterConfig, request, response, chain);

    SakaiAuthenticationFilter filter = new SakaiAuthenticationFilter();
    filter.init(filterConfig);

    filter.doFilter(request, response, chain);

    verify(filterConfig, request, response, chain);
  }

  @Test
  public void testAuthenticationFilterDoFilterTRUSTED()
      throws ServletException, IOException {
    FilterConfig filterConfig = createMock(FilterConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    FilterChain chain = createMock(FilterChain.class);
    expect(request.getHeader("Authorization")).andReturn(null).anyTimes();
    expect(request.getParameter("l")).andReturn("1").anyTimes();
    expect(request.getParameter("a")).andReturn("TRUSTED").anyTimes();
    expect(request.getRemoteUser()).andReturn("ieb").anyTimes();
    
    
    request.setAttribute((String) anyObject(), anyObject());
    expectLastCall().atLeastOnce();
    
    chain.doFilter(request, response);
    expectLastCall().atLeastOnce();

    replay(filterConfig, request, response, chain);

    SakaiAuthenticationFilter filter = new SakaiAuthenticationFilter();
    filter.init(filterConfig);
    filter.doFilter(request, response, chain);

    verify(filterConfig, request, response, chain);

  }
  
  
  @Test
  public void testAuthenticationFilterDoFilterDUMMY()
      throws ServletException, IOException {
    FilterConfig filterConfig = createMock(FilterConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    FilterChain chain = createMock(FilterChain.class);
    expect(request.getHeader("Authorization")).andReturn(null).anyTimes();
    expect(request.getParameter("l")).andReturn("1").anyTimes();
    expect(request.getParameter("a")).andReturn("sdfsdfds").anyTimes();
    chain.doFilter(request, response);
    expectLastCall().atLeastOnce();
    replay(filterConfig, request, response, chain);

    SakaiAuthenticationFilter filter = new SakaiAuthenticationFilter();
    filter.init(filterConfig);
    filter.doFilter(request, response, chain);

    verify(filterConfig, request, response, chain);

  }

}
