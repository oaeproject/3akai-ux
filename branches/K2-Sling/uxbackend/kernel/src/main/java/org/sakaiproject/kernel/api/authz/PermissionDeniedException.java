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
 * A permission denied exception is thrown whenever a permission to an authz
 * query is denied. We do this so that permission exceptions that are not handled where they are made
 * bubble up through the call stack. It is a runtime Exception since we dont want to have to make
 * everything catch it, but it will be caught by the request filter.
 */
public class PermissionDeniedException extends RuntimeException {

  /**
   *
   */
  private static final long serialVersionUID = 8467809606038415385L;

  /**
   *
   */
  public PermissionDeniedException() {
  }

  /**
   * @param message
   */
  public PermissionDeniedException(String message) {
    super(message);
  }

  /**
   * @param cause
   */
  public PermissionDeniedException(Throwable cause) {
    super(cause);
  }

  /**
   * @param message
   * @param cause
   */
  public PermissionDeniedException(String message, Throwable cause) {
    super(message, cause);
  }

}
