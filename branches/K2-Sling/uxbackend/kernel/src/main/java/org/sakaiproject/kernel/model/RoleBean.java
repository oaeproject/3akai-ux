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
package org.sakaiproject.kernel.model;

import org.sakaiproject.kernel.util.ArrayUtils;

/**
 *
 */
public class RoleBean {

  private String name = "undefined";
  private String[] permissions = new String[0];

  /**
   *
   */
  public RoleBean() {
  }

  /**
   * @param string
   * @param strings
   */
  public RoleBean(String name, String[] permissions) {
    this.name = name;
    this.permissions = ArrayUtils.copy(permissions, new String[permissions.length]);
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @param name the name to set
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * @return the permissions
   */
  public String[] getPermissions() {
    return ArrayUtils.copy(permissions, new String[permissions.length]);
  }

  /**
   * @param permissions the permissions to set
   */
  public void setPermissions(String[] permissions) {
    this.permissions = ArrayUtils.copy(permissions, new String[permissions.length]);
  }

  /**
   * @param name2
   * @return
   */
  public String getSubjectToken(String group) {
    return group+":"+name;
  }
}
