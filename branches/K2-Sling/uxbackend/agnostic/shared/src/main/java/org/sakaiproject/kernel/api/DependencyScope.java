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
 * Defines the scope of an artifact.
 */
public enum DependencyScope {
  /**
   * Indicates that the dependency should be made available to shared space, in
   * both test and runtime environments.
   */
  SHARE,
  /**
   * Indicates that the dependency should be made available to shared space, but
   * only at runtime.
   */
  SHARE_RUNTIME,

  /**
   * Indicates that the dependency is only available in the current classloader
   * at runtime and in test mode.
   */
  LOCAL,
  /**
   * Indicates that the dependency should only be available in the current
   * classloader at runtime.
   */
  LOCAL_RUNTIME;
}
