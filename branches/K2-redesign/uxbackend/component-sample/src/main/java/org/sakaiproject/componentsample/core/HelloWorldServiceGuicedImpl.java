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
package org.sakaiproject.componentsample.core;

import com.google.inject.Inject;

import org.sakaiproject.componentsample.api.HelloWorldService;
import org.sakaiproject.componentsample.api.InternalDateService;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;
import org.sakaiproject.kernel.model.GroupMembershipBean;
import org.sakaiproject.kernel.util.rest.RestDescription;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jcr.Repository;
import javax.persistence.EntityManager;
import javax.persistence.Query;

/**
 * This is the service implementation.
 */
public class HelloWorldServiceGuicedImpl implements HelloWorldService,
    Documentable {
  /**
   *
   */
  private static final RestDescription REST_DOCS;
  static {
    REST_DOCS = new RestDescription();
    REST_DOCS
        .setTitle("This is the rest interface to the hello world service.");
    REST_DOCS.setShortDescription("Sample rest service");
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.rest.Documentable#getRestDocumentation()
   */
  public RestDescription getRestDocumentation() {
    return REST_DOCS;
  }

  /**
   * The internal service that will provide dates.
   */
  private InternalDateService internalDateService;
  /**
   *
   */
  private JCRService jcrService;
  /**
   *
   */
  private EntityManager entityManager;
  /**
   *
   */
  private JaxRsSingletonProvider provider;

  /**
   * A constructor that supports injection, so I know that when the class is
   * created, it is complete and ready for use.
   *
   * @param pInternalDateService
   *          an instance of the InternalDateService that I want this to use.
   * @param pJcrService
   *          an instance of the JCRService that I want this to use.
   * @param pEntityManager
   *          an instance of the EntityManager that I want this to use.
   */
  @Inject
  public HelloWorldServiceGuicedImpl(InternalDateService pInternalDateService,
      JCRService pJcrService, EntityManager pEntityManager) {
    this.internalDateService = pInternalDateService;
    this.jcrService = pJcrService;
    this.entityManager = pEntityManager;
    Registry<String, JaxRsSingletonProvider> jaxRsSingletonRegistry = new KernelManager()
        .getService(RegistryService.class).getRegistry(
            JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY);
    final HelloWorldServiceGuicedImpl service = this;
    provider = new JaxRsSingletonProvider() {
      public Documentable getJaxRsSingleton() {
        return service;
      }

      public String getKey() {
        return service.getClass().getName();
      }

      public int getPriority() {
        return 0;
      }

      public String toString() {
        return "Provider for: " + service.toString();
      }
    };
    jaxRsSingletonRegistry.add(provider);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.componentsample.api.HelloWorldService#getGreeting()
   */
  public String getGreeting() {
    return "Hi there, the time is " + internalDateService.getDate();
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.componentsample.api.HelloWorldService#getJCRInfo()
   */
  public Map<String, String> getJCRInfo() {
    // Get some info about the JCR Repository
    Repository repo = jcrService.getRepository();
    String[] jcrDesKeys = repo.getDescriptorKeys();
    Map<String, String> jcrInfo = new HashMap<String, String>();
    for (String key : jcrDesKeys) {
      jcrInfo.put(key, repo.getDescriptor(key));
    }
    return jcrInfo;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.componentsample.api.HelloWorldService#getJPAInfo()
   */
  public Map<String, String> getJPAInfo() {
    // // You could write your own JPA query that would look like:
    // @SuppressWarnings("unchecked")
    // List<GroupMembershipBean> groupMemberships =
    // entityManager.createQuery("select g from  GroupMembershipBean g"
    // ).getResultList();

    // We're going to use an existing named query for the example though
    Query adminGroupQuery = entityManager
        .createNamedQuery(GroupMembershipBean.FINDBY_USER);
    adminGroupQuery.setParameter(GroupMembershipBean.USER_PARAM, "admin");
    @SuppressWarnings("unchecked")
    List<GroupMembershipBean> adminGroupList = adminGroupQuery.getResultList();

    // The rest of this is just parsing out the result for display purposes
    Map<String, String> adminGroups = new HashMap<String, String>();
    for (GroupMembershipBean gmb : adminGroupList) {
      adminGroups.put(gmb.getGroupId(), gmb.getRoleId());
    }
    return adminGroups;
  }
}
