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

import com.google.common.collect.Maps;

import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;
import org.sakaiproject.kernel.authz.minimal.MinimalPermissionQueryImpl;

import java.util.Map;

/**
 * A simple static map of common permissions.
 */
public class SimplePermissionQueryService implements PermissionQueryService {

  private static final Map<String, PermissionQuery> PERMISSIONS = Maps
      .newConcurrentHashMap();
  private static final String[] PERMISSION_NAMES = {PermissionQuery.READ,
      PermissionQuery.REMOVE, PermissionQuery.WRITE, PermissionQuery.ADMIN_READ,
      PermissionQuery.ADMIN_REMOVE, PermissionQuery.ADMIN_WRITE,
      PermissionQuery.CREATE_SITE};
  static {
    for (String permission : PERMISSION_NAMES) {
      SimplePermissionQuery q = new SimplePermissionQuery(permission);
      q.addQueryStatement(new SimpleQueryStatement(permission));
      PERMISSIONS.put(permission, q);
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.PermissionQueryService#getPermission(java.lang.String)
   */
  public PermissionQuery getPermission(String name) {
    PermissionQuery pq = PERMISSIONS.get(name);
    if (pq == null) {
      pq = new MinimalPermissionQueryImpl(name);
      PERMISSIONS.put(name, pq);
    }
    return pq;
  }

}
