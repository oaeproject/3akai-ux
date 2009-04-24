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
package org.sakaiproject.kernel.rest.friends.test;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import com.google.common.collect.Lists;

import org.easymock.Capture;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.model.FriendsBean;
import org.sakaiproject.kernel.model.FriendsIndexBean;
import org.sakaiproject.kernel.rest.friends.RestFriendsProvider;
import org.sakaiproject.kernel.rest.test.BaseRestUT;
import org.sakaiproject.kernel.util.StringUtils;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import javax.jcr.LoginException;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.persistence.Query;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

/**
 * Unit tests for the RestSiteProvider
 */
public class RestFriendsProviderTest extends BaseRestUT {

  private RestProvider rsp;

  /**
   * Test a bad request
   *
   * @throws ServletException
   * @throws IOException
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   */
  @Test
  public void testBadRequestConnection() throws ServletException, IOException,
      RepositoryException, JCRNodeFactoryServiceException {
    setupServices();

    newSession();
    {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      setupAnyTimes("user1", baos);

      // expect(request.getParameter("friendUuid")).andReturn(null);
      // expect(request.getParameter("message")).andReturn(null);

      replayMocks();
      createProvider();

      String[] elements = new String[] { "friend", "bad", "request" };

      try {
        rsp.dispatch(elements, request, response);
        fail();
      } catch (RestServiceFaultException ex) {
        assertEquals(ex.getStatusCode(), HttpServletResponse.SC_BAD_REQUEST);
      }
      verifyMocks();
    }
    newSession();
    {
      resetMocks();
      // wong path,
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      setupAnyTimes("user1", baos);

      // expect(request.getParameter("friendUuid")).andReturn(null);
      // expect(request.getParameter("message")).andReturn(null);

      replayMocks();
      createProvider();

      String[] elements = new String[] { "friend", "connect" };

      try {
        rsp.dispatch(elements, request, response);
        fail();
      } catch (RestServiceFaultException ex) {
        assertEquals(ex.getStatusCode(), HttpServletResponse.SC_BAD_REQUEST);
      }
      verifyMocks();
    }
    newSession();
    {
      resetMocks();
      // wong path,
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      setupAnyTimes("user1", baos);

      // expect(request.getParameter("friendUuid")).andReturn(null);
      // expect(request.getParameter("message")).andReturn(null);

      replayMocks();
      createProvider();

      String[] elements = new String[] { "friend", "connect", "badpathelement" };

      try {
        rsp.dispatch(elements, request, response);
        fail();
      } catch (RestServiceFaultException ex) {
        assertEquals(ex.getStatusCode(), HttpServletResponse.SC_BAD_REQUEST);
      }
      verifyMocks();
    }
    newSession();
    {
      resetMocks();
      // wong path, too short
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      setupAnyTimes("user1", baos);

      // expect(request.getParameter("friendUuid")).andReturn(null);
      // expect(request.getParameter("message")).andReturn(null);

      replayMocks();
      createProvider();

      String[] elements = new String[] { "friend" };

      try {
        rsp.dispatch(elements, request, response);
        fail();
      } catch (RestServiceFaultException ex) {
        assertEquals(ex.getStatusCode(), HttpServletResponse.SC_BAD_REQUEST);
      }
      verifyMocks();
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.rest.test.BaseRestUnitT#setupServices()
   */
  public void createProvider() {
    rsp = new RestFriendsProvider(registryService, sessionManagerService,
        userEnvironmentResolverService, profileResolverService, entityManager,
        friendsResolverService, userFactoryService, beanConverter, authzResolverService, jcrService);
  }

  /**
   * Test a bad request for a non admin user
   *
   * @throws ServletException
   * @throws IOException
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   */
  @Test
  public void testNonAdminRequestOtherConnection() throws ServletException,
      IOException, RepositoryException, JCRNodeFactoryServiceException {
    setupServices();
    newSession();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("user1", baos);

    // expect(request.getParameter("friendUuid")).andReturn("myfriend");
    // expect(request.getParameter("message")).andReturn("Hi");

    expect(userEnvironment.isSuperUser()).andReturn(false).anyTimes();

    replayMocks();
    createProvider();

    String[] elements = new String[] { "friend", "connect", "request",
        "frienduserid" };

    try {
      rsp.dispatch(elements, request, response);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(ex.getStatusCode(), HttpServletResponse.SC_FORBIDDEN);
    }
    verifyMocks();
  }

  /**
   * Test a bad request for a non admin user
   *
   * @throws ServletException
   * @throws IOException
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   */
  @Test
  public void testAdminRequestOtherConnection() throws ServletException,
      IOException, RepositoryException, JCRNodeFactoryServiceException {
    setupServices();
    newSession();

    expect(userEnvironment.isSuperUser()).andReturn(true).anyTimes();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("admin", baos);
    expect(request.getMethod()).andReturn("POST");

    expect(request.getParameter("friendUuid")).andReturn("MyFriend");
    expect(request.getParameter("friendType")).andReturn(null);
    expect(request.getParameter("friendStatus")).andReturn(null);
    expect(request.getParameter("message")).andReturn("hi");
    expect(request.getParameter("p")).andReturn(null);
    expect(request.getParameter("n")).andReturn(null);
    expect(request.getParameterValues("s")).andReturn(null);
    expect(request.getParameterValues("o")).andReturn(null);

    FriendsBean fb = new FriendsBean(jcrNodeFactoryService, userFactoryService,
        beanConverter, "private");
    FriendsBean myFriend = new FriendsBean(jcrNodeFactoryService,
        userFactoryService, beanConverter, "private");
    expect(friendsResolverService.resolve("frienduserid")).andReturn(fb)
        .anyTimes();
    expect(friendsResolverService.resolve("MyFriend")).andReturn(myFriend)
        .anyTimes();
    expect(userFactoryService.getUserPathPrefix(null)).andReturn("somepath/")
        .anyTimes();
    expect(beanConverter.convertToString(fb)).andReturn("{}").anyTimes();
    expect(beanConverter.convertToString(myFriend)).andReturn("{}").anyTimes();

    authzResolverService.setRequestGrant((String) anyObject());
    expectLastCall().atLeastOnce();
    authzResolverService.clearRequestGrant();
    expectLastCall().atLeastOnce();

    Session session = createMock(Session.class);
   expect(jcrService.getSession()).andReturn(session).anyTimes();

    Node node = createMock(Node.class);
    Capture<InputStream> inputStream = new Capture<InputStream>();
    Capture<String> stringCapture = new Capture<String>();
    Capture<String> stringCapture2 = new Capture<String>();

    expect(
        jcrNodeFactoryService.setInputStream(capture(stringCapture),
            capture(inputStream), capture(stringCapture2))).andReturn(node);


    expect(
        jcrNodeFactoryService.setInputStream(capture(stringCapture),
            capture(inputStream), capture(stringCapture2))).andReturn(node);



    Capture<Map<String, String>> mapCapture = new Capture<Map<String, String>>();
    expect(beanConverter.convertToString(capture(mapCapture))).andReturn(
        "{\"response\":\"OK\"}");

    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall();

    replayMocks(node);
    createProvider();

    String[] elements = new String[] { "friend", "connect", "request",
        "frienduserid" };

    rsp.dispatch(elements, request, response);

    String op = baos.toString(StringUtils.UTF8);
    assertEquals("{\"response\":\"OK\"}", op);

    verifyMocks(node);
  }

  /**
   * Connect to the user
   *
   * @throws ServletException
   * @throws IOException
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   */
  @Test
  public void testRequestConnection() throws ServletException, IOException,
      RepositoryException, JCRNodeFactoryServiceException {
    setupServices();

    FriendsBean me = new FriendsBean(jcrNodeFactoryService, userFactoryService,
        beanConverter, "private");
    me.setUuid("user2");
    FriendsBean myFriend = new FriendsBean(jcrNodeFactoryService,
        userFactoryService, beanConverter, "private");
    myFriend.setUuid("user1");

    // request a connection
    connect("user2", "request", "user1", "hi", me, myFriend);

    // check that user2 has accepted
    checkFriend("user2", new String[] { "user1" }, new String[] { "PENDING" });

    // check that user1 has accepted
    checkFriend("user1", new String[] { "user2" }, new String[] { "INVITED" });

    // user 1 confirms

    connect("user1", "accept", "user2", null, myFriend, me);

    // check that user2 has accepted
    checkFriend("user2", new String[] { "user1" }, new String[] { "ACCEPTED" });

    // check that user1 has accepted
    checkFriend("user1", new String[] { "user2" }, new String[] { "ACCEPTED" });

    // try to reinvite both should fail
    try {
      connect("user1", "request", "user2", "hi", myFriend, me);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_CONFLICT, ex.getStatusCode());
    }

    try {
      connect("user2", "request", "user1", "hi", me, myFriend);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_CONFLICT, ex.getStatusCode());
    }

    // user 1 removes
    connect("user1", "remove", "user2", null, myFriend, me);

    // user 2 no mates
    checkFriend("user2", new String[] {}, new String[] {});

    // user 1 no mates
    checkFriend("user1", new String[] {}, new String[] {});

  }

