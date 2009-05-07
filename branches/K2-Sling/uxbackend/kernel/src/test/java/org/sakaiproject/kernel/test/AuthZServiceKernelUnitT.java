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
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.fail;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.easymock.EasyMock;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.UpdateFailedException;
import org.sakaiproject.kernel.api.authz.AccessControlStatement;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionDeniedException;
import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.authz.ReferencedObject;
import org.sakaiproject.kernel.api.authz.SubjectStatement;
import org.sakaiproject.kernel.api.authz.SubjectStatement.SubjectType;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.authz.simple.JcrAccessControlStatementImpl;
import org.sakaiproject.kernel.authz.simple.JcrSubjectStatement;
import org.sakaiproject.kernel.authz.simple.SimplePermissionQuery;
import org.sakaiproject.kernel.authz.simple.SimpleQueryStatement;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.SakaiJCRCredentials;
import org.sakaiproject.kernel.session.SessionImpl;
import org.sakaiproject.kernel.util.PathUtils;
import org.sakaiproject.kernel.util.ResourceLoader;
import org.sakaiproject.kernel.webapp.test.InternalUser;

import java.io.IOException;
import java.io.InputStream;
import java.util.Random;

import javax.jcr.AccessDeniedException;
import javax.jcr.InvalidItemStateException;
import javax.jcr.ItemExistsException;
import javax.jcr.Node;
import javax.jcr.ReferentialIntegrityException;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.nodetype.NoSuchNodeTypeException;
import javax.jcr.version.VersionException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * 
 */
public class AuthZServiceKernelUnitT extends KernelIntegrationBase {

  private static final Log LOG = LogFactory
      .getLog(AuthZServiceKernelUnitT.class);
  private static final String[] USERS = { "admin", "ib236" };
  private static final String TEST_USERENV = "res://org/sakaiproject/kernel/test/sampleuserenv/";
  private static final String TEST_GROUPENV = "res://org/sakaiproject/kernel/test/samplegroup/";
  private static final String[] GROUPS = { "group1" };
  private static boolean shutdown;

  @BeforeClass
  public static void beforeThisClass() throws ComponentActivatorException,
      RepositoryException, JCRNodeFactoryServiceException, IOException {
    shutdown = KernelIntegrationBase.beforeClass();
    // get some services

    KernelManager km = new KernelManager();
    Kernel kernel = km.getKernel();
    AuthzResolverService authzResolverService = kernel
        .getService(AuthzResolverService.class);
    JCRNodeFactoryService jcrNodeFactoryService = kernel
        .getService(JCRNodeFactoryService.class);
    JCRService jcrService = kernel.getService(JCRService.class);

    // bypass security
    authzResolverService.setRequestGrant("Populating Test JSON");

    // login to the repo with super admin
    SakaiJCRCredentials credentials = new SakaiJCRCredentials();
    Session session = jcrService.getRepository().login(credentials);
    jcrService.setSession(session);

    // setup the user environment for the admin user.
    for (String userName : USERS) {
      String prefix = PathUtils.getUserPrefix(userName);
      String userEnvironmentPath = "/userenv" + prefix + "userenv";

      LOG.info("Saving " + userEnvironmentPath);
      InputStream in = ResourceLoader.openResource(TEST_USERENV + userName
          + ".json", AuthZServiceKernelUnitT.class.getClassLoader());
      @SuppressWarnings("unused")
      Node n = jcrNodeFactoryService.setInputStream(userEnvironmentPath, in,
          RestProvider.CONTENT_TYPE);
      session.save();
      in.close();
    }

    // add some group definitions in a random place, indexing should happen as
    // a result of events.
    for (String group : GROUPS) {
      String prefix = PathUtils.getUserPrefix(group);
      // imagine this is anywhere on the content system, probably with other
      // items related to the group
      String groupPath = "/somepath" + prefix + "groupdef.json";

      LOG.info("Saving " + groupPath);
      InputStream in = ResourceLoader.openResource(TEST_GROUPENV + group
          + ".json", AuthZServiceKernelUnitT.class.getClassLoader());
      @SuppressWarnings("unused")
      Node n = jcrNodeFactoryService.setInputStream(groupPath, in,
          RestProvider.CONTENT_TYPE);
      session.save();
      in.close();
    }

    jcrService.logout();

    // clear the security bypass
    authzResolverService.clearRequestGrant();
  }

