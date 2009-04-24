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

import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.inject.Injector;

import net.sf.json.JSONObject;

import org.easymock.Capture;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.Activator;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.site.SiteException;
import org.sakaiproject.kernel.model.RoleBean;
import org.sakaiproject.kernel.model.SiteBean;
import org.sakaiproject.kernel.rest.RestSiteProvider;
import org.sakaiproject.kernel.test.KernelIntegrationBase;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.servlet.ServletException;

/**
 * Unit tests for the RestSiteProvider
 */
public class RestSiteProviderKernelUnitT extends BaseRestUnitT {

  private static boolean shutdown;
  private static Injector injector;

  @BeforeClass
  public static void beforeThisClass() throws ComponentActivatorException {
    shutdown = KernelIntegrationBase.beforeClass();
    injector = Activator.getInjector();
  }

  @AfterClass
  public static void afterThisClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  private RestSiteProvider rsp;

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.rest.test.BaseRestUnitT#setupServices()
   */
  @Override
  public void setupServices() {
    // TODO Auto-generated method stub
    super.setupServices();
    rsp = new RestSiteProvider(registryService, siteService, injector
        .getInstance(BeanConverter.class), userEnvironmentResolverService,
        sessionManagerService);

    assertFalse(jcrService.hasActiveSession());

  }

  @Test
  public void testCheckId() {
  }

  /**
   * Check 409 on already exists
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testCreateAlreadyExists() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("admin", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    expect(request.getParameter("id")).andReturn("sitethatexists");
    expect(siteService.siteExists("sitethatexists")).andReturn(true);
    response.reset();
    expectLastCall();
    response.sendError(409);
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "create" };

    rsp.dispatch(elements, request, response);

    verifyMocks();
  }

  /**
   * Check create works.
   *
   * @throws ServletException
   * @throws IOException
   * @throws SiteException
   */
  @Test
  public void testCreate() throws ServletException, IOException, SiteException {

    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("admin", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    expect(request.getParameter("id")).andReturn("sitethatdoesnotexist");
    expect(siteService.siteExists("sitethatdoesnotexist")).andReturn(false);
    expect(request.getParameter("name")).andReturn("Name:sitethatdoesnotexist");
    expect(request.getParameter("description")).andReturn(
        "Description:sitethatdoesnotexist");
    expect(request.getParameter("type")).andReturn("Type:sitethatdoesnotexist");
    Capture<String> sitePath = new Capture<String>();
    Capture<String> siteType = new Capture<String>();
    SiteBean siteBean = new SiteBean();
    expect(siteService.createSite(capture(sitePath), capture(siteType)))
        .andReturn(siteBean);
    expectLastCall();
    response.setContentType("text/plain");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "create" };

    rsp.dispatch(elements, request, response);

    String body = new String(baos.toByteArray(), "UTF-8");
    assertEquals("{\"response\":\"OK\"}", body);

    assertTrue(sitePath.hasCaptured());
    assertTrue(siteType.hasCaptured());
    assertEquals("sitethatdoesnotexist", sitePath.getValue());
    assertEquals("Type:sitethatdoesnotexist", siteType.getValue());
    assertEquals("Name:sitethatdoesnotexist", siteBean.getName());
    assertEquals("Description:sitethatdoesnotexist", siteBean.getDescription());
    assertNotNull(siteBean.getOwners());
    assertEquals(1, siteBean.getOwners().length);
    assertArrayEquals(new String[] { "admin" }, siteBean.getOwners());
    verifyMocks();
  }

