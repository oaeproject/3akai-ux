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
 * Indicates that there was a failure with the operation in the service manager.
 * The message will give more information on the nature of the failure.
 */
public class ServiceManagerException extends Exception {

  /**
   * {@inheritDoc}
   */
  private static final long serialVersionUID = -2300463444645444286L;

  /**
   * {@inheritDoc}
   */
  public ServiceManagerException() {
  }

  /**
   * {@inheritDoc}
   */
  public ServiceManagerException(String arg0) {
    super(arg0);
  }

  /**
   * {@inheritDoc}
   */
  public ServiceManagerException(Throwable arg0) {
    super(arg0);
  }

  /**
   * {@inheritDoc}
   */
  public ServiceManagerException(String arg0, Throwable arg1) {
    super(arg0, arg1);
  }

}
