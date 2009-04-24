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
package org.sakaiproject.kernel.api;

/**
 * Failed to perform an update.
 */
public class UpdateFailedException extends RuntimeException {

  /**
   *
   */
  private static final long serialVersionUID = 2347811755024042066L;

  /**
   *
   */
  public UpdateFailedException() {
  }

  /**
   * @param message
   */
  public UpdateFailedException(String message) {
    super(message);
  }

  /**
   * @param cause
   */
  public UpdateFailedException(Throwable cause) {
    super(cause);
  }

  /**
   * @param message
   * @param cause
   */
  public UpdateFailedException(String message, Throwable cause) {
    super(message, cause);
  }

}
