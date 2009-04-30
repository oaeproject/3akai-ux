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
package org.sakaiproject.kernel.rest.site;

import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import com.google.common.collect.ImmutableMap;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.easymock.Capture;
import org.jboss.resteasy.specimpl.MultivaluedMapImpl;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.kernel.api.site.SiteException;
import org.sakaiproject.kernel.model.SiteBean;
import org.sakaiproject.kernel.rest.test.BaseRestUT;
import org.sakaiproject.kernel.util.rest.CollectionOptions;
import org.sakaiproject.kernel.util.rest.CollectionOptions.FilterOption;
import org.sakaiproject.kernel.util.rest.CollectionOptions.SortOption;
import org.sakaiproject.kernel.util.rest.CollectionOptions.SortOrder;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MultivaluedMap;

/**
 *
 */
public class SiteProviderTest extends BaseRestUT {

  private static final Log LOG = LogFactory.getLog(SiteProviderTest.class);
  private SiteProvider siteProvider;

  /**
   * @throws java.lang.Exception
   */
  @Before
  public void setUp() throws Exception {
    setupServices();
    newSession();
    createProvider();
  }

  /**
   * @throws java.lang.Exception
   */
  @After
  public void tearDown() throws Exception {
  }

  @Test
  public void testCreateNoUser() throws IOException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes(null, baos);
    replayMocks();

