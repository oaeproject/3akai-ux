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

package org.sakaiproject.kernel.friend;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.common.collect.ImmutableMap;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.SiteException;
import org.sakaiproject.kernel.api.social.FriendsResolverService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.model.FriendBean;
import org.sakaiproject.kernel.model.FriendStatus;
import org.sakaiproject.kernel.model.FriendsBean;
import org.sakaiproject.kernel.session.SessionImpl;
import org.sakaiproject.kernel.test.KernelIntegrationBase;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;
import org.sakaiproject.kernel.webapp.SakaiServletRequest;
import org.sakaiproject.kernel.webapp.test.InternalUser;

import java.io.UnsupportedEncodingException;

import javax.jcr.LoginException;
import javax.jcr.RepositoryException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Unit test for SiteServiceImpl
 */
public class FriendResolverServiceT {

  private static Kernel kernel;
  private static FriendsResolverService friendResolverService;

  private static boolean shutdown;
  private static SessionManagerService sessMgr;
  private static UserResolverService userRes;
  private static JCRNodeFactoryService jcrNodeFactoryService;
  private static JCRService jcrService;
  private static UserEnvironmentResolverService userEnvironmentResolverService;

  private HttpServletRequest request;
  private HttpServletResponse response;
  private HttpSession session;

  @BeforeClass
  public static void beforeClass() throws Exception {
    shutdown = KernelIntegrationBase.beforeClass();

    KernelManager manager = new KernelManager();
    kernel = manager.getKernel();

    friendResolverService = kernel.getService(FriendsResolverService.class);
    KernelIntegrationBase.checkNotNull(friendResolverService);

    sessMgr = kernel.getService(SessionManagerService.class);
    KernelIntegrationBase.checkNotNull(sessMgr);

    userRes = kernel.getService(UserResolverService.class);
    KernelIntegrationBase.checkNotNull(userRes);

    jcrNodeFactoryService = kernel.getService(JCRNodeFactoryService.class);
    KernelIntegrationBase.checkNotNull(jcrNodeFactoryService);
    jcrService = kernel.getService(JCRService.class);
    KernelIntegrationBase.checkNotNull(jcrService);

    userEnvironmentResolverService = kernel
        .getService(UserEnvironmentResolverService.class);
    KernelIntegrationBase.checkNotNull(userEnvironmentResolverService);

  }

  @AfterClass
  public static void afterClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  @Before
  public void beforeTest() throws LoginException, RepositoryException {
    jcrService.logout();
    assertFalse(jcrService.hasActiveSession());
  }

  @After
  public void afterTest() {
    try {
      jcrService.logout();
    } catch (LoginException e) {
      e.printStackTrace();
    } catch (RepositoryException e) {
      e.printStackTrace();
    }
  }

  private void setupUser(String username) {
    request = createMock(HttpServletRequest.class);
    session = createMock(HttpSession.class);
    response = createMock(HttpServletResponse.class);

    User user = null;
    if (username != null) {
      user = new InternalUser(username);
    }
    expect(session.getAttribute(SessionImpl.USER)).andReturn(user).anyTimes();
    expect(request.getRemoteUser()).andReturn(username).anyTimes();
    expect(request.getAttribute("_no_session")).andReturn(null).anyTimes();
    expect(request.getRequestedSessionId()).andReturn("TEST-12222").anyTimes();
    Cookie cookie = new Cookie("SAKAIID", "SESSIONID-123");
    expect(request.getCookies()).andReturn(new Cookie[] {cookie}).anyTimes();
    expect(request.getSession(true)).andReturn(session).anyTimes();
    expect(request.getSession(false)).andReturn(session).anyTimes();
    expect(session.getId()).andReturn("TEST-12222").anyTimes();
    expect(request.getAttribute("_u")).andReturn(user).anyTimes();
    expect(session.getAttribute("_uu")).andReturn(null).anyTimes();
    expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
    expect(session.getAttribute("check-valid")).andReturn(null).anyTimes();

    response.addCookie((Cookie) anyObject());
    expectLastCall().anyTimes();
    /*
     *
     * expect(request.getRemoteUser()).andReturn("").anyTimes();
     * expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
     */
    SakaiServletRequest req = new SakaiServletRequest(request, response, userRes, sessMgr);
    sessMgr.bindRequest(req);
  }

  @Test
  public void resolveFriendAsAdmin() throws SiteException {
    setupUser("admin");
    replay(request, response, session);

    FriendsBean fb = friendResolverService.resolve("user1");
    assertNotNull(fb);

    verify(request, response, session);
  }

  @Test
  public void resolveMeAsMe() throws SiteException {
    setupUser("user1");
    replay(request, response, session);

    FriendsBean fb = friendResolverService.resolve("user1");
    assertNotNull(fb);

    verify(request, response, session);
  }

