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
 * This service resolves ACL questions by testing security assertions.
 */
public interface AuthzResolverService {

  /**
   * Check the permission query against the resource for the current request
   * context/environment
   *
   * @param resourceReference
   *          a reference to the resource being checked
   * @param permissionQuery
   *          a query to be applied to the resource.
   * @throws PermissionDeniedException
   *           if the permission is denied. This is a runtime exception and may
   *           or may not be caught by the calling method. If it is not,
   *           eventually it should be caught by the request filter.
   */
  void check(String resourceReference, PermissionQuery permissionQuery)
      throws PermissionDeniedException;

  /**
   * Clear the request grant
   */
  void clearRequestGrant();

  /**
   * Set a request grant that allows all operations on this thread, calling this
   * method by passes all security, and will be logged.
   */
  void setRequestGrant(String reason);

  /**
   * Invalidate ACLs associated with the Reference Object.
   *
   * @param referencedObject
   */
  void invalidateAcl(ReferencedObject referencedObject);

  /**
   * @return return the current request grant if there is one, otherwise null.
   */
  String getRequestGrant();

}
