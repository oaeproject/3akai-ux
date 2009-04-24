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
package org.sakaiproject.sdata.tool.test;

import static org.easymock.EasyMock.anyInt;
import static org.easymock.EasyMock.anyLong;
import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import org.easymock.EasyMock;
import org.easymock.IAnswer;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.KernelModule;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.ServiceSpec;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.component.KernelLifecycle;
import org.sakaiproject.kernel.component.core.KernelBootstrapModule;
import org.sakaiproject.kernel.webapp.SakaiServletRequest;
import org.sakaiproject.kernel.webapp.SakaiServletResponse;
import org.sakaiproject.sdata.tool.ControllerServlet;
import org.sakaiproject.sdata.tool.JCRDumper;
import org.sakaiproject.sdata.tool.JCRHandler;
import org.sakaiproject.sdata.tool.JCRUserStorageHandler;
import org.sakaiproject.sdata.tool.api.Handler;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.jcr.AccessDeniedException;
import javax.jcr.InvalidItemStateException;
import javax.jcr.ItemExistsException;
import javax.jcr.ReferentialIntegrityException;
import javax.jcr.RepositoryException;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.nodetype.NoSuchNodeTypeException;
import javax.jcr.version.VersionException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * 
 */
public class IntegrationTest {

  private static KernelLifecycle kl;
  private static Kernel kernel;

  @BeforeClass
  public static void beforeClass() throws IOException {

    System.setProperty(KernelBootstrapModule.SYS_LOCAL_PROPERTIES,
        "inline://kernel.classloaderIsolation=true;");
    kl = new KernelLifecycle();
    kl.start();

    KernelManager km = new KernelManager();
    kernel = km.getKernel();

  }

  @AfterClass
  public static void afterClass() {
    if (kl != null) {
      kl.stop();
    }
    System.clearProperty(KernelModule.SYS_LOCAL_PROPERTIES);
  }

  private SessionManagerService sessionManagerService;
  private CacheManagerService cacheManagerService;
  private AuthzResolverService authzResolverService;
  private UserResolverService userResolverService;

  /**
   * @throws java.lang.Exception
   */
  @Before
  public void setUp() throws Exception {
    sessionManagerService = kernel.getService(SessionManagerService.class);
    cacheManagerService = kernel.getService(CacheManagerService.class);
    authzResolverService = kernel.getService(AuthzResolverService.class);
    userResolverService = kernel.getService(UserResolverService.class);
  }

  /**
   * @throws java.lang.Exception
   */
  @After
  public void tearDown() throws Exception {
  }

  @Test
  public void testServletInit() throws ServletException {
    ServletConfig config = createMock(ServletConfig.class);

    replay(config);
    ControllerServlet controllerServlet = new ControllerServlet();
    controllerServlet.init(config);

    verify(config);
  }

