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

import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.user.Authentication;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserResolverService;

import java.util.Enumeration;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionContext;

/**
 * An implementation of the Session, where the user is recorded as an attribute.
 */
// TODO: not tested with an authorization
@SuppressWarnings("deprecation")
public class SessionImpl implements Session {

  /**
   * The attribute name of the resolved user object
   */
  public static final String USER = "_u";
  /**
   * The attribute name of the unresolved internal user id, from the
   * authentication object.
   */
  public static final String UNRESOLVED_UID = "_uu";
  private HttpSession baseSession;
  private UserResolverService userResolverService;

  /**
   * @param httpRequest
   * @param rsession
   */
  public SessionImpl(HttpSession baseSession, Authentication authentication,
      UserResolverService userResolverService) {
    this.userResolverService = userResolverService;
    this.baseSession = baseSession;
    if (authentication != null) {
      baseSession.setAttribute(UNRESOLVED_UID, authentication.getUid());
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.session.Session#getUserId()
   */
  public User getUser() {
    User user = (User) getAttribute(USER);
    if (user == null) {
      String uid = (String) getAttribute(UNRESOLVED_UID);
      if (uid != null) {
        user = userResolverService.resolveWithUUID(uid);
        removeAttribute(UNRESOLVED_UID);
      }
      if (user != null) {
        baseSession.setAttribute(USER, user);
      }
    }
    return user;
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getAttribute(java.lang.String)
   */
  public Object getAttribute(String name) {
    return baseSession.getAttribute(name);
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getAttributeNames()
   */
  @SuppressWarnings("unchecked")
  public Enumeration getAttributeNames() {
    return baseSession.getAttributeNames();
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getCreationTime()
   */
  public long getCreationTime() {
    return baseSession.getCreationTime();
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getId()
   */
  public String getId() {
    return baseSession.getId();
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getLastAccessedTime()
   */
  public long getLastAccessedTime() {
    return baseSession.getLastAccessedTime();
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getMaxInactiveInterval()
   */
  public int getMaxInactiveInterval() {
    return baseSession.getMaxInactiveInterval();
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getServletContext()
   */
  public ServletContext getServletContext() {
    return baseSession.getServletContext();
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getSessionContext()
   */
  @Deprecated
  public HttpSessionContext getSessionContext() {
    return baseSession.getSessionContext();
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getValue(java.lang.String)
   */
  @Deprecated
  public Object getValue(String name) {
    return baseSession.getValue(name);
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#getValueNames()
   */
  @Deprecated
  public String[] getValueNames() {
    return baseSession.getValueNames();
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#invalidate()
   */
  public void invalidate() {
    baseSession.invalidate();

  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#isNew()
   */
  public boolean isNew() {
    return baseSession.isNew();
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#putValue(java.lang.String,
   *      java.lang.Object)
   */
  @Deprecated
  public void putValue(String name, Object value) {
    baseSession.putValue(name, value);
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#removeAttribute(java.lang.String)
   */
  public void removeAttribute(String name) {
    baseSession.removeAttribute(name);
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#removeValue(java.lang.String)
   */
  @Deprecated
  public void removeValue(String name) {
    baseSession.removeValue(name);
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#setAttribute(java.lang.String,
   *      java.lang.Object)
   */
  public void setAttribute(String name, Object value) {
    if (USER.equals(name) || UNRESOLVED_UID.equals(name)) {
      throw new Error(
          "Attempt to set the User illeally, the code that performed this should be investigated and removed immediately from your JVM");
    }
    baseSession.setAttribute(name, value);
  }

  public void setBaseAttribute(String name, Object value ) {
    baseSession.setAttribute(name, value);
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpSession#setMaxInactiveInterval(int)
   */
  public void setMaxInactiveInterval(int interval) {
    baseSession.setMaxInactiveInterval(interval);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.session.Session#removeUser()
   */
  public void removeUser() {
    baseSession.removeAttribute(USER);
    baseSession.removeAttribute(UNRESOLVED_UID);
  }

}
