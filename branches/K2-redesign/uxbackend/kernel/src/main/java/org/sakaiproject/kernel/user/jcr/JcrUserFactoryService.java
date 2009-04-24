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
import com.google.inject.name.Named;

import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.model.UserBean;
import org.sakaiproject.kernel.util.MapUtils;
import org.sakaiproject.kernel.util.PathUtils;
import org.sakaiproject.kernel.util.StringUtils;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

import javax.persistence.EntityManager;

/**
 * Creates User information for the JCR style ot user storage.
 */
@Singleton
public class JcrUserFactoryService implements UserFactoryService {


  private EntityManager entityManager;
  private String userEnvironmentBase;
  private Map<String, String> userTemplateMap;
  private String defaultTemplate;
  long entropy = System.currentTimeMillis();
  private String sharedPrivatePathBase;
  private String defaultProfileTemplate;
  private Map<String, String> profileTemplateMap;
  private String privatePathBase;

  /**
   *
   */
  @Inject
  public JcrUserFactoryService(EntityManager entityManager,
      @Named(KernelConstants.JCR_USERENV_BASE) String userEnvironmentBase,
      @Named(KernelConstants.JCR_USERENV_TEMPLATES) String userTemplates,
      @Named(KernelConstants.JCR_DEFAULT_TEMPLATE) String defaultTemplate,
      @Named(KernelConstants.PRIVATE_SHARED_PATH_BASE) String sharedPrivatePathBase,
      @Named(KernelConstants.PRIVATE_PATH_BASE) String privatePathBase,
      @Named(KernelConstants.JCR_PROFILE_TEMPLATES) String profileTemplates,
      @Named(KernelConstants.JCR_PROFILE_DEFAUT_TEMPLATES) String defaultProfileTemplate

      ) {
    this.entityManager = entityManager;
    this.defaultTemplate = defaultTemplate;
    this.defaultProfileTemplate = defaultProfileTemplate;
    this.userEnvironmentBase = userEnvironmentBase;
    this.privatePathBase = privatePathBase;


    userTemplateMap = MapUtils.convertToImmutableMap(userTemplates);
    profileTemplateMap = MapUtils.convertToImmutableMap(profileTemplates);
    this.sharedPrivatePathBase =sharedPrivatePathBase;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#createNewUser(java.lang.String)
   */
  public User createNewUser(String externalId) {
    try {
      String uid = StringUtils.sha1Hash(externalId + entropy);
      UserBean ub = new UserBean(uid, externalId);
      entityManager.persist(ub);
      return ub;
    } catch (UnsupportedEncodingException e) {
      throw new RuntimeException("Failed to generate new user ", e);
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException("Failed to generate new user ", e);
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#getUserEnvPath(java.lang.String)
   */
  public String getUserEnvPath(String uuid) {
    return getUserEnvironmentBasePath(uuid) + KernelConstants.USERENV;
  }

  /**
   * @param uuid
   * @return
   */
  public String getUserEnvironmentBasePath(String uuid) {
    String prefix = PathUtils.getUserPrefix(uuid);
    return userEnvironmentBase + prefix;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#getUserEnvTemplate(java.lang.String)
   */
  public String getUserEnvTemplate(String userType) {
    if (userType == null) {
      return defaultTemplate;
    }
    String template = userTemplateMap.get(userType);
    if (template == null) {
      return defaultTemplate;
    }
    return template;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#getUserPathPrefix(java.lang.String)
   */
  public String getUserPathPrefix(String uuid) {
    return PathUtils.getUserPrefix(uuid);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#getUserProfilePath(java.lang.String)
   */
  public String getUserProfilePath(String uuid) {

    return getUserSharedPrivatePath(uuid) + KernelConstants.PROFILE_JSON;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#getUserProfileTempate(java.lang.String)
   */
  public String getUserProfileTempate(String userType) {
    if (userType == null) {
      return defaultProfileTemplate;
    }
    String template = profileTemplateMap.get(userType);
    if (template == null) {
      return defaultProfileTemplate;
    }
    return template;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#getUserPrivatePath(java.lang.String)
   */
  public String getUserPrivatePath(String uuid) {
    return privatePathBase + PathUtils.getUserPrefix(uuid);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#getUserSharedPrivatePath(java.lang.String)
   */
  public String getUserSharedPrivatePath(String uuid) {
    return sharedPrivatePathBase + PathUtils.getUserPrefix(uuid);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#getMessagesPath(java.lang.String)
   */
  public String getMessagesPath(String id) {
    return getUserPrivatePath(id) + KernelConstants.MESSAGES;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserFactoryService#getNewMessagePath(java.lang.String)
   */
  public String getNewMessagePath(String id) {
    return getMessagesPath(id) + "/" + PathUtils.getMessagePrefix();
  }
}
