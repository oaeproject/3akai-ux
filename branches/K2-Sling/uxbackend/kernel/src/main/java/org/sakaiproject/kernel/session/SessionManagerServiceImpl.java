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
package org.sakaiproject.kernel.session;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.webapp.SakaiServletRequest;

import java.util.Map;

import javax.servlet.ServletRequest;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 *
 */
@Singleton
public class SessionManagerServiceImpl implements SessionManagerService {

  /**
   * the key used for session, (every byte is sacred)
   */
  private static final String REQUEST_CACHE = "request";
  private static final String CURRENT_REQUEST = "_r";
  private static final String CURRENT_SESSION = "_s";
  private static final Log LOG = LogFactory
      .getLog(SessionManagerServiceImpl.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private CacheManagerService cacheManagerService;
  private Map<String, HttpSession> sessionMap; // this is a ReferenceMap with Strong Keys, Weak Values.
  private String cookieName;
  private Session anonSession = new AnonSession();

  @Inject
  public SessionManagerServiceImpl(CacheManagerService cacheManagerService,
      Map<String, HttpSession> sessionMap,
      @Named(KernelConstants.SESSION_COOKIE) String cookieName) {
    this.cacheManagerService = cacheManagerService;
    this.sessionMap = sessionMap;
    this.cookieName = cookieName;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.session.SessionManagerService#getCurrentSession()
   */
  public Session getCurrentSession() {
    Cache<Object> requestScope = cacheManagerService.getCache(REQUEST_CACHE,
        CacheScope.REQUEST);
    SakaiServletRequest request = (SakaiServletRequest) requestScope
        .get(CURRENT_REQUEST);
    if (request == null) {
      return anonSession;
      /*
       * throw new RuntimeException(
       * "No Request Object has been bound to the request thread\n" +
       * "   Please ensure that the Sakai Request Filter is active in web.xml\n"
       * +
       * "   or if in a test, perform a SessionManager.bindRequest as part of\n"
       * + "   the invocation of the test.");
       */
    }
    return request.getSakaiSession();
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.session.SessionManagerService#bindRequest(javax.servlet.ServletRequest)
   */
  public void bindRequest(ServletRequest request) {
    if (!(request instanceof SakaiServletRequest)) {
      throw new RuntimeException(
          "Requests can only be bound by the SakaiRequestFilter ");
    }
    Cache<Object> requestScope = cacheManagerService.getCache(REQUEST_CACHE,
        CacheScope.REQUEST);
    requestScope.put(CURRENT_REQUEST, request);

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.session.SessionManagerService#getSession(javax.servlet.http.HttpServletRequest,
   *      boolean)
   */
  public HttpSession getSession(HttpServletRequest request,
      HttpServletResponse response, boolean create) {

    Cache<Object> requestScope = cacheManagerService.getCache(REQUEST_CACHE,
        CacheScope.REQUEST);
    HttpSession session = (HttpSession) requestScope.get(CURRENT_SESSION);
    if (session != null) {
      return session;
    }

    // try and get it from the cache, if there use it, otherwise create it and
    // place it in the cache.
    // try the container location first
    // PERF: sessionMap could change so this has to be done every time.
    String sessionID = request.getRequestedSessionId();
    if (sessionID != null) {
      // if its not in the map... its not the right session
      session = checkSession(sessionMap.get(sessionID));
      if (debug) {
        LOG.debug("SessionManager (standard): Got Sesssion " + sessionID
            + " as " + session + " from " + sessionMap);
      }
    }
    // try the cookie
    // PERF: sessionMap could change so this has to be done every time.
    if (session == null) {
      sessionID = null;
      // could be its in a cookie
      Cookie[] cookies = request.getCookies();
      if (cookies != null) {
        for (Cookie c : cookies) {
          if (cookieName.equals(c.getName())) {
            sessionID = c.getValue();
            break;
          }
        }
      }
      if (sessionID != null) {
        session = checkSession(sessionMap.get(sessionID));
        if (debug) {
          LOG.debug("SessionManager (cookie): Got Sesssion " + sessionID
              + " as " + session + " from " + sessionMap);
        }
      }
      if (session == null) {
        // not in the map of could have no session, so create one (if requested)
        // go back and create with the sever, which will set a cookie,
        // that OK, but also set my cookie.
        // PERF: sessionMap if we were here with create = true, we wont be here
        // again
        // PERF: is we were here with create = false, then we need to try again.
        session = request.getSession(create);
        if (session != null) {
          if (debug) {
            Exception ex = new Exception("Session Created By:");
            LOG.debug("SessionManager (created): Got Sesssion "
                + session.getId() + " as " + session + " from " + sessionMap,
                ex);
          }
          Cookie c = new Cookie(cookieName, session.getId());
          c.setPath("/");
          c.setMaxAge(-1);
          response.addCookie(c);
          System.err.println("SessionManager (put): Got Sesssion "
              + session.getId() + " as " + session + " from " + sessionMap);
          // When this is put in here, provided session is not GC'd it will remain 
          // in the sessionMap for other webapps to use.
          // The session is GC'd it will be removed from here.
          sessionMap.put(session.getId(), session);
          requestScope.put(CURRENT_SESSION, session);
        } else if (debug) {
          LOG.debug("SessionManager (failed to create) create="
              + create + ": Sesssion " + sessionID + " as null from "
              + sessionMap);
        }
      }
    }
    return session;
  }

  /**
   * @param httpSession
   * @return
   */
  private HttpSession checkSession(HttpSession httpSession) {
    try {
      if (httpSession != null) {
        httpSession.getAttribute("check-valid");
      }
      return httpSession;
    } catch (IllegalStateException e) {
      return null;
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.session.SessionManagerService#getCurrentUser()
   */
  public String getCurrentUserId() {
    Cache<Object> requestScope = cacheManagerService.getCache(REQUEST_CACHE,
        CacheScope.REQUEST);
    SakaiServletRequest request = (SakaiServletRequest) requestScope
        .get(CURRENT_REQUEST);
    if (request == null) {
      return null;
    }
    return request.getRemoteUser();
  }

}