  /**
   * Check for existence of a site by ID
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testCheckIDExists() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    SiteBean siteBean = new SiteBean();
    siteBean.setId("sitethatexists");
    siteBean.setName("name");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    expect(siteService.getSite("sitethatexists")).andReturn(siteBean);

    replayMocks();
    String[] elements = new String[] { "site", "get", "sitethatexists" };

    rsp.dispatch(elements, request, response);

    String body = new String(baos.toByteArray(), "UTF-8");
    JSONObject bodyJson = JSONObject.fromObject(body);
    assertEquals(
        JSONObject
            .fromObject("{\"type\":\"type\",\"subjectTokens\":[\"name:maintain\",\"name:access\"],"
                + "\"roles\":[{\"permissions\":[\"read\",\"write\",\"remove\"],"
                + "\"name\":\"maintain\"},{\"permissions\":[\"read\"],"
                + "\"name\":\"access\"}],\"name\":\"name\",\"id\":\"sitethatexists\"}"),
        bodyJson);

    verifyMocks();
  }

  /**
   * Check for non existance of a site.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testCheckIDDoesNotExists() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(siteService.getSite("sitethatdoesnotexist")).andReturn(null);
    response.reset();
    expectLastCall();
    response.sendError(404);
    expectLastCall();

    replayMocks();
    String[] elements = new String[] { "site", "get", "sitethatdoesnotexist" };

    rsp.dispatch(elements, request, response);

    verifyMocks();
  }

  /**
   * Check for 400 if site id not specific on check.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testCheckIDNoSite() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    response.reset();
    expectLastCall();
    response.sendError(400, "No Site ID specified");
    expectLastCall();

    replayMocks();
    String[] elements = new String[] { "site", "get" };

    rsp.dispatch(elements, request, response);

    verifyMocks();
  }

  /**
   * Checks that for 400 on no site id
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testAddOwnerBadMethod1() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(400, "Site ID Must be specified");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "addOwner" };

    rsp.dispatch(elements, request, response);

    verifyMocks();

  }

  /**
   * Check for 400 o no site id specified for remove.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testRemoveOwnerBadMethod1() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(400, "Site ID Must be specified");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner" };

    rsp.dispatch(elements, request, response);

    verifyMocks();

  }

  /**
   * Check for no user id specified on addOwner.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testAddOwnerBadMethod2() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(400, "User ID Must be specified");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "addOwner",
        "sitethatdoesntexist" };

    rsp.dispatch(elements, request, response);

    verifyMocks();

  }

  /**
   * Check for remove owner with no user ID, should be 400.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testRemoveOwnerBadMethod2() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(400, "User ID Must be specified");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner",
        "sitethatdoesntexist" };

    rsp.dispatch(elements, request, response);

    verifyMocks();

  }

  /**
   * Check for a 401 on anon add owner.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testAddOwnerAnon() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes(null, baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(401);
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "addOwner",
        "sitethatdoesntexist", "auser" };

    rsp.dispatch(elements, request, response);

    verifyMocks();

  }

  /**
   * Check for a 401 on anon create site.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testCreateSiteAnon() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes(null, baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(401);
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "create" };

    rsp.dispatch(elements, request, response);

    verifyMocks();

  }

  /**
   * check for a bad method on create. (should be POST only)
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testBadMethodAnon1() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes(null, baos);

    expect(request.getMethod()).andReturn("GET").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(405);
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "create" };

    rsp.dispatch(elements, request, response);

    verifyMocks();

  }

  /**
   * Check for a bad method on addOwner should be POST only.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testBadMethodAnon2() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes(null, baos);

    expect(request.getMethod()).andReturn("GET").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(405);
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "addOwner" };

    rsp.dispatch(elements, request, response);

    verifyMocks();

  }

  /**
   * Check for a bad method on remove Owner should be POST only.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testBadMethodAnon3() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes(null, baos);

    expect(request.getMethod()).andReturn("GET").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(405);
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner" };

    rsp.dispatch(elements, request, response);

    verifyMocks();

  }

  /**
   * Test for 401 on anon remove owner.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testRemoveOwnerAnon() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes(null, baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    // check for a bad method
    response.reset();
    expectLastCall();
    response.sendError(401);
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner" };

    rsp.dispatch(elements, request, response);

    verifyMocks();
  }

  /**
   * Test for remove owner OK from list of 2.
   *
   * @throws ServletException
   * @throws IOException
   * @throws SiteException
   */
  @Test
  public void testRemoveOwnerOK() throws ServletException, IOException,
      SiteException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1", "user2" });
    siteBean.service(siteService);
    expect(siteService.getSite("testSiteA")).andReturn(siteBean);
    Capture<SiteBean> siteBeanCapture = new Capture<SiteBean>();
    siteService.save(capture(siteBeanCapture));

