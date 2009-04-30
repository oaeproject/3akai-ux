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

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;

import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;
import org.sakaiproject.kernel.api.authz.SubjectPermissionService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.SiteService;
import org.sakaiproject.kernel.api.social.FriendsResolverService;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.registry.RegistryServiceImpl;
import org.sakaiproject.kernel.rest.DefaultUserInfoParser;
import org.sakaiproject.kernel.util.StringUtils;
import org.sakaiproject.kernel.webapp.SakaiServletRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;

import javax.persistence.EntityManager;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 *
 */
public class BaseRestUT {

  protected RegistryService registryService;
  protected UserEnvironmentResolverService userEnvironmentResolverService;
  protected SessionManagerService sessionManagerService;
  protected SubjectPermissionService subjectPermissionService;
  protected SiteService siteService;
  protected UserResolverService userResolverService;
  protected HttpServletRequest request;
  protected HttpServletResponse response;
  protected HttpSession session;
  protected CacheManagerService cacheManagerService;
  protected JCRNodeFactoryService jcrNodeFactoryService;
  protected JCRService jcrService;
  protected UserFactoryService userFactoryService;
  protected ProfileResolverService profileResolverService;
  protected EntityManager entityManager;
  protected FriendsResolverService friendsResolverService;
  protected BeanConverter beanConverter;
  protected Object[] mocks;
  protected SakaiServletRequest sakaiServletRequest;
  protected Session sakaiSession;
  protected UserEnvironment userEnvironment;
  protected User user;
  private String sessionID;
  protected AuthzResolverService authzResolverService;
  protected PermissionQueryService permissionQueryService;
  protected DefaultUserInfoParser defaultUserInfoParser;

  /**
   *
   */
  protected void resetMocks(Object... moreMocks) {
    if (moreMocks != null) {
      reset(join(mocks, moreMocks));
    } else {
      reset(mocks);
    }
  }

  /**
   *
   */
  protected void verifyMocks(Object... moreMocks) {
    if (moreMocks != null) {
      verify(join(mocks, moreMocks));
    } else {
      verify(mocks);
    }
  }

  /**
   *
   */
  protected void replayMocks(Object... moreMocks) {

    expect(sessionManagerService.getCurrentSession()).andReturn(sakaiSession).anyTimes();
    expect(userEnvironmentResolverService.resolve(sakaiSession)).andReturn(
        userEnvironment).anyTimes();

    expect(sakaiSession.getUser()).andReturn(user).anyTimes();

    if (moreMocks != null) {
      replay(join(mocks, moreMocks));
    } else {
      replay(mocks);
    }
    sakaiServletRequest = new SakaiServletRequest(request, response, userResolverService,
        sessionManagerService);
  }

  /**
   * @param mocks2
   * @param moreMocks
   * @return
   */
  @SuppressWarnings("unchecked")
  private <T> T[] join(T[]... arrays) {
    int size = 0;
    for (T[] a : arrays) {
      size += a.length;
    }
    T[] out = (T[]) new Object[size];
    int i = 0;
    for (T[] a : arrays) {
      System.arraycopy(a, 0, out, i, a.length);
      i += a.length;
    }
    return out;
  }

  /**
   * @param string
   * @param string2
   * @param baos
   */
  public void setupAnyTimes(final String username, final ByteArrayOutputStream baos)
      throws IOException {

    user = new User() {
      /**
       *
       */
      private static final long serialVersionUID = -2124446523538688673L;

      public String getUuid() {
        return username;
      }

    };

    expect(request.getRemoteUser()).andReturn(user.getUuid()).anyTimes();
    expect(request.getAttribute("_no_session")).andReturn(null).anyTimes();
    expect(request.getSession(true)).andReturn(session).anyTimes();
    expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
    expect(session.getAttribute("_u")).andReturn(user).anyTimes();
    expect(session.getAttribute("_uu")).andReturn(user).anyTimes();

    expect(request.getRequestedSessionId()).andReturn(sessionID).anyTimes();
    expect(session.getId()).andReturn(sessionID).anyTimes();
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
    expect(request.getCookies()).andReturn(new Cookie[] {cookie}).anyTimes();
    response.addCookie((Cookie) anyObject());
    expectLastCall().anyTimes();

    ServletOutputStream out = new ServletOutputStream() {

      @Override
      public void write(int b) throws IOException {
        baos.write(b);
      }

    };

    expect(response.getOutputStream()).andReturn(out).anyTimes();

  }

  /**
   *
   */
  protected void setupServices() {
    registryService = new RegistryServiceImpl();
    userEnvironmentResolverService = createMock(UserEnvironmentResolverService.class);
    sessionManagerService = createMock(SessionManagerService.class);
    subjectPermissionService = createMock(SubjectPermissionService.class);
    cacheManagerService = createMock(CacheManagerService.class);
    jcrNodeFactoryService = createMock(JCRNodeFactoryService.class);
    jcrService = createMock(JCRService.class);
    userFactoryService = createMock(UserFactoryService.class);
    profileResolverService = createMock(ProfileResolverService.class);
    entityManager = createMock(EntityManager.class);
    friendsResolverService = createMock(FriendsResolverService.class);
    sakaiSession = createMock(Session.class);
    beanConverter = createMock(BeanConverter.class);
    authzResolverService = createMock(AuthzResolverService.class);
    permissionQueryService = createMock(PermissionQueryService.class);

    defaultUserInfoParser = createMock(DefaultUserInfoParser.class);
    
    siteService = createMock(SiteService.class);
    userResolverService = createMock(UserResolverService.class);
    request = createMock(HttpServletRequest.class);
    response = createMock(HttpServletResponse.class);
    session = createMock(HttpSession.class);

    userEnvironment = createMock(UserEnvironment.class);

    mocks = new Object[] {userEnvironmentResolverService, sessionManagerService,
        subjectPermissionService, cacheManagerService, jcrNodeFactoryService, jcrService,
        userFactoryService, profileResolverService, entityManager,
        friendsResolverService, siteService, userResolverService, request, response,
        session, sakaiSession, userEnvironment, beanConverter, authzResolverService,
        permissionQueryService};

  }

  public void newSession() {
    try {
      sessionID = StringUtils.sha1Hash(String.valueOf(System.currentTimeMillis()));
    } catch (UnsupportedEncodingException e) {
      sessionID = String.valueOf(System.currentTimeMillis());
    } catch (NoSuchAlgorithmException e) {
      sessionID = String.valueOf(System.currentTimeMillis());
    }
  }

}
