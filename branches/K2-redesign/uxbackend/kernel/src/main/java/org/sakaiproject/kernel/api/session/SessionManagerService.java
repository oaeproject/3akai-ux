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
package org.sakaiproject.kernel.api.session;

import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * The session manager service manages sessions
 */
public interface SessionManagerService {

  /**
   *
   * @return the current session bound to the thread.
   */
  Session getCurrentSession();

  /**
   * @param request
   *          bind the current request to the thread
   */
  void bindRequest(ServletRequest request);

  /**
   * @param request
   * @param response
   * @return
   */
  HttpSession getSession(HttpServletRequest request,
      HttpServletResponse response, boolean create);

  /**
   * Get the current user, but dont create a session, if there isnt one there
   * already.
   *
   * @return
   */
  String getCurrentUserId();

}
