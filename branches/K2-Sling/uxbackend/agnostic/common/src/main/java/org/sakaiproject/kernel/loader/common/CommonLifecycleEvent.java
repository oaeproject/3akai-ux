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

package org.sakaiproject.kernel.loader.common;

/**
 * This enum defines the status events that are emitted from a lifecyle object as it goes through
 * its life.
 *
 * @author ieb
 */
public enum CommonLifecycleEvent {
  /**
   * The component is being inited.
   */
  INIT,
  /**
   * Just before the component starts.
   */
  BEFORE_START,
  /**
   * Just started.
   */
  START,
  /**
   * Just after start.
   */
  AFTER_START,
  /**
   * Just before stop.
   */
  BEFORE_STOP,
  /**
   * Stopped.
   */
  STOP,
  /**
   * Just after stop.
   */
  AFTER_STOP,
  /**
   * Destroyed.
   */
  DESTROY

}