  @Test
  public void testServletRequest() throws ServletException, IOException {

    ServletConfig config = createMock(ServletConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = setupSession(request, response);

    expect(request.getPathInfo()).andReturn("/checkRunning");
    expect(request.getPathInfo()).andReturn("/f/test34a/sas/info.txt");
    expect(request.getPathInfo()).andReturn("/p/myinfo.txt");
    expect(request.getPathInfo()).andReturn("/pmissmatch/sdfsd/sdf/cds.xt/");

    replay(config, request, response, session);
    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    assertNotNull(sresponse);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testServletRequest");
    ControllerServlet controllerServlet = new ControllerServlet();
    controllerServlet.init(config);

    // invoke with the request configured for jcr
    Handler handler = controllerServlet.getHandler(srequest);
    assertNotNull(handler);
    assertSame(controllerServlet.getNullHandler(), handler);

    handler = controllerServlet.getHandler(srequest);
    assertNotNull(handler);
    assertEquals(JCRHandler.class, handler.getClass());

    // invoke with the request configured for jcruser
    handler = controllerServlet.getHandler(srequest);
    assertNotNull(handler);
    assertEquals(JCRUserStorageHandler.class, handler.getClass());

    // invoke with the request configured for nomatch
    handler = controllerServlet.getHandler(srequest);
    assertNull(handler);

    cacheManagerService.unbind(CacheScope.REQUEST);
    verify(config, request, response, session);
  }

  @Test
  public void testServletRequest1() throws ServletException, IOException {

    ServletConfig config = createMock(ServletConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = setupSession(request, response);

    // service call 1

    // now the sevice call.
    // this is fragile and at the moment, we just get a 403, which doesnt sound
    // that good !
    // call 1

    expect(request.getMethod()).andReturn("GET").anyTimes();
    expect(request.getPathInfo()).andReturn("/f/test34a/sas/info.txt")
        .anyTimes();
    expect(request.getRemoteUser()).andReturn("ieb").anyTimes();
    expect(request.getParameter("snoop")).andReturn("0").anyTimes();
    expect(request.getParameter("v")).andReturn(null).anyTimes();
    expect(request.getParameter("f")).andReturn(null).anyTimes();
    expect(request.getParameter("d")).andReturn(null).anyTimes();
    expect(request.getParameter("doc")).andReturn(null).anyTimes();

    expect(request.getRequestURL()).andReturn(
        new StringBuffer("http://localhost:8080/sdata/f/test34a/sas/info.txt"))
        .anyTimes();

    response.setHeader("x-sdata-handler",
        "org.sakaiproject.sdata.tool.JCRHandler");

    response.setHeader("x-sdata-url", "/f/test34a/sas/info.txt");
    response.reset();
    replay(config, request, response, session);

    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testServletRequest1");

    ControllerServlet controllerServlet = new ControllerServlet();
    controllerServlet.init(config);
    controllerServlet.service(srequest, sresponse);

    cacheManagerService.unbind(CacheScope.REQUEST);

    assertEquals(404, sresponse.getStatusCode());
    verify(config, request, response, session);

  }

  @Test
  public void testServletRequest2() throws ServletException, IOException {

    ServletConfig config = createMock(ServletConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = setupSession(request, response);

    // service call 2
    // call 2 no path
    expect(request.getMethod()).andReturn("GET").anyTimes();
    expect(request.getPathInfo()).andReturn(null).anyTimes();
    expect(request.getParameter("doc")).andReturn(null).anyTimes();
    expect(request.getRequestURL()).andReturn(
        new StringBuffer("http://localhost:8080/sdata")).anyTimes();

    response.reset();

    replay(config, request, response, session);
    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testServletRequest2");
    ControllerServlet controllerServlet = new ControllerServlet();
    controllerServlet.init(config);
    controllerServlet.service(srequest, sresponse);
    cacheManagerService.unbind(CacheScope.REQUEST);
    
    
    assertEquals(404, sresponse.getStatusCode());
    verify(config, request, response, session);

  }

  @Test
  public void testServletRequest3() throws ServletException, IOException {

    ServletConfig config = createMock(ServletConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = setupSession(request, response);

    // service call 3

    // call 3 empty path
    expect(request.getMethod()).andReturn("GET").anyTimes();
    expect(request.getPathInfo()).andReturn("").anyTimes();
    expect(request.getParameter("doc")).andReturn(null).anyTimes();
    expect(request.getRequestURL()).andReturn(
        new StringBuffer("http://localhost:8080/sdata")).anyTimes();

    response.reset();

    replay(config, request, response, session);
    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testServletRequest3");
    ControllerServlet controllerServlet = new ControllerServlet();
    controllerServlet.init(config);
    controllerServlet.service(srequest, sresponse);
    cacheManagerService.unbind(CacheScope.REQUEST);
    assertEquals(404, sresponse.getStatusCode());

    verify(config, request, response, session);

  }

  @Test
  public void testServletRequest4() throws ServletException, IOException {

    ServletConfig config = createMock(ServletConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = setupSession(request, response);

    // service call 4
    // exercise the check
    // call 4
    expect(request.getMethod()).andReturn("GET").anyTimes();
    expect(request.getPathInfo()).andReturn("/checkRunning").anyTimes();
    expect(request.getHeader("x-testdata-size")).andReturn("10").anyTimes();
    expect(response.getOutputStream()).andReturn(new ServletOutputStream() {

      @Override
      public void write(int arg0) throws IOException {
      }

    }).anyTimes();
    expect(request.getRequestURL()).andAnswer(new IAnswer<StringBuffer>() {

      public StringBuffer answer() throws Throwable {

        return new StringBuffer("http://localhost:8080/sdata");
      }

    }).anyTimes();

    response.setHeader("x-sdata-handler",
        "org.sakaiproject.sdata.tool.ControllerServlet$1");
    response.setHeader("x-sdata-url", "/checkRunning");
    response.setContentType("application/octet-stream");
    response.setContentLength(10);

    replay(config, request, response, session);
    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testServletRequest4");
    ControllerServlet controllerServlet = new ControllerServlet();
    controllerServlet.init(config);
    controllerServlet.service(srequest, sresponse);
    cacheManagerService.unbind(CacheScope.REQUEST);
    assertEquals(200, sresponse.getStatusCode());
    verify(config, request, response, session);

  }

  @Test
  public void testGet() throws ServletException,
      JCRNodeFactoryServiceException, AccessDeniedException,
      ItemExistsException, ConstraintViolationException,
      InvalidItemStateException, ReferentialIntegrityException,
      VersionException, LockException, NoSuchNodeTypeException,
      RepositoryException, IOException {
    ServletConfig config = createMock(ServletConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = setupSession(request, response);

    expect(request.getMethod()).andReturn("GET").atLeastOnce();
    expect(request.getPathInfo()).andReturn("/f/test/testfile.txt")
        .atLeastOnce();
    expect(request.getRemoteUser()).andReturn("ieb").anyTimes();
    expect(request.getParameter("v")).andReturn(null).anyTimes();
    expect(request.getParameter("f")).andReturn(null).anyTimes();
    expect(request.getParameter("d")).andReturn(null).anyTimes();
    expect(request.getParameter("doc")).andReturn(null).anyTimes();
    expect(request.getParameter("snoop")).andReturn("0").anyTimes();
    expect(request.getDateHeader("if-unmodified-since")).andReturn(0L)
        .atLeastOnce();
    expect(request.getDateHeader("if-modified-since")).andReturn(0L)
        .atLeastOnce();
    expect(request.getHeader("if-match")).andReturn(null).atLeastOnce();
    expect(request.getHeader("if-none-match")).andReturn(null).atLeastOnce();
    expect(request.getHeader("range")).andReturn(null).atLeastOnce();
    expect(request.getDateHeader("if-range")).andReturn(0L).atLeastOnce();
    expect(request.getHeader("if-range")).andReturn(null).atLeastOnce();

    response.setHeader("x-sdata-handler",
        "org.sakaiproject.sdata.tool.JCRHandler");
    expectLastCall().anyTimes();
    response.setHeader("x-sdata-url", "/f/test/testfile.txt");
    expectLastCall().anyTimes();
    response.setContentType("text/plain");
    expectLastCall().anyTimes();
    response.setCharacterEncoding("UTF-8");
    response.setDateHeader((String) anyObject(), anyLong());
    expectLastCall().anyTimes();
    response.addHeader((String) anyObject(), (String) anyObject());
    expectLastCall().anyTimes();
    response.setHeader((String) anyObject(), (String) anyObject());
    expectLastCall().anyTimes();
    response.setStatus(200);
    expectLastCall().atLeastOnce();
    response.setContentLength(12);
    expectLastCall().atLeastOnce();

    final ByteArrayOutputStream baos = new ByteArrayOutputStream();
    final ServletOutputStream out = new ServletOutputStream() {

      @Override
      public void write(int c) throws IOException {
        baos.write(c);
      }

    };
    expect(response.getOutputStream()).andAnswer(
        new IAnswer<ServletOutputStream>() {

          public ServletOutputStream answer() throws Throwable {
            return out;
          }

        }).anyTimes();
    expect(request.getRequestURL()).andAnswer(new IAnswer<StringBuffer>() {

      public StringBuffer answer() throws Throwable {

        return new StringBuffer("http://localhost:8080/sdata");
      }

    }).anyTimes();

    replay(config, request, response, session);
    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testGet");

    ControllerServlet controllerServlet = new ControllerServlet();
    controllerServlet.init(config);

    // create a node and populate it with some content
    JCRNodeFactoryService jcrNodeFactoryService = kernel.getServiceManager()
        .getService(new ServiceSpec(JCRNodeFactoryService.class));
    jcrNodeFactoryService.createFile("/test/testfile.txt",
        RestProvider.CONTENT_TYPE);
    String content = "some content";
    ByteArrayInputStream bais = new ByteArrayInputStream(content
        .getBytes("UTF-8"));
    jcrNodeFactoryService.setInputStream("/test/testfile.txt", bais,
        RestProvider.CONTENT_TYPE).getSession().save();

    // get the node back
    controllerServlet.service(srequest, sresponse);

    String result = new String(baos.toByteArray(), "UTF-8");
    assertEquals(content, result);

  }

  @Test
  public void testGetMetaData() throws ServletException,
      JCRNodeFactoryServiceException, AccessDeniedException,
      ItemExistsException, ConstraintViolationException,
      InvalidItemStateException, ReferentialIntegrityException,
      VersionException, LockException, NoSuchNodeTypeException,
      RepositoryException, IOException {
    ServletConfig config = createMock(ServletConfig.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = setupSession(request, response);

    expect(request.getMethod()).andReturn("GET").atLeastOnce();
    expect(request.getPathInfo()).andReturn("/f/test").atLeastOnce();
    expect(request.getRemoteUser()).andReturn("ieb").anyTimes();
    expect(request.getParameter("v")).andReturn(null).anyTimes();
    expect(request.getParameter("f")).andReturn("m").anyTimes();
    expect(request.getParameter("d")).andReturn("2").anyTimes();
    expect(request.getParameter("doc")).andReturn(null).anyTimes();
    expect(request.getParameter("snoop")).andReturn("0").anyTimes();
    response.setHeader("x-sdata-handler",
        "org.sakaiproject.sdata.tool.JCRHandler");
    response.setContentType("text/plain;charset=UTF-8");
    expectLastCall().anyTimes();
    response.setDateHeader((String) anyObject(), anyLong());
    expectLastCall().anyTimes();
    response.addHeader((String) anyObject(), (String) anyObject());
    expectLastCall().anyTimes();
    response.setHeader((String) anyObject(), (String) anyObject());
    expectLastCall().anyTimes();
    // response.setStatus(200);
    // expectLastCall().atLeastOnce();
    response.setContentLength(anyInt());
    expectLastCall().atLeastOnce();

    final ByteArrayOutputStream baos = new ByteArrayOutputStream();
    final ServletOutputStream out = new ServletOutputStream() {

      @Override
      public void write(int c) throws IOException {
        baos.write(c);
      }

    };
    expect(response.getOutputStream()).andAnswer(
        new IAnswer<ServletOutputStream>() {

          public ServletOutputStream answer() throws Throwable {
            return out;
          }

        }).anyTimes();
    expect(request.getRequestURL()).andAnswer(new IAnswer<StringBuffer>() {

      public StringBuffer answer() throws Throwable {

        return new StringBuffer("http://localhost:8080/sdata");
      }

    }).anyTimes();

    replay(config, request, response, session);
    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testGetMetatData");

    ControllerServlet controllerServlet = new ControllerServlet();
    controllerServlet.init(config);

    // create a node and populate it with some content
    JCRNodeFactoryService jcrNodeFactoryService = kernel.getServiceManager()
        .getService(new ServiceSpec(JCRNodeFactoryService.class));
    jcrNodeFactoryService.createFile("/test/testfile.txt",
        RestProvider.CONTENT_TYPE);
    String content = "some content";
    ByteArrayInputStream bais = new ByteArrayInputStream(content
        .getBytes("UTF-8"));
    jcrNodeFactoryService.setInputStream("/test/testfile.txt", bais,
        RestProvider.CONTENT_TYPE).getSession().save();

    // get the node back
    controllerServlet.service(srequest, sresponse);

    String result = new String(baos.toByteArray(), "UTF-8");
    assertNotNull(result);
    int i = result.indexOf("testfile.txt");
    assertTrue(i > 0);
    verify(config, request, response, session);

  }

  @Test
  public void testDumper() throws ServletException, IOException,
      JCRNodeFactoryServiceException, RepositoryException, ItemExistsException,
      ConstraintViolationException, InvalidItemStateException,
      ReferentialIntegrityException, VersionException, LockException,
      NoSuchNodeTypeException, RepositoryException {

    // create a node and populate it with some content
    JCRService jcrService = kernel.getService(JCRService.class);
    jcrService.loginSystem();
    JCRNodeFactoryService jcrNodeFactoryService = kernel.getServiceManager()
        .getService(new ServiceSpec(JCRNodeFactoryService.class));
    jcrNodeFactoryService.createFile("/test/testfile.txt",
        RestProvider.CONTENT_TYPE);
    String content = "some content";
    ByteArrayInputStream bais = new ByteArrayInputStream(content
        .getBytes("UTF-8"));
    jcrNodeFactoryService.setInputStream("/test/testfile.txt", bais,
        RestProvider.CONTENT_TYPE).getSession().save();

    jcrService.logout();

    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);

    HttpSession session = setupSession(request, response);
    replay(request, response, session);
    JCRDumper dumper = new JCRDumper(jcrService);
    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testDumper");
    dumper.doDelete(srequest, sresponse);
    cacheManagerService.unbind(CacheScope.REQUEST);
    verify(request, response, session);

  }

  @Test
  public void testDumper2() throws ServletException, IOException,
      JCRNodeFactoryServiceException, RepositoryException, ItemExistsException,
      ConstraintViolationException, InvalidItemStateException,
      ReferentialIntegrityException, VersionException, LockException,
      NoSuchNodeTypeException, RepositoryException {

    // create a node and populate it with some content
    JCRService jcrService = kernel.getService(JCRService.class);
    jcrService.loginSystem();
    JCRNodeFactoryService jcrNodeFactoryService = kernel.getServiceManager()
        .getService(new ServiceSpec(JCRNodeFactoryService.class));
    jcrNodeFactoryService.createFile("/test/testfile.txt",
        RestProvider.CONTENT_TYPE);
    String content = "some content";
    ByteArrayInputStream bais = new ByteArrayInputStream(content
        .getBytes("UTF-8"));
    jcrNodeFactoryService.setInputStream("/test/testfile.txt", bais,
        RestProvider.CONTENT_TYPE).getSession().save();

    jcrService.logout();

    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);

    HttpSession session = setupSession(request, response);
    expect(request.getRemoteUser()).andReturn(null).anyTimes();
    expect(request.getPathInfo()).andReturn("/test/testfile.txt").anyTimes();
    expect(request.getMethod()).andReturn("GET").anyTimes();

    response.setContentType("text/xml");
    expect(response.getOutputStream()).andAnswer(
        new IAnswer<ServletOutputStream>() {

          public ServletOutputStream answer() throws Throwable {
            return new ServletOutputStream() {

              @Override
              public void write(int b) throws IOException {
              }

            };
          }

        }).anyTimes();

    replay(request, response, session);
    JCRDumper dumper = new JCRDumper(jcrService);
    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testDumper");
    dumper.doGet(srequest, sresponse);
    cacheManagerService.unbind(CacheScope.REQUEST);
    verify(request, response, session);
  }

  @Test
  public void testDumper3() throws ServletException, IOException,
      JCRNodeFactoryServiceException, RepositoryException, ItemExistsException,
      ConstraintViolationException, InvalidItemStateException,
      ReferentialIntegrityException, VersionException, LockException,
      NoSuchNodeTypeException, RepositoryException {

    // create a node and populate it with some content
    JCRService jcrService = kernel.getService(JCRService.class);
    jcrService.loginSystem();
    JCRNodeFactoryService jcrNodeFactoryService = kernel.getServiceManager()
        .getService(new ServiceSpec(JCRNodeFactoryService.class));
    jcrNodeFactoryService.createFile("/test/testfile.txt",
        RestProvider.CONTENT_TYPE);
    String content = "some content";
    ByteArrayInputStream bais = new ByteArrayInputStream(content
        .getBytes("UTF-8"));
    jcrNodeFactoryService.setInputStream("/test/testfile.txt", bais,
        RestProvider.CONTENT_TYPE).getSession().save();

    jcrService.logout();

    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);

    HttpSession session = setupSession(request, response);
    replay(request, response, session);
    JCRDumper dumper = new JCRDumper(jcrService);
    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testDumper");
    dumper.doHead(srequest, sresponse);
    cacheManagerService.unbind(CacheScope.REQUEST);
    verify(request, response, session);
  }

  @Test
  public void testDumper4() throws ServletException, IOException,
      JCRNodeFactoryServiceException, RepositoryException, ItemExistsException,
      ConstraintViolationException, InvalidItemStateException,
      ReferentialIntegrityException, VersionException, LockException,
      NoSuchNodeTypeException, RepositoryException {

    // create a node and populate it with some content
    JCRService jcrService = kernel.getService(JCRService.class);
    jcrService.loginSystem();
    JCRNodeFactoryService jcrNodeFactoryService = kernel.getServiceManager()
        .getService(new ServiceSpec(JCRNodeFactoryService.class));
    jcrNodeFactoryService.createFile("/test/testfile.txt",
        RestProvider.CONTENT_TYPE);
    String content = "some content";
    ByteArrayInputStream bais = new ByteArrayInputStream(content
        .getBytes("UTF-8"));
    jcrNodeFactoryService.setInputStream("/test/testfile.txt", bais,
        RestProvider.CONTENT_TYPE).getSession().save();

    jcrService.logout();

    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);

    HttpSession session = setupSession(request, response);
    replay(request, response, session);
    JCRDumper dumper = new JCRDumper(jcrService);

    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testDumper");
    dumper.doPost(srequest, sresponse);
    cacheManagerService.unbind(CacheScope.REQUEST);
    verify(request, response, session);
  }

  @Test
  public void testDumper5() throws ServletException, IOException,
      JCRNodeFactoryServiceException, RepositoryException, ItemExistsException,
      ConstraintViolationException, InvalidItemStateException,
      ReferentialIntegrityException, VersionException, LockException,
      NoSuchNodeTypeException, RepositoryException {

    // create a node and populate it with some content
    JCRService jcrService = kernel.getService(JCRService.class);
    jcrService.loginSystem();
    JCRNodeFactoryService jcrNodeFactoryService = kernel.getServiceManager()
        .getService(new ServiceSpec(JCRNodeFactoryService.class));
    jcrNodeFactoryService.createFile("/test/testfile.txt",
        RestProvider.CONTENT_TYPE);
    String content = "some content";
    ByteArrayInputStream bais = new ByteArrayInputStream(content
        .getBytes("UTF-8"));
    jcrNodeFactoryService.setInputStream("/test/testfile.txt", bais,
        RestProvider.CONTENT_TYPE).getSession().save();

    jcrService.logout();

    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);

    HttpSession session = setupSession(request, response);
    replay(request, response, session);
    JCRDumper dumper = new JCRDumper(jcrService);

    SakaiServletRequest srequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse sresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(srequest);
    authzResolverService.setRequestGrant("testDumper");
    dumper.doPut(srequest, sresponse);
    cacheManagerService.unbind(CacheScope.REQUEST);
    verify(request, response, session);

  }


  /**
   * @param request
   * @return
   */
  private HttpSession setupSession(HttpServletRequest request,
      HttpServletResponse response) {
    String sessionID = String.valueOf(System.currentTimeMillis());
    HttpSession session = EasyMock.createMock(HttpSession.class);
    expect(request.getSession()).andReturn(session).anyTimes();
    expect(request.getSession(true)).andReturn(session).anyTimes();
    expect(request.getSession(false)).andReturn(session).anyTimes();
    expect(session.getId()).andReturn(sessionID).anyTimes();
    expect(session.getAttribute("_u")).andReturn(new User() {

      /**
       * 
       */
      private static final long serialVersionUID = 7290438384479962190L;

      public String getUuid() {
        return "admin";
      }

    }).anyTimes();

    expect(request.getAttribute("_no_session")).andReturn(null).anyTimes();
    expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
    expect(session.getAttribute("_uu")).andReturn("admin").anyTimes();

    expect(request.getRequestedSessionId()).andReturn(sessionID).anyTimes();
    expect(session.getAttribute("check-valid")).andReturn(null).anyTimes(); // indicates
    // that
    // the
    // session
    // is
    // in
    // the
    // session
    // map
    // .
    Cookie cookie = new Cookie("SAKAIID", sessionID);
    expect(request.getCookies()).andReturn(new Cookie[] { cookie }).anyTimes();
    response.addCookie((Cookie) anyObject());
    expectLastCall().anyTimes();

    return session;
  }

}
