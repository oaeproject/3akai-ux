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
package org.sakaiproject.kernel;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.google.inject.util.ReferenceMap;
import com.google.inject.util.ReferenceType;

import java.util.Map;

import javax.servlet.http.HttpSession;

/**
 * THis is a weak session map that will only hold references as long as the
 * underlying sessions are still strongly referenced, if they are not strongly
 * reference because they have expired, they will appear not to exist in the
 * map. This is in a provider since its possible others want to change the way
 * sessions are centralized.
 */
@Singleton
public class SessionMapProvider implements Provider<Map<String, HttpSession>> {

  private ReferenceMap<String, HttpSession> map;

  /**
   * Create the session map provider
   */
  @Inject
  public SessionMapProvider() {
    map = new ReferenceMap<String, HttpSession>(ReferenceType.STRONG,
        ReferenceType.WEAK);
  }

  /**
   * {@inheritDoc}
   *
   * @see com.google.inject.Provider#get()
   */
  public Map<String, HttpSession> get() {
    return map;
  }

}
