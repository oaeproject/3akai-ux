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
package org.sakaiproject.kernel.user.jcr;

import com.google.inject.Inject;
import com.google.inject.Singleton;

import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserInfo;
import org.sakaiproject.kernel.api.user.UserResolverProvider;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.model.UserBean;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.Query;

/**
 *
 */
@Singleton
public class JcrUserResolverProvider implements UserResolverProvider {

  private static final String USERCACHE = "userbean.cache";
  private EntityManager entityManager;
  private Cache<User> cache;
  private UserEnvironmentResolverService userEnvironmentResolverService;

  /**
   *
   */
  @Inject
  public JcrUserResolverProvider(EntityManager entityManager,
      CacheManagerService cacheManagerService,
      UserEnvironmentResolverService userEnvironmentResolverService,
      RegistryService registryService) {
    this.entityManager = entityManager;
    cache = cacheManagerService.getCache(USERCACHE, CacheScope.INSTANCE);
    this.userEnvironmentResolverService = userEnvironmentResolverService;

    // register as a user resolver
    Registry<String, UserResolverProvider> userResolverRegistry = registryService
        .getRegistry(KernelConstants.USER_PROVIDER_REGISTRY);
    userResolverRegistry.add(this);

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserResolverProvider#resolve(java.lang.String)
   */
  public User resolve(String eid) {
    User u = cache.get("eid:"+eid);
    if (u == null) {
      Query query = entityManager.createNamedQuery(UserBean.FINDBY_EID);
      query.setParameter(UserBean.EID_PARAM, eid);
      List<?> results = query.getResultList();
      System.err.println("Got "+results.size()+" users");
      if (results.size() > 0) {
        u = (User) results.get(0);
        cache.put("eid:"+eid, u);
      }
    }
    return u;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserResolverProvider#resolve(org.sakaiproject.kernel.api.user.User)
   */
  public UserInfo resolve(User user) {
    UserEnvironment ue = userEnvironmentResolverService.resolve(user);
    if (ue != null) {
      return ue.getUserInfo();
    }
    return null;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return "jcr-user-provider-property";
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getPriority()
   */
  public int getPriority() {
    return 0;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.UserResolverProvider#resolveWithUUID(java.lang.String)
   */
  public User resolveWithUUID(String uuid) {
    User u = cache.get("uid:"+uuid);
    if (u == null) {
      Query query = entityManager.createNamedQuery(UserBean.FINDBY_UID);
      query.setParameter(UserBean.UID_PARAM, uuid);
      List<?> results = query.getResultList();
      System.err.println("Got "+results.size()+" users");
      if (results.size() > 0) {
        u = (User) results.get(0);
        cache.put("uid:"+uuid, u);
      }
    }
    return u;
  }

}
