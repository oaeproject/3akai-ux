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

import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.authz.SubjectPermissionService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.SiteService;
import org.sakaiproject.kernel.api.social.FriendsResolverService;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.util.StringUtils;
import org.sakaiproject.kernel.webapp.SakaiServletRequest;
import org.sakaiproject.kernel.webapp.test.InternalUser;

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
public class BaseRestUnitT {
  
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
  private String sessionID;



  /**
   * Set up the services and mocks.
   */
  public void setupServices() {
    KernelManager km = new KernelManager();
    registryService = km.getService(RegistryService.class);
    userEnvironmentResolverService = km
        .getService(UserEnvironmentResolverService.class);
    sessionManagerService = km.getService(SessionManagerService.class);
    subjectPermissionService = km.getService(SubjectPermissionService.class);
    cacheManagerService = km.getService(CacheManagerService.class);
    jcrNodeFactoryService = km.getService(JCRNodeFactoryService.class);
    jcrService = km.getService(JCRService.class);
    userFactoryService = km.getService(UserFactoryService.class);
    profileResolverService = km.getService(ProfileResolverService.class);
    entityManager = km.getService(EntityManager.class);
    friendsResolverService = km.getService(FriendsResolverService.class);

    // clear out any earlier state from the request cache
    cacheManagerService.unbind(CacheScope.REQUEST);

    siteService = createMock(SiteService.class);
    userResolverService = createMock(UserResolverService.class);
    request = createMock(HttpServletRequest.class);
    response = createMock(HttpServletResponse.class);
    session = createMock(HttpSession.class);
  }

  /**
   * Reset mocks to have another go with the same setup.
   */
  public void resetMocks() {
    reset(request, response, session, siteService, userResolverService);
  }



  public void verifyMocks() {
    verify(request, response, session, siteService, userResolverService);
    cacheManagerService.unbind(CacheScope.REQUEST);
    cacheManagerService.unbind(CacheScope.THREAD);
  }
  
  /**
   * Replay mocks at the end of setup, and bind the request to the thread.
   */
  public void replayMocks() {
    replay(request, response, session, siteService, userResolverService);
    SakaiServletRequest sakaiServletRequest = new SakaiServletRequest(request,
        response, userResolverService, sessionManagerService);
    sessionManagerService.bindRequest(sakaiServletRequest);

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
  
  /**
   * Setup mocks for any time execution.
   * 
   * @param baos
   * @throws IOException
   * 
   */
  public void setupAnyTimes(String username, 
      final ByteArrayOutputStream baos) throws IOException {
    User user = new InternalUser(username); // this is a pre-loaded user.

    expect(request.getRemoteUser()).andReturn(user.getUuid()).anyTimes();
    expect(request.getAttribute("_no_session")).andReturn(null).anyTimes();
    expect(request.getSession(true)).andReturn(session).anyTimes();
    expect(request.getSession(false)).andReturn(session).anyTimes();
    expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
    expect(session.getAttribute("_u")).andReturn(user).anyTimes();
    expect(session.getAttribute("_uu")).andReturn(username).anyTimes();

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
    expect(request.getCookies()).andReturn(new Cookie[] { cookie }).anyTimes();
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
  
}
