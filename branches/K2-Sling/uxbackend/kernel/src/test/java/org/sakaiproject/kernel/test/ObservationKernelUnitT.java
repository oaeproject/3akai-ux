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
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

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
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.SubjectPermissions;
import org.sakaiproject.kernel.api.authz.UserSubjects;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.SakaiJCRCredentials;
import org.sakaiproject.kernel.model.SubjectPermissionBean;
import org.sakaiproject.kernel.model.UserEnvironmentBean;
import org.sakaiproject.kernel.session.SessionImpl;
import org.sakaiproject.kernel.util.PathUtils;
import org.sakaiproject.kernel.util.ResourceLoader;
import org.sakaiproject.kernel.webapp.test.InternalUser;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
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
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Test the observation mechanism. With a sample user env and a sample group.
 */
public class ObservationKernelUnitT extends KernelIntegrationBase {

  private static final Log LOG = LogFactory.getLog(ObservationKernelUnitT.class);
  private static final String[] USERS = {"admin", "ib236"};
  private static final String TEST_USERENV = "res://org/sakaiproject/kernel/test/sampleuserenv/";
  private static final String TEST_GROUPENV = "res://org/sakaiproject/kernel/test/samplegroup/";
  private static final String[] GROUPS = {"group1"};
  private static boolean shutdown;

  @BeforeClass
  public static void beforeThisClass() throws ComponentActivatorException,
      RepositoryException, JCRNodeFactoryServiceException, IOException,
      InterruptedException {
    shutdown = KernelIntegrationBase.beforeClass();

    // get some services

    KernelManager km = new KernelManager();
    Kernel kernel = km.getKernel();
    AuthzResolverService authzResolverService = kernel
        .getService(AuthzResolverService.class);
    JCRNodeFactoryService jcrNodeFactoryService = kernel
        .getService(JCRNodeFactoryService.class);
    JCRService jcrService = kernel.getService(JCRService.class);
    EntityManager entityManager = kernel.getService(EntityManager.class);

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

      LOG.info("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++Saving "
          + userEnvironmentPath);
      InputStream in = ResourceLoader.openResource(TEST_USERENV + userName + ".json",
          ObservationKernelUnitT.class.getClassLoader());
      Node n = jcrNodeFactoryService.setInputStream(userEnvironmentPath, in,
          RestProvider.CONTENT_TYPE);
      n.setProperty(JCRConstants.ACL_OWNER, userName);
      in.close();
    }

    // add some group definitions in a random place, indexing should happen as a
    // result of events.
    for (String group : GROUPS) {
      String prefix = PathUtils.getUserPrefix(group);
      // imagine this is anywhere on the content system, probably with other
      // items related to the group
      String groupPath = "/somepath" + prefix + "groupdef.json";

      LOG.info("Saving " + groupPath);
      InputStream in = ResourceLoader.openResource(TEST_GROUPENV + group + ".json",
          ObservationKernelUnitT.class.getClassLoader());
      @SuppressWarnings("unused")
      Node n = jcrNodeFactoryService.setInputStream(groupPath, in,
          RestProvider.CONTENT_TYPE);
      in.close();
    }

    session.save();
    jcrService.logout();
    // clear the security bypass
    authzResolverService.clearRequestGrant();

    Query query = entityManager.createNamedQuery(SubjectPermissionBean.FINDBY_GROUP);
    int n = 0;
    while (n < GROUPS.length) {
      n = 0;
      for (String group : GROUPS) {
        query.setParameter(SubjectPermissionBean.PARAM_GROUP, group);
        List<?> subjectPermissionList = query.getResultList();
        if (subjectPermissionList.size() > 0) {
          LOG.info("Found "+group);
          n++;
        } else {
          LOG.info("Missing "+group);
        }
      }
      if ( n < GROUPS.length ) {
        Thread.sleep(500);
      }
    }

