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

import java.security.Principal;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Map;

import javax.portlet.PortalContext;
import javax.portlet.PortletMode;
import javax.portlet.PortletPreferences;
import javax.portlet.PortletRequest;
import javax.portlet.PortletSession;
import javax.portlet.WindowState;

/**
 * A mock portlet request, useful for unit testing and offline utilities
 * 
 * @author <a href="mailto:taylor@apache.org">David Sean Taylor</a>
 * @version $Id: MockPortletRequest.java 57642 2009-02-01 20:58:48Z ian@caret.cam.ac.uk $
 */
public class MockPortletRequest implements PortletRequest {
  MockPortletSession session = null;

  public MockPortletRequest() {
    session = new MockPortletSession();
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * javax.portlet.PortletRequest#isWindowStateAllowed(javax.portlet.WindowState
   * )
   */
  public boolean isWindowStateAllowed(WindowState state) {
    return false;
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * javax.portlet.PortletRequest#isPortletModeAllowed(javax.portlet.PortletMode
   * )
   */
  public boolean isPortletModeAllowed(PortletMode mode) {

    return false;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getPortletMode()
   */
  public PortletMode getPortletMode() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getWindowState()
   */
  public WindowState getWindowState() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getPreferences()
   */
  public PortletPreferences getPreferences() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getPortletSession()
   */
  public PortletSession getPortletSession() {
    return session;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getPortletSession(boolean)
   */
  public PortletSession getPortletSession(boolean create) {
    if (session == null) {
      session = new MockPortletSession();
    }
    return session;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getProperty(java.lang.String)
   */
  public String getProperty(String name) {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getProperties(java.lang.String)
   */
  @SuppressWarnings("unchecked")
  public Enumeration getProperties(String name) {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getPropertyNames()
   */
  @SuppressWarnings("unchecked")
  public Enumeration getPropertyNames() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getPortalContext()
   */
  public PortalContext getPortalContext() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getAuthType()
   */
  public String getAuthType() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getContextPath()
   */
  public String getContextPath() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getRemoteUser()
   */
  public String getRemoteUser() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getUserPrincipal()
   */
  public Principal getUserPrincipal() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#isUserInRole(java.lang.String)
   */
  public boolean isUserInRole(String role) {

    return false;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getAttribute(java.lang.String)
   */
  public Object getAttribute(String name) {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getAttributeNames()
   */
  @SuppressWarnings("unchecked")
  public Enumeration getAttributeNames() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getParameter(java.lang.String)
   */
  public String getParameter(String name) {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getParameterNames()
   */
  @SuppressWarnings("unchecked")
  public Enumeration getParameterNames() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getParameterValues(java.lang.String)
   */
  public String[] getParameterValues(String name) {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getParameterMap()
   */
  @SuppressWarnings("unchecked")
  public Map getParameterMap() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#isSecure()
   */
  public boolean isSecure() {

    return false;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#setAttribute(java.lang.String,
   * java.lang.Object)
   */
  public void setAttribute(String name, Object o) {

  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#removeAttribute(java.lang.String)
   */
  public void removeAttribute(String name) {

  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getRequestedSessionId()
   */
  public String getRequestedSessionId() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#isRequestedSessionIdValid()
   */
  public boolean isRequestedSessionIdValid() {

    return false;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getResponseContentType()
   */
  public String getResponseContentType() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getResponseContentTypes()
   */
  @SuppressWarnings("unchecked")
  public Enumeration getResponseContentTypes() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getLocale()
   */
  public Locale getLocale() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getScheme()
   */
  public String getScheme() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getServerName()
   */
  public String getServerName() {

    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.portlet.PortletRequest#getServerPort()
   */
  public int getServerPort() {

    return 0;
  }

  @SuppressWarnings("unchecked")
  public Enumeration getLocales() {
    return null;
  }

}