    response.setContentType("text/plain");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner", "testSiteA",
        "user2" };

    rsp.dispatch(elements, request, response);

    assertTrue(siteBeanCapture.hasCaptured());
    SiteBean finalSiteBean = siteBeanCapture.getValue();
    assertNotNull(finalSiteBean.getOwners());
    assertArrayEquals(new String[] { "user1" }, finalSiteBean.getOwners());

    verifyMocks();
  }

  /**
   * Test fore remove owner from a list of 3 middle one removed.
   *
   * @throws ServletException
   * @throws IOException
   * @throws SiteException
   */
  @Test
  public void testRemoveOwnerOK2() throws ServletException, IOException,
      SiteException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1", "user2", "user5" });
    siteBean.service(siteService);
    expect(siteService.getSite("testSiteA")).andReturn(siteBean);
    Capture<SiteBean> siteBeanCapture = new Capture<SiteBean>();
    siteService.save(capture(siteBeanCapture));

    response.setContentType("text/plain");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner", "testSiteA",
        "user2" };

    rsp.dispatch(elements, request, response);

    assertTrue(siteBeanCapture.hasCaptured());
    SiteBean finalSiteBean = siteBeanCapture.getValue();
    assertNotNull(finalSiteBean.getOwners());
    assertArrayEquals(new String[] { "user1", "user5" }, finalSiteBean
        .getOwners());

    verifyMocks();
  }

  /**
   * test for remove owner no change.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testRemoveOwnerNoChange() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1", "user2", "user5" });
    expect(siteService.getSite("testSiteA")).andReturn(siteBean);

    response.reset();
    expectLastCall();
    response.sendError(404, "User user8 is not an owner of testSiteA");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner", "testSiteA",
        "user8" };

    rsp.dispatch(elements, request, response);

    verifyMocks();
  }

  /**
   * test for 404 on remove with non existant site.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testRemoveOwnerNoSite() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    expect(siteService.getSite("testSiteA")).andReturn(null);

    response.reset();
    expectLastCall();
    response.sendError(404, "Site testSiteA not found");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner", "testSiteA",
        "user8" };

    rsp.dispatch(elements, request, response);

    verifyMocks();
  }

  /**
   * Test for 403 on non owner remove site attempt.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testRemoveOwnerNotOwner() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1notowner", "user2", "user5" });
    expect(siteService.getSite("testSiteA")).andReturn(siteBean);

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner", "testSiteA",
        "user2" };

    try {
      rsp.dispatch(elements, request, response);
      fail();
    } catch (SecurityException ex) {
      assertEquals("Not an owner of this site testSiteA", ex.getMessage());
    }

    verifyMocks();
  }

  /**
   * Test for 403 on remove last owner.
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testRemoveOwnerTooFew() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1" });
    expect(siteService.getSite("testSiteA")).andReturn(siteBean);

    replayMocks();

    String[] elements = new String[] { "site", "removeOwner", "testSiteA",
        "user1" };

    try {
      rsp.dispatch(elements, request, response);
      fail();
    } catch (SecurityException ex) {
      assertEquals("A site must have at least one owner ", ex.getMessage());
    }

    verifyMocks();
  }

  /**
   * Test for add when not owner 403
   *
   * @throws ServletException
   * @throws IOException
   */
  @Test
  public void testaddOwnerNotOwner() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1notowner", "user2", "user5" });
    expect(siteService.getSite("testSiteA")).andReturn(siteBean);

    replayMocks();

    String[] elements = new String[] { "site", "addOwner", "testSiteA", "user2" };

    try {
      rsp.dispatch(elements, request, response);
      fail();
    } catch (SecurityException ex) {
      assertEquals("Not an owner of this site testSiteA", ex.getMessage());
    }
    verifyMocks();
  }

  @Test
  public void testAddOwnerOK() throws ServletException, IOException,
      SiteException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1" });
    siteBean.service(siteService);

    expect(siteService.getSite("testSiteA")).andReturn(siteBean);
    Capture<SiteBean> siteBeanCapture = new Capture<SiteBean>();
    siteService.save(capture(siteBeanCapture));

    response.setContentType("text/plain");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "addOwner", "testSiteA", "user2" };

    rsp.dispatch(elements, request, response);

    assertTrue(siteBeanCapture.hasCaptured());
    SiteBean finalSiteBean = siteBeanCapture.getValue();
    assertNotNull(finalSiteBean.getOwners());
    assertArrayEquals(new String[] { "user1", "user2" }, finalSiteBean
        .getOwners());

    verifyMocks();
  }

  @Test
  public void testAddOwnerOK2() throws ServletException, IOException,
      SiteException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1", "user5" });
    siteBean.service(siteService);

    expect(siteService.getSite("testSiteA")).andReturn(siteBean);
    Capture<SiteBean> siteBeanCapture = new Capture<SiteBean>();
    siteService.save(capture(siteBeanCapture));

    response.setContentType("text/plain");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "addOwner", "testSiteA", "user2" };

    rsp.dispatch(elements, request, response);

    assertTrue(siteBeanCapture.hasCaptured());
    SiteBean finalSiteBean = siteBeanCapture.getValue();
    assertNotNull(finalSiteBean.getOwners());
    assertArrayEquals(new String[] { "user1", "user5", "user2" }, finalSiteBean
        .getOwners());

    verifyMocks();
  }

  @Test
  public void testAddOwnerNoChange() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1", "user2", "user5" });
    expect(siteService.getSite("testSiteA")).andReturn(siteBean);

    response.reset();
    expectLastCall();
    response.sendError(409, "User user2 is already an owner of testSiteA");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "addOwner", "testSiteA", "user2" };

    rsp.dispatch(elements, request, response);

    verifyMocks();
  }

  @Test
  public void testaddOwnerNoSite() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    expect(siteService.getSite("testSiteA")).andReturn(null);

    response.reset();
    expectLastCall();
    response.sendError(404, "Site testSiteA not found");
    expectLastCall();

    replayMocks();

    String[] elements = new String[] { "site", "addOwner", "testSiteA", "user8" };

    rsp.dispatch(elements, request, response);

    verifyMocks();
  }

  @Test
  public void testAddOwnerNotOwner() throws ServletException, IOException {
    setupServices();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);

    expect(request.getMethod()).andReturn("POST").anyTimes();
    SiteBean siteBean = new SiteBean();
    siteBean.setId("testSiteA");
    siteBean.setName("name: testSiteA");
    siteBean.setType("type");
    siteBean.setRoles(new RoleBean[] {
        new RoleBean("maintain", new String[] { "read", "write", "remove" }),
        new RoleBean("access", new String[] { "read" }) });
    siteBean.setOwners(new String[] { "user1notowner", "user2", "user5" });
    expect(siteService.getSite("testSiteA")).andReturn(siteBean);

    replayMocks();

    String[] elements = new String[] { "site", "addOwner", "testSiteA", "user2" };

    try {
      rsp.dispatch(elements, request, response);
    } catch (SecurityException ex) {
      assertEquals("Not an owner of this site testSiteA", ex.getMessage());
    }
    verifyMocks();
  }
}
