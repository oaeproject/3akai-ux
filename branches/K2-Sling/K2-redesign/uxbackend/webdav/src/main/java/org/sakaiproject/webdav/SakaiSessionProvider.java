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

package org.sakaiproject.webdav;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.jackrabbit.server.SessionProvider;
import org.sakaiproject.kernel.api.jcr.JCRService;

import javax.jcr.LoginException;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.servlet.http.HttpServletRequest;

/**
 * 
 */
public class SakaiSessionProvider implements SessionProvider {
  private static final Log LOG = LogFactory.getLog(SakaiSessionProvider.class);
  private JCRService jcrService;

  /**
   * @param jcrService
   */
  public SakaiSessionProvider(JCRService jcrService) {
    this.jcrService = jcrService;
  }

  public Session getSession(HttpServletRequest request, Repository rep,
      String workspace) throws LoginException {
    String user = request.getRemoteUser();
    if ( user == null || "anon".equals(user) ) {
      throw new LoginException("Authentication Required");
    }

    try {
      return jcrService.login();
    } catch (RepositoryException e) {
      LOG.error("Login Failed ",e);
      throw new LoginException("Authentication for WebDAV, failed ", e);
    }
  }

  public void releaseSession(Session session) {
    try {
      jcrService.logout();
    } catch (LoginException e) {
      LOG.error("Failed to logout ", e);
    } catch (RepositoryException e) {
      LOG.error("Failed to logout ", e);
    }
  }

}
