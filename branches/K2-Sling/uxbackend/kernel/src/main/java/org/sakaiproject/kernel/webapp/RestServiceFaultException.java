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

import javax.servlet.http.HttpServletResponse;

/**
 *
 */
public class RestServiceFaultException extends RuntimeException {

  /**
   *
   */
  private static final long serialVersionUID = -8421854922253600612L;
  private int statusCode = HttpServletResponse.SC_INTERNAL_SERVER_ERROR;

  /**
   *
   */
  public RestServiceFaultException() {
  }

  /**
   * @param message
   */
  public RestServiceFaultException(String message) {
    super(message);
  }

  /**
   * @param cause
   */
  public RestServiceFaultException(Throwable cause) {
    super(cause);
  }

  /**
   * @param message
   * @param cause
   */
  public RestServiceFaultException(String message, Throwable cause) {
    super(message, cause);
  }
  /**
   * @param statusCode the status code to associate with the fault
   */
  public RestServiceFaultException(int statusCode) {
    this.statusCode = statusCode;
  }
  /**
   * @param statusCode the status code to associate with the fault
   * @param message
   */
  public RestServiceFaultException(int statusCode, String message) {
    super(message);
    this.statusCode = statusCode;
  }
  /**
   * @param statusCode the status code to associate with the fault
   * @param cause
   */
  public RestServiceFaultException(int statusCode, Throwable cause) {
    super(cause);
    this.statusCode = statusCode;
  }
  /**
   * @param statusCode the status code to associate with the fault
   * @param message
   * @param cause
   */
  public RestServiceFaultException(int statusCode, String message, Throwable cause) {
    super(message, cause);
    this.statusCode = statusCode;
  }

  /**
   * @return the statusCode
   */
  public int getStatusCode() {
    return statusCode;
  }

}
