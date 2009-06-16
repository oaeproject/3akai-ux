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
package org.sakaiproject.kernel.util.user;

import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserInfo;

import java.util.concurrent.ConcurrentHashMap;

/**
 *
 */
public class NullUserInfo extends ConcurrentHashMap<String, String> implements UserInfo {

  /**
   *
   */
  private static final long serialVersionUID = -1356666236972530577L;
  private User user;

  /**
   * @param user2
   */
  public NullUserInfo(User user) {
    this.user = user;
  }

  /**
   *
   */
  public NullUserInfo() {
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.UserInfo#getProperty(java.lang.String)
   */
  public String getProperty(String name) {
    return super.get(name);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.UserInfo#getUser()
   */
  public User getUser() {
    return user;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.UserInfo#setProperty(java.lang.String, java.lang.String)
   */
  public void setProperty(String name, String value) {
    super.put(name, value);
   }
}
