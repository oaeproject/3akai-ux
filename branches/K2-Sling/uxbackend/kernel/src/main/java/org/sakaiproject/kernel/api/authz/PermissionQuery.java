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
package org.sakaiproject.kernel.api.authz;

/**
 * A permission query is a container for permissions that is connected with an object and
 * a user to resolve a permission question
 */
public interface PermissionQuery {

  /**
   * Standard read statement key. (there can be more than read,write,remove)
   */
  public static final String READ = "read";
  /**
   * Standard write statement key. (there can be more than read,write,remove)
   */
  public static final String WRITE = "write";
  /**
   * Standard remove statement key. (there can be more than read,write,remove)
   */
  public static final String REMOVE = "remove";
  /**
   * Read statement key for administrative properties and nodes.
   */
  public static final String ADMIN_READ = "aread";
  /**
   * Write statement key for administrative properties and nodes.
   */
  public static final String ADMIN_WRITE = "awrite";
  /**
   * Remove statement key for administrative properties and nodes.
   */
  public static final String ADMIN_REMOVE = "aremove";
  
  public static final String CREATE_SITE = "create.site";

  /**
   * @return a list of statements that should be evaluated in order to represent this
   *         query.
   */
  Iterable<QueryStatement> statements();

  /**
   * Get a token for this permission query on the supplied resource. The method must
   * return the same QueryToken for the same permission on the same resource, as this is
   * used to identify the results of this permission query against the supplied resource
   * in a cache.
   *
   * @param resourceReference
   * @return the token representing the query on the resource.
   */
  String getQueryToken(String resourceReference);

}
