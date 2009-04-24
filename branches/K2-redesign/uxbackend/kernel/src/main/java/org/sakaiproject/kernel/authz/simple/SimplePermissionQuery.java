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

import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.kernel.api.authz.QueryStatement;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class SimplePermissionQuery implements PermissionQuery {

  private String name;
  private List<QueryStatement> queryStatements = new ArrayList<QueryStatement>();

  /**
   *
   */
  public SimplePermissionQuery(String name) {
    this.name = name;
  }
  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.PermissionQuery#getQueryToken(java.lang.String)
   */
  public String getQueryToken(String resourceReference) {
    return resourceReference+"?q="+name;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.PermissionQuery#statements()
   */
  public Iterable<QueryStatement> statements() {
    return queryStatements;
  }

  public void addQueryStatement(QueryStatement queryStatement) {
    queryStatements.add(queryStatement);
  }

  /**
   * {@inheritDoc}
   * @see java.lang.Object#toString()
   */
  @Override
  public String toString() {
    return name;
  }
}
