/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.commons.fileupload.sdata;

import java.util.Enumeration;
import java.util.Hashtable;

import javax.portlet.PortletContext;
import javax.portlet.PortletSession;

/**
 * A mock portlet session, useful for unit testing and offline utilities Note:
 * currently doesn't support scoping
 * 
 * @author <a href="mailto:taylor@apache.org">David Sean Taylor</a>
 * @version $Id: MockPortletSession.java 57642 2009-02-01 20:58:48Z ian@caret.cam.ac.uk $
 */
public class MockPortletSession implements PortletSession {
  // Hashtable (not HashMap) makes enumerations easier to work with
  Hashtable<String, Object> attributes = new Hashtable<String, Object>();

  public MockPortletSession() {
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#getAttribute(java.lang.String)
   */
  public Object getAttribute(String name) {
    return attributes.get(name);
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#getAttribute(java.lang.String, int)
   */
  public Object getAttribute(String name, int scope) {
    return attributes.get(name);
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#getAttributeNames(int)
   */
  @SuppressWarnings("unchecked")
  public Enumeration getAttributeNames(int scope) {
    return attributes.keys();
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#getCreationTime()
   */
  public long getCreationTime() {

    return 0;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#getId()
   */
  public String getId() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#getLastAccessedTime()
   */
  public long getLastAccessedTime() {

    return 0;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#getMaxInactiveInterval()
   */
  public int getMaxInactiveInterval() {

    return 0;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#invalidate()
   */
  public void invalidate() {

  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#isNew()
   */
  public boolean isNew() {

    return false;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#removeAttribute(java.lang.String)
   */
  public void removeAttribute(String name) {
    attributes.remove(name);
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#removeAttribute(java.lang.String, int)
   */
  public void removeAttribute(String name, int scope) {
    attributes.remove(name);
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#setAttribute(java.lang.String,
   * java.lang.Object)
   */
  public void setAttribute(String name, Object value) {
    attributes.put(name, value);
  }

  @SuppressWarnings("unchecked")
  public Enumeration getAttributeNames() {
    return this.getAttributeNames(PortletSession.PORTLET_SCOPE);
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#setAttribute(java.lang.String,
   * java.lang.Object, int)
   */
  public void setAttribute(String name, Object value, int scope) {
    attributes.put(name, value);
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#setMaxInactiveInterval(int)
   */
  public void setMaxInactiveInterval(int interval) {

  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletSession#getPortletContext()
   */
  public PortletContext getPortletContext() {

    return null;
  }
}
