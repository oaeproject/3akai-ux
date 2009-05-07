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
package org.sakaiproject.kernel.loader.server.test;

import org.sakaiproject.kernel.loader.common.CommonLifecycle;

/**
 * 
 */
public class DummyKernelLifecycle<T> implements CommonLifecycle<T> {

  private static boolean started;

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.loader.common.CommonLifecycle#destroy()
   */
  public void destroy() {
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.loader.common.CommonLifecycle#getManagedObject()
   */
  public T getManagedObject() {
    return null;
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.loader.common.CommonLifecycle#start()
   */
  public void start() {
    started = true;
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.loader.common.CommonLifecycle#stop()
   */
  public void stop() {
    started = false;

  }

  /**
   * @return
   */
  public static boolean isStarted() {
    return started;
  }

}