  @Test
  public void resolveMeAsOther() throws SiteException {
    setupUser("user2");
    replay(request, response, session);

    FriendsBean fb = friendResolverService.resolve("user1");
    assertNotNull(fb);

    verify(request, response, session);
  }

  @Test
  public void doRequest() throws SiteException, UnsupportedEncodingException,
      JCRNodeFactoryServiceException, RepositoryException {
    setupUser("user2");
    String me = "user2";
    String myFriend = "user1";
    replay(request, response, session);
    requestConnection(me,myFriend);
    verify(request, response, session);
  }

  @Test
  public void doAccept() throws SiteException, UnsupportedEncodingException,
      JCRNodeFactoryServiceException, RepositoryException {
    setupUser("user2");
    String me = "user2";
    String myFriend = "user1";
    replay(request, response, session);
    requestConnection(me, myFriend);
    acceptConnect(myFriend,me);
    assertTrue(hasFriend(me,myFriend));
    assertTrue(hasFriend(myFriend,me));
    verify(request, response, session);
  }


  @Test
  public void doCancel() throws SiteException, UnsupportedEncodingException,
      JCRNodeFactoryServiceException, RepositoryException {
    setupUser("user2");
    String me = "user2";
    String myFriend = "user1";
    replay(request, response, session);
    requestConnection(me, myFriend);
    cancleConnect(me,myFriend);
    assertFalse(hasFriend(me,myFriend));
    assertFalse(hasFriend(myFriend,me));
    verify(request, response, session);
  }


  /**
   * @param me
   * @param myFriend
   */
  private boolean hasFriend(String me, String myFriend) {
    FriendsBean myFriends = friendResolverService.resolve(me);
    return myFriends.hasFriend(myFriend);
  }

  /**
   * @param me
   * @param myFriend
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   * @throws UnsupportedEncodingException
   */
  private void cancleConnect(String me, String myFriend) throws UnsupportedEncodingException, JCRNodeFactoryServiceException, RepositoryException {
    FriendsBean myFriends = friendResolverService.resolve(me);
    FriendsBean friendFriends = friendResolverService
        .resolve(myFriend);
    if (!myFriends.hasFriend(myFriend)
        || !friendFriends.hasFriend(me)) {
      fail(" The friend connection is missing ");
    }
    FriendBean myFriendBean = myFriends.getFriend(myFriend);
    FriendBean friendFriendBean = friendFriends.getFriend(me);
    if (!myFriendBean.isInState(FriendStatus.PENDING)
        || !friendFriendBean.isInState(FriendStatus.INVITED)) {
      fail("The invitation to connect is not current");
    }

    myFriends.removeFriend(myFriend);
    friendFriends.removeFriend(me);
    myFriends.save();
    friendFriends.save();
  }

  /**
   * @param string
   * @param string2
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   * @throws UnsupportedEncodingException
   */
  private void acceptConnect(String me, String myFriend) throws UnsupportedEncodingException, JCRNodeFactoryServiceException, RepositoryException {
    FriendsBean myFriends = friendResolverService.resolve(me);
    FriendsBean friendFriends = friendResolverService
        .resolve(myFriend);
    if (!myFriends.hasFriend(myFriend)
        || !friendFriends.hasFriend(me)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_NOT_FOUND,
          " The friend connection is missing ");
    }
    FriendBean myFriendBean = myFriends.getFriend(myFriend);
    FriendBean friendFriendBean = friendFriends.getFriend(me);
    if (!myFriendBean.isInState(FriendStatus.INVITED)
        || !friendFriendBean.isInState(FriendStatus.PENDING)) {
      fail("No request Pending");
    }

    myFriendBean.updateStatus(FriendStatus.ACCEPTED);
    friendFriendBean.updateStatus(FriendStatus.ACCEPTED);
    myFriends.save();
    friendFriends.save();
  }

  /**
   * @param string
   * @param string2
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   * @throws UnsupportedEncodingException
   */
  private void requestConnection(String me, String myFriend) throws UnsupportedEncodingException, JCRNodeFactoryServiceException, RepositoryException {
    FriendsBean myFriends = friendResolverService.resolve(me);
    FriendsBean friendFriends = friendResolverService.resolve(myFriend);
    if (myFriends.hasFriend(myFriend) || friendFriends.hasFriend(me)) {
      fail("There is already a connection invited, pending or accepted ");
    }
    FriendBean friend = new FriendBean(me, myFriend, FriendStatus.PENDING);
    FriendBean meBean = new FriendBean(myFriend, me, FriendStatus.INVITED);
    meBean.setProperties(ImmutableMap.of("type", "Mate", "message", "Gday!"));
    friend.setProperties(ImmutableMap.of("type", "Mate", "message", "Gday Mate!"));

    myFriends.addFriend(friend);
    friendFriends.addFriend(meBean);
    myFriends.save();
    friendFriends.save();
  }

}
