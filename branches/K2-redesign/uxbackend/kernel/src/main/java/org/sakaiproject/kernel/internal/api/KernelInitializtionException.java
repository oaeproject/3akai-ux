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
package org.sakaiproject.kernel.internal.api;

/**
 * Indicates a failure to initialize the kernel.
 */
public class KernelInitializtionException extends Exception {

  /**
   *
   */
  private static final long serialVersionUID = 4832350249736237665L;

  /**
   *
   */
  public KernelInitializtionException() {
  }

  /**
   * @param message
   */
  public KernelInitializtionException(String message) {
    super(message);
  }

  /**
   * @param cause
   */
  public KernelInitializtionException(Throwable cause) {
    super(cause);
  }

  /**
   * @param message
   * @param cause
   */
  public KernelInitializtionException(String message, Throwable cause) {
    super(message, cause);
  }

}