    try {
      siteProvider.createSite("/testsite/in/some/location", "project", "My New Site",
          "A Short description", null, null);
      fail();
    } catch (WebApplicationException ex) {
      LOG.info("OK");
    }
    verifyMocks();

  }

  @Test
  public void testCreateDenied() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("user1", baos);
    PermissionQuery createSiteQuery = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("create.site")).andReturn(createSiteQuery);
    authzResolverService.check("/testsite/in/some/location", createSiteQuery);
    expectLastCall().andThrow(new SecurityException());
    replayMocks();

    try {
      siteProvider.createSite("/testsite/in/some/location", "project", "My New Site",
          "A Short description", null, null);
      fail();
    } catch (WebApplicationException ex) {
      LOG.info("OK");
    }

    verifyMocks();

  }

  @Test
  public void testCreate() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    PermissionQuery createSiteQuery = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("create.site")).andReturn(createSiteQuery);
    authzResolverService.check("/testsite/in/some/location", createSiteQuery);
    expectLastCall();
    authzResolverService.setRequestGrant("Create Site Granted");
    expectLastCall();
    expect(siteService.createSite("/testsite/in/some/location", "project")).andReturn(
        siteBean);
    Capture<String> siteId = new Capture<String>();
    Capture<String> siteUser = new Capture<String>();
    Capture<String> siteMembershipType = new Capture<String>();
    userEnvironmentResolverService.addMembership(capture(siteUser), capture(siteId),
        capture(siteMembershipType));
    expectLastCall();
    siteService.save(siteBean);
    expectLastCall();

    replayMocks();

    siteProvider.createSite("/testsite/in/some/location", "project", "My New Site",
        "A Short description", new String[] {"maintain:read", "maintain:write",
            "maintain:remove", "access:read"}, "access");
    assertEquals("My New Site", siteBean.getName());
    assertEquals("A Short description", siteBean.getDescription());
    assertArrayEquals(new String[] {"admin"}, siteBean.getOwners());
    assertEquals("admin", siteUser.getValue());
    assertEquals("testSiteId", siteId.getValue());
    assertEquals("owner", siteMembershipType.getValue());
    verifyMocks();

  }

  @Test
  public void testGetSite() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    expect(siteService.getSite("/testsite/in/some/location")).andReturn(siteBean);
    expect(beanConverter.convertToString(siteBean)).andReturn("OK");
    replayMocks();

    String response = siteProvider.getSite("/testsite/in/some/location");
    assertEquals("OK", response);
    verifyMocks();

  }

  @Test
  public void testGetSiteFail() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(false);
    replayMocks();

    try {
      siteProvider.getSite("/testsite/in/some/location");
      fail();
    } catch (WebApplicationException e) {
      assertEquals(404, e.getResponse().getStatus());
    }
    verifyMocks();

  }

  @Test
  public void testAddOwnerNotOwner() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    PermissionQuery writePermission = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("write")).andReturn(writePermission);
    authzResolverService.check("/testsite/in/some/location/.site", writePermission);
    expectLastCall();
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    expect(siteService.getSite("/testsite/in/some/location")).andReturn(siteBean);
    replayMocks(writePermission);

    try {
      siteProvider.addOwner("/testsite/in/some/location", "ieb");
      fail();
    } catch (WebApplicationException e) {
      assertEquals(403, e.getResponse().getStatus());
    }
    verifyMocks(writePermission);

  }

  @Test
  public void testAddOwner() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    siteBean.setOwners(new String[] {"admin"});
    PermissionQuery writePermission = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("write")).andReturn(writePermission);
    authzResolverService.check("/testsite/in/some/location/.site", writePermission);
    expectLastCall();
    authzResolverService.setRequestGrant("add Owner");
    expectLastCall();
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    expect(siteService.getSite("/testsite/in/some/location")).andReturn(siteBean);
    userEnvironmentResolverService.addMembership("ieb", "testSiteId", "owner");
    expectLastCall();
    siteService.save(siteBean);
    expectLastCall();
    authzResolverService.clearRequestGrant();
    expectLastCall();
    replayMocks(writePermission);

    String resp = siteProvider.addOwner("/testsite/in/some/location", "ieb");
    assertEquals("{\"response\", \"OK\"}", resp);
    assertArrayEquals(new String[] {"admin", "ieb"}, siteBean.getOwners());

    verifyMocks(writePermission);
  }

  @Test
  public void testRemoveOwnerNotOwner() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    PermissionQuery writePermission = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("write")).andReturn(writePermission);
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    authzResolverService.check("/testsite/in/some/location/.site", writePermission);
    expectLastCall().andThrow(new SecurityException());
    replayMocks(writePermission);

    try {
      siteProvider.removeOwner("/testsite/in/some/location", "ieb");
      fail();
    } catch (SecurityException e) {
      LOG.debug("OK");
    }
    verifyMocks(writePermission);

  }

  @Test
  public void testRemoveOwner() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    siteBean.setOwners(new String[] {"ieb", "admin"});
    PermissionQuery writePermission = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("write")).andReturn(writePermission);
    authzResolverService.check("/testsite/in/some/location/.site", writePermission);
    expectLastCall();
    authzResolverService.setRequestGrant("remove Owner");
    expectLastCall();
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    expect(siteService.getSite("/testsite/in/some/location")).andReturn(siteBean);
    userEnvironmentResolverService.removeMembership("ieb", "testSiteId", "owner");
    expectLastCall();
    siteService.save(siteBean);
    expectLastCall();
    authzResolverService.clearRequestGrant();
    expectLastCall();
    replayMocks(writePermission);

    String resp = siteProvider.removeOwner("/testsite/in/some/location", "ieb");
    assertEquals("{\"response\", \"OK\"}", resp);
    assertArrayEquals(new String[] {"admin"}, siteBean.getOwners());

    verifyMocks(writePermission);
  }

  @Test
  public void testRemoveLastOwner() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    siteBean.setOwners(new String[] {"admin"});
    PermissionQuery writePermission = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("write")).andReturn(writePermission);
    authzResolverService.check("/testsite/in/some/location/.site", writePermission);
    expectLastCall();
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    expect(siteService.getSite("/testsite/in/some/location")).andReturn(siteBean);
    replayMocks(writePermission);

    try {
      siteProvider.removeOwner("/testsite/in/some/location", "ieb");
      fail();
    } catch (WebApplicationException e) {
      assertEquals(409, e.getResponse().getStatus());
    }

    verifyMocks(writePermission);
  }

  @Test
  public void testAddMemberAnon() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes(null, baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    PermissionQuery writePermission = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("write")).andReturn(writePermission);
    authzResolverService.check("/testsite/in/some/location/.site", writePermission);
    expectLastCall().andThrow(new SecurityException());

    replayMocks(writePermission);

    try {
      siteProvider.addMember("/testsite/in/some/location", new String[] {"ieb", "john",
          "nico"}, new String[] {"access", "maintain", "custom"});
    } catch (SecurityException e) {
      LOG.info("OK");
    }
    verifyMocks(writePermission);

  }

  @Test
  public void testAddMember() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    PermissionQuery writePermission = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("write")).andReturn(writePermission);
    authzResolverService.check("/testsite/in/some/location/.site", writePermission);
    expectLastCall();
    authzResolverService.setRequestGrant("Adding Membership");
    expectLastCall();
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    expect(siteService.getSite("/testsite/in/some/location")).andReturn(siteBean);
    userEnvironmentResolverService.addMembership("ieb", "testSiteId", "access");
    expectLastCall();
    userEnvironmentResolverService.addMembership("john", "testSiteId", "maintain");
    expectLastCall();
    userEnvironmentResolverService.addMembership("nico", "testSiteId", "custom");
    expectLastCall();
    authzResolverService.clearRequestGrant();
    expectLastCall();
    replayMocks(writePermission);

    String resp = siteProvider.addMember("/testsite/in/some/location", new String[] {
        "ieb", "john", "nico"}, new String[] {"access", "maintain", "custom"});
    assertEquals("{\"response\", \"OK\"}", resp);
    verifyMocks(writePermission);

  }

  @Test
  public void testAddMemberBadParams() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    replayMocks();

    try {
      siteProvider.addMember("/testsite/in/some/location", new String[] {"ieb"},
          new String[] {});
    } catch (WebApplicationException e) {
      assertEquals(400, e.getResponse().getStatus());
    }
    verifyMocks();

  }

  @Test
  public void testRemoveMember() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    PermissionQuery writePermission = createMock(PermissionQuery.class);
    expect(permissionQueryService.getPermission("write")).andReturn(writePermission);
    authzResolverService.check("/testsite/in/some/location/.site", writePermission);
    expectLastCall();
    authzResolverService.setRequestGrant("Revoking Membership");
    expectLastCall();
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    expect(siteService.getSite("/testsite/in/some/location")).andReturn(siteBean);
    userEnvironmentResolverService.removeMembership("ieb", "testSiteId", "access");
    expectLastCall();
    authzResolverService.clearRequestGrant();
    expectLastCall();
    replayMocks(writePermission);

    String resp = siteProvider.removeMember("/testsite/in/some/location",
        new String[] {"ieb"}, new String[] {"access"});
    assertEquals("{\"response\", \"OK\"}", resp);
    verifyMocks(writePermission);

  }

  @Test
  public void testRemoveMemberBadParams() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    replayMocks();

    try {
      siteProvider.removeMember("/testsite/in/some/location", new String[] {"ieb"},
          new String[] {});
    } catch (WebApplicationException e) {
      assertEquals(400, e.getResponse().getStatus());
    }
    verifyMocks();

  }

  @Test
  public void testJoin() throws IOException, SiteException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("ieb", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.setJoiningMembership("access");
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    expect(siteService.getSite("/testsite/in/some/location")).andReturn(siteBean);
    userEnvironmentResolverService.addMembership("ieb", "testSiteId", "access");
    expectLastCall();
       
    
    replayMocks();
    String resp = siteProvider.join("/testsite/in/some/location");
    verifyMocks();
    assertEquals("{\"response\", \"OK\"}", resp);

  }

  
  @Test
  public void testUnJoin() throws IOException, SiteException {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("ieb", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.setJoiningMembership("access");
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    expect(siteService.getSite("/testsite/in/some/location")).andReturn(siteBean);
    userEnvironmentResolverService.removeMembership("ieb", "testSiteId", "access");
    expectLastCall();
       
    
    replayMocks();
    String resp = siteProvider.unjoin("/testsite/in/some/location","access");
    verifyMocks();
    assertEquals("{\"response\", \"OK\"}", resp);
  }
  
  @Test
  public void testListMembers() throws IOException, SiteException {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("ieb", baos);
    SiteBean siteBean = new SiteBean();
    siteBean.setJoiningMembership("access");
    siteBean.service(siteService);
    siteBean.setId("testSiteId");
    expect(siteService.siteExists("/testsite/in/some/location")).andReturn(true);
    Capture<CollectionOptions> collectionOptions = new Capture<CollectionOptions>();
    Capture<String> listPath = new Capture<String>();
    Map<String, Object> resultMap = ImmutableMap.of("key", (Object)"value", "key1", "value1");
    expect(siteService.getMemberList(capture(listPath), capture(collectionOptions))).andReturn(resultMap);
    Capture<Map<String,Object>> serviceResponse = new Capture<Map<String,Object>>();
    expect(beanConverter.convertToString(capture(serviceResponse))).andReturn("OK");   
    
    replayMocks();
    MultivaluedMap<String, String> requestMap = new MultivaluedMapImpl<String, String>();
    requestMap.add(CollectionOptions.START_INDEX, String.valueOf(5));
    requestMap.add(CollectionOptions.COUNT, String.valueOf(10));
    requestMap.add(CollectionOptions.SORT_BY, "FirstName");
    requestMap.add(CollectionOptions.SORT_BY, "LastName");
    requestMap.add(CollectionOptions.SORT_ORDER, SortOrder.asc.toString());
    requestMap.add(CollectionOptions.SORT_ORDER, SortOrder.desc.toString());
    requestMap.add(CollectionOptions.FILTER_BY, "FirstName");
    requestMap.add(CollectionOptions.FILTER_BY, "LastName");
    requestMap.add(CollectionOptions.FILTER_OPERATION, "=");
    requestMap.add(CollectionOptions.FILTER_OPERATION, "like");
    requestMap.add(CollectionOptions.FILTER_VALUE, "ian");
    requestMap.add(CollectionOptions.FILTER_VALUE, "bost%");
    
    String resp = siteProvider.list("/testsite/in/some/location");
    assertEquals("OK", resp);
    assertEquals("/testsite/in/some/location", listPath.getValue());
    assertEquals(5, collectionOptions.getValue().getPagingOptions().getStartIndex());
    assertEquals(10, collectionOptions.getValue().getPagingOptions().getCount());
    List<SortOption> sortOptions = collectionOptions.getValue().getSortOptions();
    assertEquals("FirstName", sortOptions.get(0).getField());
    assertEquals(SortOrder.asc, sortOptions.get(0).getDirection());
    assertEquals("LastName", sortOptions.get(1).getField());
    assertEquals(SortOrder.desc, sortOptions.get(1).getDirection());
    List<FilterOption> filterOptions = collectionOptions.getValue().getFilterOptions();
    assertEquals("FirstName", filterOptions.get(0).getFilterBy());
    assertEquals("LastName", filterOptions.get(1).getFilterBy());
    assertEquals("=", filterOptions.get(0).getFilterOp());
    assertEquals("like", filterOptions.get(1).getFilterOp());
    assertEquals("ian", filterOptions.get(0).getFilterValue());
    assertEquals("bost%", filterOptions.get(1).getFilterValue());

    Map<String, Object> response = serviceResponse.getValue();
    assertEquals(response.get("startIndex"), 5);
    assertEquals(response.get("count"), 10);
    
    verifyMocks();
    
    
  }

  @Test
  public void testDocumentation() throws IOException, SiteException {

    replayMocks();
    assertNotNull(siteProvider.getRestDocumentation().toHtml());
    assertNotNull(siteProvider.getRestDocumentation().toJson());
    assertNotNull(siteProvider.getRestDocumentation().toXml());
    verifyMocks();

  }

  /**
   *
   */
  private void createProvider() {
    siteProvider = new SiteProvider(registryService, siteService,
        userEnvironmentResolverService, sessionManagerService, beanConverter,
        authzResolverService, permissionQueryService);
  }

}
