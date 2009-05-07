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
package org.sakaiproject.kernel.authz.minimal;

import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A mimimal permission query service that just generates a default permission
 * query regardless of the question
 */
public class MinimalPermissionQueryServiceImpl  implements PermissionQueryService {


  private Map<String, PermissionQuery> queryMap = new ConcurrentHashMap<String, PermissionQuery>();

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.PermissionQueryService#getPermission(java.lang.String)
   */
  public PermissionQuery getPermission(String name) {

    if ( queryMap.containsKey(name) ) {
      return queryMap.get(name);
    }
    PermissionQuery pq = new MinimalPermissionQueryImpl(name);
    queryMap.put(name,pq);
    return pq;
  }

}
