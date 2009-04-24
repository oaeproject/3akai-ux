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
package org.sakaiproject.kernel.memory;

import org.sakaiproject.kernel.api.memory.Cache;

import java.util.HashMap;
import java.util.Map;

/**
 * Represents a Cache stored on the thread, used in the request thread and in other threads.
 * When used in Threads there is a potential for memory leaks as perm space is not cleaned up.
 * This will be caused by references to classloaders being in the Map, and keeping the classloaders
 * open.
 */
public class ThreadLocalCacheMap extends ThreadLocal<Map<String,Cache<?>>> {
  /**
   * {@inheritDoc}
   * @see java.lang.ThreadLocal#initialValue()
   */
  @Override
  protected Map<String, Cache<?>> initialValue() {
    return new HashMap<String, Cache<?>>();
  }





}