  /**
   * Connect to the user
   *
   * @throws ServletException
   * @throws IOException
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   */
  @Test
  public void testRequestRejectConnection() throws ServletException,
      IOException, RepositoryException, JCRNodeFactoryServiceException {
    setupServices();

    FriendsBean me = new FriendsBean(jcrNodeFactoryService, userFactoryService,
        beanConverter, "private");
    me.setUuid("user2");
    FriendsBean myFriend = new FriendsBean(jcrNodeFactoryService,
        userFactoryService, beanConverter, "private");
    myFriend.setUuid("user1");

    // request a connection
    connect("user2", "request", "user1", "hi", me, myFriend);

    // check that user2 has accepted
    checkFriend("user2", new String[] { "user1" }, new String[] { "PENDING" });

    // check that user1 has accepted
    checkFriend("user1", new String[] { "user2" }, new String[] { "INVITED" });

    // user 1 rejects

    connect("user1", "reject", "user2", null, myFriend, me);

    // check that the friend has gone
    checkFriend("user2", new String[] {}, new String[] {});

    // check that the friend has gone
    checkFriend("user1", new String[] {}, new String[] {});

    // user 1 removes
    try {
      connect("user1", "remove", "user2", null, myFriend, me);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_NOT_FOUND, ex.getStatusCode());
    }

  }

  /**
   * Connect to the user
   *
   * @throws ServletException
   * @throws IOException
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   */
  @Test
  public void testRequestIgnoreConnection() throws ServletException,
      IOException, RepositoryException, JCRNodeFactoryServiceException {
    setupServices();
    newSession();

    FriendsBean me = new FriendsBean(jcrNodeFactoryService, userFactoryService,
        beanConverter, "private");
    me.setUuid("user2");
    FriendsBean myFriend = new FriendsBean(jcrNodeFactoryService,
        userFactoryService, beanConverter, "private");
    myFriend.setUuid("user1");

    // request a connection
    connect("user2", "request", "user1", "hi", me, myFriend);

    // check that user2 has accepted
    checkFriend("user2", new String[] { "user1" }, new String[] { "PENDING" });

    // check that user1 has accepted
    checkFriend("user1", new String[] { "user2" }, new String[] { "INVITED" });

    // user 1 rejects

    connect("user1", "ignore", "user2", null, myFriend, me);

    // check that the friend has gone
    checkFriend("user2", new String[] {}, new String[] {});

    // check that the friend has gone
    checkFriend("user1", new String[] {}, new String[] {});

    // user 1 removes
    try {
      connect("user1", "remove", "user2", null, myFriend, me);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_NOT_FOUND, ex.getStatusCode());
    }

  }

  /**
   * Connect to the user
   *
   * @throws ServletException
   * @throws IOException
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   */
  @Test
  public void testRequestCancelConnection() throws ServletException,
      IOException, RepositoryException, JCRNodeFactoryServiceException {
    setupServices();
    newSession();
    FriendsBean me = new FriendsBean(jcrNodeFactoryService, userFactoryService,
        beanConverter, "private");
    me.setUuid("user2");
    FriendsBean myFriend = new FriendsBean(jcrNodeFactoryService,
        userFactoryService, beanConverter, "private");
    myFriend.setUuid("user1");

    // request a connection
    connect("user2", "request", "user1", "hi", me, myFriend);

    // check that user2 has accepted
    checkFriend("user2", new String[] { "user1" }, new String[] { "PENDING" });

    // check that user1 has accepted
    checkFriend("user1", new String[] { "user2" }, new String[] { "INVITED" });

    // user 1 cancel, not allowed
    try {
      connect("user1", "cancel", "user2", null, myFriend, me);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_CONFLICT, ex.getStatusCode());
    }
    // user 2 is not allowed to accept, reject or ignore
    try {
      connect("user2", "accept", "user1", null, me, myFriend);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_CONFLICT, ex.getStatusCode());
    }
    // user 2 is not allowed to accept, reject or ignore
    try {
      connect("user2", "reject", "user1", null, me, myFriend);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_CONFLICT, ex.getStatusCode());
    }
    // user 2 is not allowed to accept, reject or ignore
    try {
      connect("user2", "ignore", "user1", null, me, myFriend);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_CONFLICT, ex.getStatusCode());
    }

    // cancel
    connect("user2", "cancel", "user1", null, me, myFriend);

    // check that the friend has gone
    checkFriend("user2", new String[] {}, new String[] {});

    // check that the friend has gone
    checkFriend("user1", new String[] {}, new String[] {});

    // all the following will fail, no connection
    try {
      connect("user1", "cancel", "user2", null, myFriend, me);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_NOT_FOUND, ex.getStatusCode());
    }
    try {
      connect("user1", "reject", "user2", null, myFriend, me);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_NOT_FOUND, ex.getStatusCode());
    }
    try {
      connect("user1", "accept", "user2", null, myFriend, me);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_NOT_FOUND, ex.getStatusCode());
    }
    // user 1 removes
    try {
      connect("user1", "remove", "user2", null, myFriend, me);
      fail();
    } catch (RestServiceFaultException ex) {
      assertEquals(HttpServletResponse.SC_NOT_FOUND, ex.getStatusCode());
    }

  }

  /**
   * @param rsp
   * @param string
   * @param string2
   * @param string3
   * @throws IOException
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   */
  private void connect(String user, String action, String friend,
      String message, FriendsBean me, FriendsBean myFriend) throws IOException,
      JCRNodeFactoryServiceException, RepositoryException {
    resetMocks();
    newSession();

    Session session = createMock(Session.class);
    expect(jcrService.getSession()).andReturn(session).anyTimes();

    authzResolverService.setRequestGrant((String) anyObject());
    expectLastCall().atLeastOnce();
    authzResolverService.clearRequestGrant();
    expectLastCall().atLeastOnce();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes(user, baos);
    expect(request.getMethod()).andReturn("POST");

    expect(request.getParameter("friendUuid")).andReturn(friend);
    expect(request.getParameter("friendType")).andReturn("distant");
    expect(request.getParameter("friendStatus")).andReturn(null);
    expect(request.getParameter("message")).andReturn(message);
    expect(request.getParameter("p")).andReturn(null);
    expect(request.getParameter("n")).andReturn(null);
    expect(request.getParameterValues("s")).andReturn(null);
    expect(request.getParameterValues("o")).andReturn(null);

    Node node = createMock(Node.class);
    expect(friendsResolverService.resolve(user)).andReturn(me).anyTimes();

    expect(friendsResolverService.resolve(friend)).andReturn(myFriend)
        .anyTimes();
    expect(userFactoryService.getUserPathPrefix((String) anyObject()))
        .andReturn("somepath/").anyTimes();
    expect(beanConverter.convertToString(me)).andReturn("{}").anyTimes();
    expect(beanConverter.convertToString(myFriend)).andReturn("{}").anyTimes();

    Capture<InputStream> inputStream = new Capture<InputStream>();
    Capture<String> stringCapture = new Capture<String>();
    Capture<String> stringCapture2 = new Capture<String>();

    expect(
        jcrNodeFactoryService.setInputStream(capture(stringCapture),
            capture(inputStream), capture(stringCapture2))).andReturn(node)
        .atLeastOnce();


    if ("request".equals(action)) {

    } else if ("accept".equals(action)) {

    } else if ("remove".equals(action)) {

    }

    Capture<Map<String, String>> mapCapture = new Capture<Map<String, String>>();
    expect(beanConverter.convertToString(capture(mapCapture))).andReturn(
        "{\"response\":\"OK\"}");

    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall();

    replayMocks(node);
    createProvider();

    String[] elements = new String[] { "friend", "connect", action };

    rsp.dispatch(elements, request, response);

    String op = baos.toString(StringUtils.UTF8);
    assertEquals("{\"response\":\"OK\"}", op);

    verifyMocks(node);
  }

  /**
   * @param string
   * @param string2
   * @param strings
   * @param strings2
   * @throws IOException
   * @throws RepositoryException
   * @throws LoginException
   */
  private void checkFriend(String user, String[] friendUuids,
      String[] friendStatus) throws IOException, LoginException, RepositoryException {
    resetMocks();

    newSession();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes(user, baos);
    expect(request.getMethod()).andReturn("GET");

    expect(request.getParameter("friendUuid")).andReturn(null);
    expect(request.getParameter("friendType")).andReturn(null);
    expect(request.getParameter("friendStatus")).andReturn(null);
    expect(request.getParameter("message")).andReturn(null);
    expect(request.getParameter("p")).andReturn(null);
    expect(request.getParameter("n")).andReturn(null);
    expect(request.getParameterValues("s")).andReturn(null);
    expect(request.getParameterValues("o")).andReturn(null);

    Session session = createMock(Session.class);
    expect(jcrService.getSession()).andReturn(session).anyTimes();


    FriendsBean fb = new FriendsBean(jcrNodeFactoryService, userFactoryService,
        beanConverter, "private");
    expect(friendsResolverService.resolve(user)).andReturn(fb).anyTimes();

    Query query = createMock(Query.class);
    expect(
        entityManager
            .createQuery("select s from FriendsIndexBean s where s.uuid = :uuid "))
        .andReturn(query);

    expect(query.setFirstResult(0)).andReturn(query);
    expect(query.setMaxResults(10)).andReturn(query);
    expect(query.setParameter("uuid", user)).andReturn(query);
    FriendsIndexBean fib = new FriendsIndexBean();
    List<FriendsIndexBean> resultList = Lists.newArrayList(fib);
    expect(query.getResultList()).andReturn(resultList);

    Capture<Map<String, String>> mapCapture = new Capture<Map<String, String>>();
    expect(beanConverter.convertToString(capture(mapCapture))).andReturn(
        "{\"response\":\"OK\"}");

    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall();

    replayMocks(query);
    createProvider();

    String[] elements = new String[] { "friend", "status" };

    rsp.dispatch(elements, request, response);

    String op = baos.toString(StringUtils.UTF8);

    System.err.println("Got Response " + op);

    assertEquals("{\"response\":\"OK\"}", op);

    verifyMocks(query);
  }

}
