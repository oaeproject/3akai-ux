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
package org.sakaiproject.kernel.api.user;

/**
 * A user info bean defines the properties associated with the user, its a
 * heavir weight object that is not so fast to retrieve comparet with the User
 * object.
 */
public interface UserInfo {

  /**
   * @return the user object defining the user that this is related to.
   */
  User getUser();

  /**
   * Get a property from user info.
   *
   * @param name
   *          the name of the property
   * @return
   */
  String getProperty(String name);

  /**
   * Set a user info property.
   *
   * @param name
   *          the name of the property
   * @param value
   *          the value of the property
   */
  void setProperty(String name, String value);
}