    // pause untill the subjects appear.
  }

  @AfterClass
  public static void afterClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  @Test
  public void testUserEnv() throws JCRNodeFactoryServiceException, UpdateFailedException,
      AccessDeniedException, ItemExistsException, ConstraintViolationException,
      InvalidItemStateException, ReferentialIntegrityException, VersionException,
      LockException, NoSuchNodeTypeException, RepositoryException {

    LOG
        .info("Starting Test ==================================================== testCheck");
    KernelManager km = new KernelManager();
    UserEnvironmentResolverService userEnvironmentResolverService = km
        .getService(UserEnvironmentResolverService.class);
    assertNotNull(userEnvironmentResolverService);
    SessionManagerService sessionManagerService = km
        .getService(SessionManagerService.class);
    UserResolverService userResolverService = km.getService(UserResolverService.class);

    assertNotNull(sessionManagerService);

    HttpServletRequest request = EasyMock.createMock(HttpServletRequest.class);
    HttpServletResponse response = EasyMock.createMock(HttpServletResponse.class);
    HttpSession session = EasyMock.createMock(HttpSession.class);

    setupRequest(request, response, session, "ib236");
    replay(request, response, session);
    startRequest(request, response, "JSESSION", userResolverService);

    UserEnvironment userEnvironment = userEnvironmentResolverService
        .resolve(sessionManagerService.getCurrentSession());
    assertNotNull(userEnvironment);
    assertEquals("ib236", userEnvironment.getUser().getUuid());
    assertFalse(userEnvironment.hasExpired());

    UserEnvironmentBean userEnvironmentBean = (UserEnvironmentBean) userEnvironment;
    String[] subjects = userEnvironmentBean.getSubjects();
    assertNotNull(subjects);
    assertEquals(4, subjects.length);

    UserSubjects subjectsBean = userEnvironmentBean.getUserSubjects();
    for (String subject : subjects) {
      SubjectPermissions sp = subjectsBean.getSubjectPermissions(subject);

      assertNotNull("Loading " + subject + " gave null", sp);
      assertEquals(subject, sp.getSubjectToken());

      assertFalse(sp.hasPermission("dummypermission"));
      if ("group1:maintain".equals(subject) || "group1:access".equals(subject)) {
        assertTrue(subject + " is missing read", sp.hasPermission("read"));
      } else {
        assertFalse(subject + " should not have had read ", sp.hasPermission("read"));
      }
    }

    endRequest();
    verify(request, response, session);

    reset(request, response, session);

    setupRequest(request, response, session, "admin");
    replay(request, response, session);
    startRequest(request, response, "JSESSION", userResolverService);

    userEnvironment = userEnvironmentResolverService.resolve(sessionManagerService
        .getCurrentSession());
    assertNotNull(userEnvironment);
    assertEquals("admin", userEnvironment.getUser().getUuid());
    assertFalse(userEnvironment.hasExpired());
    userEnvironmentBean = (UserEnvironmentBean) userEnvironment;
    subjects = userEnvironmentBean.getSubjects();
    assertNotNull(subjects);
    assertEquals(0, subjects.length);

    endRequest();
    verify(request, response, session);

    LOG
        .info("Completed Test ==================================================== testCheck ");
  }

  /**
   * @param request
   * @param response
   * @param session
   */
  private void setupRequest(HttpServletRequest request, HttpServletResponse response,
      HttpSession session, String userName) {
    Random r = new Random();
    long sessionID = r.nextLong();
    User u = new InternalUser(userName);
    expect(request.getRemoteUser()).andReturn(userName).anyTimes();
    expect(request.getSession()).andReturn(session).anyTimes();
    expect(request.getSession(true)).andReturn(session).anyTimes();
    expect(request.getSession(false)).andReturn(session).anyTimes();
    expect(session.getId()).andReturn(userName + "SESSIONID-123" + sessionID).anyTimes();
    expect(request.getRequestedSessionId()).andReturn(
        userName + "SESSIONID-123" + sessionID).anyTimes();
    Cookie cookie = new Cookie("SAKAIID", "SESSIONID-123" + sessionID);
    expect(request.getCookies()).andReturn(new Cookie[] {cookie}).anyTimes();
    expect(session.getAttribute(SessionImpl.USER)).andReturn(u).anyTimes();
    response.addCookie((Cookie) anyObject());
    expectLastCall().anyTimes();
    expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
    expect(request.getAttribute("_no_session")).andReturn(null).anyTimes();
  }

}
