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

import java.util.Map;

/**
 * Subject service provides information on a users membership and permissions in
 * a Subject, typically a subject is a group but other subjects are possible.
 * The users may have a role in the group or simple be an explicit member of a
 * group. The user will also acquire permissions as a result of their status,
 * anon or auth. The group service need to provide intelligent caching of its
 * objects since it will be under heavy demand from the authz service.
 */
public interface SubjectPermissionService {

  /**
   * @param subjectPermissionMap
   * @param subjectToken
   * @return
   */
  SubjectPermissions fetchSubjectPermissions(
      Map<String, SubjectPermissions> subjectPermissionMap, String subjectToken);

  /**
   * Expire a subject permission from any caches.
   * @param subjectToken
   */
  void expire(String subjectToken);

}
