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
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.util.user.AnonUser;

import java.util.Enumeration;
import java.util.Vector;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpSessionContext;

/**
 *
 */
@SuppressWarnings("deprecation")
public class AnonSession implements Session {

  private Vector<String> emptyVector = new Vector<String>();
  private String[] emptyStringArray = new String[] {};
  private User anonUser = new AnonUser();

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.session.Session#getUser()
   */
  public User getUser() {
    return anonUser;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.session.Session#removeUser()
   */
  public void removeUser() {
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getAttribute(java.lang.String)
   */
  public Object getAttribute(String name) {
    return null;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getAttributeNames()
   */
  @SuppressWarnings("unchecked")
  public Enumeration getAttributeNames() {
    return emptyVector.elements();
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getCreationTime()
   */
  public long getCreationTime() {
    return 0;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getId()
   */
  public String getId() {
    return null;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getLastAccessedTime()
   */
  public long getLastAccessedTime() {
    return 0;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getMaxInactiveInterval()
   */
  public int getMaxInactiveInterval() {
    return 0;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getServletContext()
   */
  public ServletContext getServletContext() {
    return null;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getSessionContext()
   */
  public HttpSessionContext getSessionContext() {
    return null;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getValue(java.lang.String)
   */
  public Object getValue(String name) {
    return null;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#getValueNames()
   */
  public String[] getValueNames() {
    return emptyStringArray;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#invalidate()
   */
  public void invalidate() {
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#isNew()
   */
  public boolean isNew() {
    return false;
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#putValue(java.lang.String, java.lang.Object)
   */
  public void putValue(String name, Object value) {
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#removeAttribute(java.lang.String)
   */
  public void removeAttribute(String name) {
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#removeValue(java.lang.String)
   */
  public void removeValue(String name) {
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#setAttribute(java.lang.String, java.lang.Object)
   */
  public void setAttribute(String name, Object value) {
  }

  /**
   * {@inheritDoc}
   * @see javax.servlet.http.HttpSession#setMaxInactiveInterval(int)
   */
  public void setMaxInactiveInterval(int interval) {
  }

}
