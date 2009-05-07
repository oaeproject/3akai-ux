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

import org.sakaiproject.kernel.api.authz.SubjectPermissionService;
import org.sakaiproject.kernel.api.authz.SubjectPermissions;
import org.sakaiproject.kernel.api.authz.UserSubjects;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 *
 */
public class SubjectsBean extends HashMap<String,String> implements UserSubjects {

  private transient Map<String, SubjectPermissions> subjectPermissionMap = new ConcurrentHashMap<String, SubjectPermissions>();
  private SubjectPermissionService subjectPermissionService;
  /**
   *
   */
  private static final long serialVersionUID = 2937100683358538764L;


  /**
   * @param subjectPermissionService
   */
  public SubjectsBean(SubjectPermissionService subjectPermissionService) {
    this.subjectPermissionService = subjectPermissionService;
  }

  /**
   * @param subjectToken
   * @return
   */
  public boolean hasSubject(String subjectToken) {
    return containsKey(subjectToken);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.UserSubjects#addSubjectPermissions(org.sakaiproject.kernel.api.authz.SubjectPermissions)
   */
  public void addSubjectPermissions(SubjectPermissions subjectPermissions) {
    String subjectToken = subjectPermissions.getSubjectToken();
    subjectPermissionMap.put(subjectToken, subjectPermissions);
    containsKey(subjectToken);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.UserSubjects#getSubjectPermissions(java.lang.String)
   */
  public SubjectPermissions getSubjectPermissions(String subjectToken) {
    if ( containsKey(subjectToken) ) {
      SubjectPermissions subjectPermissions = subjectPermissionMap.get(subjectToken);
      if ( subjectPermissions == null ) {
        subjectPermissions = loadSubjectPermissions(subjectToken);
      }
      return subjectPermissions;
    }
    return null;
  }

  /**
   *
   */
  private synchronized SubjectPermissions loadSubjectPermissions(String subjectToken) {
     return subjectPermissionService.fetchSubjectPermissions(subjectPermissionMap,subjectToken);
  }

  /**
   * @param subjectService
   */
  public synchronized void setSubjectPermissionService(SubjectPermissionService subjectPermissionService) {
    this.subjectPermissionService = subjectPermissionService;
  }


}
