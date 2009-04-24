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

package org.sakaiproject.kernel.loader.server.jetty;

import org.mortbay.component.LifeCycle;
import org.sakaiproject.kernel.loader.common.CommonLifecycle;
import org.sakaiproject.kernel.loader.server.LoaderEnvironment;

/**
 * A Jetty Loader, that uses a single classloader and operates as a top level Jetty Component.
 * @author ieb
 *
 */
public class KernelLoader implements LifeCycle {

  /**
   * The lifecycle object.
   */
  private CommonLifecycle<?> kernelLifecycle;

  /**
   * true if failed to start.
   */
  private boolean failed = false;

  /**
   * true if running.
   */
  private boolean running = false;

  /**
   * true if started.
   */
  private boolean started = false;

  /**
   * true if starting.
   */
  private boolean starting = false;

  /**
   * true if stopped.
   */
  private boolean stopped = false;

  /**
   * true if stopping.
   */
  private boolean stopping = false;



  /**
   * Start the kernel.
   * @throws Exception if the lifecycle fails to respondto the start lifecycle operation.
   */
  public void start() throws Exception {
    if (starting || running || started) {
      return;
    }
    starting = true;

    ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
    try {

      Class<CommonLifecycle<?>> clazz = LoaderEnvironment.getLifecyleClass(currentClassLoader);
      kernelLifecycle = clazz.newInstance();
      kernelLifecycle.start();
      failed = false;
      running  = true;
      started = true;
      stopped = false;

    } finally {
      starting = false;
    }
  }

  /**
   * Stop the kernel.
   * @throws Exception if there is a problem with the lifecycle stop operation.
   */
  public void stop() throws Exception {
    if (stopping) {
      return;
    }
    stopping = true;
    try {
      kernelLifecycle.stop();
      failed = false;
      running  = false;
      started = false;
      stopped = true;
    } finally {
      stopping = false;
    }
  }

  /**
   * @return true if start failed.
   */
  public boolean isFailed() {
    return failed;
  }

  /**
   * @return true if running.
   */
  public boolean isRunning() {
    return running;
  }

  /**
   * @return true if started.
   */
  public boolean isStarted() {
   return started;
  }

  /**
   * @return true if starting.
   */
  public boolean isStarting() {
    return starting;
  }

  /**
   * @return true if stopped.
   */
  public boolean isStopped() {
    return stopped;
  }

  /**
   * @return true if stopped.
   */
  public boolean isStopping() {
    return stopping;
  }

}
