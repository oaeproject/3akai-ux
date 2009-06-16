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

import com.google.inject.Inject;

import org.sakaiproject.kernel.api.authz.SubjectPermissionService;
import org.sakaiproject.kernel.api.authz.SubjectPermissions;
import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.model.SubjectPermissionBean;

import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.Query;

/**
 *
 */
public class SubjectPermissionServiceImpl implements SubjectPermissionService {

  private Cache<SubjectPermissions> subjectPermissionCache;
  private EntityManager entityManager;

  /**
   *
   */
  @Inject
  public SubjectPermissionServiceImpl(CacheManagerService cacheManagerService,
      EntityManager entityManager) {
    subjectPermissionCache = cacheManagerService.getCache(
        "subjectPermissionCache", CacheScope.CLUSTERINVALIDATED);
    this.entityManager = entityManager;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.SubjectPermissionService#
   * fetchSubjectPermissions(java.util.Map, java.lang.String)
   */
  @SuppressWarnings("unchecked")
  public SubjectPermissions fetchSubjectPermissions(
      Map<String, SubjectPermissions> subjectPermissionMap, String subjectToken) {
    SubjectPermissions subjectPermissions = subjectPermissionMap
        .get(subjectToken);
    if (subjectPermissions == null) {
      subjectPermissions = subjectPermissionCache.get(subjectToken);
      if (subjectPermissions == null) {
        subjectPermissions = new SubjectPermissionsImpl(subjectToken);
        Query q = entityManager
            .createNamedQuery(SubjectPermissionBean.FINDBY_SUBJECT);
        q.setParameter(SubjectPermissionBean.PARAM_SUBJECT, subjectToken);
        List<SubjectPermissionBean> subjectPermissionList = q.getResultList();
        for (SubjectPermissionBean sp : subjectPermissionList) {
          subjectPermissions.add(sp.getRole(), sp.getPermissionToken());
        }
        subjectPermissionCache.put(subjectToken,subjectPermissions);
      }
      subjectPermissionMap.put(subjectToken, subjectPermissions);
    }
    return subjectPermissions;
  }

  /**
   * @param subjectToken
   */
  public void expire(String subjectToken) {
    subjectPermissionCache.remove(subjectToken);
  }

}
