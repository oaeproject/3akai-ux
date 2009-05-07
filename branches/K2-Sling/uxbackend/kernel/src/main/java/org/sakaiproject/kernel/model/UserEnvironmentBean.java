/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
package org.sakaiproject.kernel.model;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.authz.ReferencedObject;
import org.sakaiproject.kernel.api.authz.SubjectPermissionService;
import org.sakaiproject.kernel.api.authz.SubjectPermissions;
import org.sakaiproject.kernel.api.authz.SubjectStatement;
import org.sakaiproject.kernel.api.authz.SubjectTokenProvider;
import org.sakaiproject.kernel.api.authz.UserSubjects;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserInfo;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.util.ArrayUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 */
public class UserEnvironmentBean implements UserEnvironment {

  private static final String USER_ENV_TTL = "userenvironment.ttl";
  private static final Log LOG = LogFactory.getLog(UserEnvironmentBean.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private transient long expiry;
  private transient SubjectsBean subjectsBean;
  private transient User user;
  private boolean superUser = false;
  private String[] subjects = new String[0];
  private Map<String, String> properties = new HashMap<String, String>();
  private String uuid;
  private String eid;
  private SubjectPermissionService subjectPermissionService;
  private boolean sealed = false;
  private Registry<String, SubjectTokenProvider<String>> registry;
  private String locale;
  private boolean protect = false;

  @Inject
  public UserEnvironmentBean(SubjectPermissionService subjectPermissionService,
      @Named(USER_ENV_TTL) int ttl, RegistryService registryService) {
    expiry = System.currentTimeMillis() + ttl;
    this.subjectPermissionService = subjectPermissionService;
    this.registry = registryService
        .getRegistry(SubjectStatement.PROVIDER_REGISTRY);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironment#hasExpired()
   */
  public boolean hasExpired() {
    return (System.currentTimeMillis() > expiry);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironment#matches(org.sakaiproject.kernel.api.authz.SubjectStatement)
   */
  public boolean matches(ReferencedObject referencedObject,
      SubjectStatement subject) {
    switch (subject.getSubjectType()) {
    case PR:
      if (debug) {
        LOG.debug("Testing " + subject + " for " + uuid + " at "
            + referencedObject);
      }
      // provided
      List<SubjectTokenProvider<String>> providers = registry.getList();
      for (SubjectTokenProvider<String> provider : providers) {
        if (provider.matches(this, subject)) {
          return true;
        }
      }
      return false;
    case GR:
      if (debug) {
        LOG.debug("Testing " + subject + " for " + uuid + " at "
            + referencedObject);
      }
      // group/role
      String subjectToken = subject.getSubjectToken();
      loadSubjects();
      if (subjects != null && subjectsBean.hasSubject(subjectToken)) {
        subjectsBean.setSubjectPermissionService(subjectPermissionService);
        SubjectPermissions subjectPermissions = subjectsBean
            .getSubjectPermissions(subjectToken);
        return subjectPermissions.hasPermission(subject.getPermissionToken());
      }
      return false;
    case US:
      if (debug) {
        LOG.debug("Testing " + subject + " for " + uuid + " at "
            + referencedObject);
      }
      // Expliciy user
      return uuid.equals(subject.getSubjectToken());
    case AU:
      if (debug) {
        LOG.debug("Testing " + subject + " for " + uuid + " at "
            + referencedObject);
      }
      // Authenticated
      return (uuid != null && uuid.trim().length() > 0);
    case AN:
      if (debug) {
        LOG.debug("Testing " + subject + " for " + uuid + " at "
            + referencedObject);
      }
      // Anon
      return true;
    case OW:
      // for owner to work, ver node must have an owner, it cannot be inherited.
      // hence we must put this inside jcrNodeFactory, so that when a node is created the owner property is set.
      // there is an issue for webdav that means the owner does not come through.
      //
      if (debug) {
        LOG.debug("Testing " + subject + " for " + uuid + " at "
            + referencedObject + " owner " + referencedObject.getOwner());
      }
      return uuid.equals(referencedObject.getOwner());
    case SU:
      if (debug) {
        LOG.debug("Testing " + subject + " for " + uuid + " at "
            + referencedObject + " superUser " + isSuperUser());
      }
      return isSuperUser();
    case UN:
      if (debug) {
        LOG.debug("Testing " + subject + " for " + uuid + " at "
            + referencedObject);
      }
      // undefined
      return false;
    }
    return false;
  }

  /**
   *
   */
  private void loadSubjects() {
    if (subjectsBean == null) {
      subjectsBean = new SubjectsBean(subjectPermissionService);
      for (String subject : subjects) {
        subjectsBean.put(subject, subject);
      }
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironment#isSuperUser()
   */
  public boolean isSuperUser() {
    return superUser;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironment#getSubjects()
   */
  public String[] getSubjects() {
    return ArrayUtils.copy(subjects, new String[subjects.length]);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironment#getUserid()
   */
  public User getUser() {
    if (protect) {
      return null;
    }
    if (user == null) {
      user = new UserBean(uuid, eid);
    }
    return user;

  }

  /**
   * @return
   */
  public UserBean getUserBean() {
    if (protect) {
      return null;
    } else {
      return (UserBean) getUser();
    }
  }

  /**
   * @param superUser
   *          the superUser to set
   */
  public void setSuperUser(boolean superUser) {
    if (sealed) {
      throw new RuntimeException(
          "Attempt to unseal a sealed UserEnvironmentBean ");
    }
    this.superUser = superUser;
  }

  /**
   * @param eid
   *          the eid to set
   */
  public void setEid(String eid) {
    if (sealed) {
      throw new RuntimeException(
          "Attempt to unseal a sealed UserEnvironmentBean ");
    }
    this.eid = eid;
  }

  /**
   * @param uuid
   *          the uuid to set
   */
  public void setUuid(String uuid) {
    if (sealed) {
      throw new RuntimeException(
          "Attempt to unseal a sealed UserEnvironmentBean ");
    }
    this.uuid = uuid;
  }

  /**
   * @return the eid
   */
  public String getEid() {
    if (protect) {
      return null;
    } else {
      return eid;
    }
  }

  /**
   * @return the uuid
   */
  public String getUuid() {
    return uuid;
  }

  /**
   * @param subjects
   *          the subjects to set
   */
  public void setSubjects(String[] subjects) {
    if (sealed) {
      throw new RuntimeException(
          "Attempt to unseal a sealed UserEnvironmentBean ");
    }
    subjectsBean = null;
    this.subjects = ArrayUtils.copy(subjects, new String[subjects.length]);
  }

  /**
   * @param sealed
   *          the sealed to set
   */
  public void seal() {
    this.sealed = true;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironment#getUserSubjects()
   */
  public UserSubjects getUserSubjects() {
    loadSubjects();
    return subjectsBean;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironment#getLocale()
   */
  public String getLocale() {
    return locale;
  }

  /**
   * @param locale
   *          the locale to set
   */
  public void setLocale(String locale) {
    if (sealed) {
      throw new RuntimeException(
          "Attempt to unseal a sealed UserEnvironmentBean ");
    }
    this.locale = locale;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironment#getUserInfo()
   */
  public UserInfo getUserInfo() {
    return new UserInfo() {

      public String getProperty(String name) {
        return properties.get(name);
      }

      public User getUser() {
        return user;
      }

      public void setProperty(String name, String value) {
        // TODO Auto-generated method stub
      }

    };
  }

  /**
   * @param properties
   *          the properties to set
   */
  public void setProperties(Map<String, String> properties) {
    if (sealed) {
      throw new RuntimeException(
          "Attempt to unseal a sealed UserEnvironmentBean ");
    }
    this.properties = properties;
  }

  /**
   * @return the properties
   */
  public Map<String, String> getProperties() {
    return new HashMap<String, String>(properties);
  }

  /**
   * @param userEnv
   */
  public void copyFrom(UserEnvironment userEnv) {
    
    uuid = ((UserEnvironmentBean) userEnv).getUuid();
    eid = ((UserEnvironmentBean) userEnv).getEid();
    user = userEnv.getUser();
    superUser = userEnv.isSuperUser();
    subjects = userEnv.getSubjects();
    locale = userEnv.getLocale();
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironment#setProtected(boolean)
   */
  public void setProtected(boolean protect) {
    this.protect = protect;
  }

}
