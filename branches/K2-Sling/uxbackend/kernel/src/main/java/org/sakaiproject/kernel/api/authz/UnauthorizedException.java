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
package org.sakaiproject.kernel.api.authz;

/**
 * Where a users action is denied because their identity is not known, an
 * Unauthorized exception should be thrown.
 */
public class UnauthorizedException extends PermissionDeniedException {

  /**
   *
   */
  private static final long serialVersionUID = 654489576668771L;

  /**
   *
   */
  public UnauthorizedException() {
  }

  /**
   * @param message
   */
  public UnauthorizedException(String message) {
    super(message);
  }

  /**
   * @param cause
   */
  public UnauthorizedException(Throwable cause) {
    super(cause);
  }

  /**
   * @param message
   * @param cause
   */
  public UnauthorizedException(String message, Throwable cause) {
    super(message, cause);
  }

}
