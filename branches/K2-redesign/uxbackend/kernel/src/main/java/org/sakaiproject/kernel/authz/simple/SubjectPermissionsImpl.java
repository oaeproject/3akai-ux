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
package org.sakaiproject.kernel.authz.simple;

import org.sakaiproject.kernel.api.authz.SubjectPermissions;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 *
 */
public class SubjectPermissionsImpl implements SubjectPermissions {

  private Map<String, String> permissionMap = new ConcurrentHashMap<String, String>();
  private String subjectToken;

  /**
   * @param groupId
   */
  public SubjectPermissionsImpl(String subjectToken) {
    this.subjectToken = subjectToken;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.GroupPermissions#add(java.lang.String, java.lang.String)
   */
  public void add(String role, String permission) {
    String roles = permissionMap.get(permission);
    if ( roles == null ) {
      permissionMap.put(permission, role);
    } else {
      permissionMap.put(permission, roles+";"+role);
    }
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.SubjectPermissions#hasPermission(java.lang.String)
   */
  public boolean hasPermission(String permissionToken) {
    return permissionMap.containsKey(permissionToken);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.SubjectPermissions#getSubjectToken()
   */
  public String getSubjectToken() {
    return subjectToken;
  }


}
