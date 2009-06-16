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
package org.sakaiproject.kernel.webapp;

import org.sakaiproject.kernel.api.session.SessionManagerService;

import java.io.IOException;

import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

/**
 *
 */
public class SakaiServletResponse extends HttpServletResponseWrapper {

  private int statusCode;
  private String message;
  private boolean error;
  private boolean explicit;

  /**
   * @param response
   * @param sessionManagerService
   */
  public SakaiServletResponse(ServletResponse response) {
    super((HttpServletResponse) response);
    error = false;
    explicit = false;
  }

  public void commitStatus(SessionManagerService sessionManagerService) throws IOException {
    if (explicit && !super.isCommitted()) {
      String userId = sessionManagerService.getCurrentUserId();
      if (userId == null || "anon".equals(userId)) {
        // if there is no user a 404,403 could be because the item is protected,
        // but they can't
        // see that, so to find out if that is really the case they must
        // login... hence the 401
        // this can't be done deeper in as the access manager needs to deny
        // access silently to
        // nodes you can't see. Only when you try and update a node that you
        // can't see will
        // you find out you can't.
        switch (statusCode) {
        case HttpServletResponse.SC_NOT_FOUND:
          statusCode = HttpServletResponse.SC_UNAUTHORIZED;
          break;
        case HttpServletResponse.SC_FORBIDDEN:
          statusCode = HttpServletResponse.SC_UNAUTHORIZED;
          break;
        default:
        }
      }

      if ( error ) {
        if ( message != null ) {
          super.sendError(statusCode,message);
        } else {
          super.sendError(statusCode);
        }
      } else {
        if ( message != null ) {
          super.setStatus(statusCode, message);
        } else {
          super.setStatus(statusCode);
        }
      }
    }
  }

  /**
   * @return the statusCode
   */
  public int getStatusCode() {
    return statusCode;
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpServletResponseWrapper#sendError(int)
   */
  @Override
  public void sendError(int sc) throws IOException {
    statusCode = sc;
    error = true;
    explicit = true;
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpServletResponseWrapper#sendError(int,
   *      java.lang.String)
   */
  @Override
  public void sendError(int sc, String msg) throws IOException {
    statusCode = sc;
    message = msg;
    error = true;
    explicit = true;
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpServletResponseWrapper#setStatus(int)
   */
  @Override
  public void setStatus(int sc) {
    statusCode = sc;
    error = false;
    explicit = true;
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.http.HttpServletResponseWrapper#setStatus(int,
   *      java.lang.String)
   */
  @Override
  public void setStatus(int sc, String sm) {
    statusCode = sc;
    message = sm;
    error = false;
    explicit = true;
  }

}