  @AfterClass
  public static void afterClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  @Test
  public void testCheck() throws JCRNodeFactoryServiceException,
      UpdateFailedException, AccessDeniedException, ItemExistsException,
      ConstraintViolationException, InvalidItemStateException,
      ReferentialIntegrityException, VersionException, LockException,
      NoSuchNodeTypeException, RepositoryException {

    LOG
        .info("Starting Test ==================================================== testCheck");
    KernelManager km = new KernelManager();
    AuthzResolverService authzResolver = km
        .getService(AuthzResolverService.class);
    ReferenceResolverService referenceResolverService = km
        .getService(ReferenceResolverService.class);
    PermissionQueryService pqs = km.getService(PermissionQueryService.class);
    PermissionQuery pq = pqs.getPermission("GET");

    UserResolverService userResolverService = km
        .getService(UserResolverService.class);

    HttpServletRequest request = EasyMock.createMock(HttpServletRequest.class);
    HttpServletResponse response = EasyMock
        .createMock(HttpServletResponse.class);
    HttpSession session = EasyMock.createMock(HttpSession.class);

    setupRequest(request, response, session, "ib236");
    replay(request, response, session);
    startRequest(request, response, "JSESSION", userResolverService);

    try {
      authzResolver.check("/x/y/z", pq);
      // no AuthZ exists, so assume it should generate a permission denied
      // exception.
      fail();
    } catch (PermissionDeniedException e) {
    }

    endRequest();
    verify(request, response, session);

    reset(request, response, session);

    setupRequest(request, response, session, "admin");
    replay(request, response, session);
    startRequest(request, response, "JSESSION", userResolverService);

    JCRNodeFactoryService jcrNodeFactory = km
        .getService(JCRNodeFactoryService.class);
    Node n = jcrNodeFactory.createFile("/test/a/b/c/d.txt",
        RestProvider.CONTENT_TYPE);
    n.getSession().save();

    ReferencedObject ro = referenceResolverService.resolve("/test/a/b/c/d.txt");
    ReferencedObject parent = ro.getParent();
    parent = parent.getParent();

    // create an ACL at the parent that will allow those read permission in
    // group1:maintain to perform httpget, make it apply ot all subnodes
    SubjectStatement subjectStatement = new JcrSubjectStatement(
        SubjectType.GR, "group1:maintain", "read");
    AccessControlStatement grantReadToHttpGetInheritable = new JcrAccessControlStatementImpl(
        subjectStatement, "httpget", true, true);
    parent.addAccessControlStatement(grantReadToHttpGetInheritable);

    SimplePermissionQuery permissionQuery = new SimplePermissionQuery(
        "checkhttpget");
    permissionQuery.addQueryStatement(new SimpleQueryStatement("httpget"));
    authzResolver.check("/test/a/b/c/d.txt", permissionQuery);

    endRequest();
    verify(request, response, session);

    LOG
        .info("Completed Test ==================================================== testCheck ");
  }

  @Test
  public void testRequestGrant() {
    LOG
        .info("Starting Test ==================================================== testRequestGrant ");
    KernelManager km = new KernelManager();
    AuthzResolverService authzResolver = km
        .getService(AuthzResolverService.class);
    PermissionQueryService pqs = km.getService(PermissionQueryService.class);
    PermissionQuery pq = pqs.getPermission("GET");

    UserResolverService userResolverService = km
        .getService(UserResolverService.class);

    HttpServletRequest request = EasyMock.createMock(HttpServletRequest.class);
    HttpServletResponse response = EasyMock
        .createMock(HttpServletResponse.class);
    HttpSession session = EasyMock.createMock(HttpSession.class);

    setupRequest(request, response, session, "ib236-testRequestGrant");
    replay(request, response, session);
    startRequest(request, response, "JSESSION", userResolverService);

    authzResolver.setRequestGrant("Testing Request Grant");
    // Though the AuthZ doesn't exist it should be granted
    authzResolver.check("/x/y/z", pq);

    authzResolver.clearRequestGrant();
    // Now it should fail since the AuthZ doesn't exist
    try {
      authzResolver.check("/x/y/z", pq);
      fail();
    } catch (PermissionDeniedException e) {
    }

    endRequest();
    verify(request, response, session);

    reset(request, response, session);
  }

  /**
   * @param request
   * @param response
   * @param session
   */
  private void setupRequest(HttpServletRequest request,
      HttpServletResponse response, HttpSession session, String userName) {
    User u = new InternalUser(userName);
    Random r = new Random();
    long sessionID = r.nextLong();
    expect(request.getRemoteUser()).andReturn(userName).anyTimes();
    expect(request.getSession()).andReturn(session).anyTimes();
    expect(request.getSession(true)).andReturn(session).anyTimes();
    expect(request.getSession(false)).andReturn(session).anyTimes();
    expect(session.getId()).andReturn(userName + "SESSIONID-123-A" + sessionID)
        .anyTimes();
    expect(request.getRequestedSessionId()).andReturn(
        userName + "SESSIONID-123-A" + sessionID).anyTimes();
    Cookie cookie = new Cookie("SAKAIID", "SESSIONID-123-A" + sessionID);
    expect(request.getCookies()).andReturn(new Cookie[] { cookie }).anyTimes();

    expect(session.getAttribute("check-valid")).andReturn(null).anyTimes();
    response.addCookie((Cookie) anyObject());
    expectLastCall().anyTimes();

    expect(session.getAttribute(SessionImpl.USER)).andReturn(u).anyTimes();
    expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
    expect(request.getAttribute("_no_session")).andReturn(null).anyTimes();
  }

}
