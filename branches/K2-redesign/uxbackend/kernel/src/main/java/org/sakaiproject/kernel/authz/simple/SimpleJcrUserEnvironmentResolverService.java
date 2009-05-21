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
import com.google.inject.name.Named;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.UpdateFailedException;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.SubjectPermissionService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserProvisionAgent;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.model.UserEnvironmentBean;
import org.sakaiproject.kernel.user.jcr.JcrAuthenticationResolverProvider;
import org.sakaiproject.kernel.util.IOUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.jcr.Node;
import javax.jcr.RepositoryException;

/**
 *
 */
public class SimpleJcrUserEnvironmentResolverService implements
    UserEnvironmentResolverService {

  protected String LOCALE_SESSION_KEY = "sakai.locale.";

  private static final Log LOG = LogFactory
      .getLog(SimpleJcrUserEnvironmentResolverService.class);

  private static final boolean debug = LOG.isDebugEnabled();
  private JCRNodeFactoryService jcrNodeFactoryService;
  private BeanConverter beanConverter;
  private UserEnvironment nullUserEnv;
  private Cache<UserEnvironment> cache;
  private UserFactoryService userFactoryService;

  private AuthzResolverService authzResolverService;

  private SubjectPermissionService subjectPermissionService;

  private RegistryService registryService;

  /**
 *
 */
  @Inject
  public SimpleJcrUserEnvironmentResolverService(
      JCRNodeFactoryService jcrNodeFactoryService,
      CacheManagerService cacheManagerService, BeanConverter beanConverter,
      @Named(KernelConstants.NULLUSERENV) UserEnvironment nullUserEnv,
      UserFactoryService userFactoryService, AuthzResolverService authzResolverService,
      SubjectPermissionService subjectPermissionService, RegistryService registryService) {
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.nullUserEnv = nullUserEnv;
    this.beanConverter = beanConverter;
    this.userFactoryService = userFactoryService;
    this.authzResolverService = authzResolverService;
    this.subjectPermissionService = subjectPermissionService;
    this.registryService = registryService;
    cache = cacheManagerService.getCache("userenv", CacheScope.CLUSTERINVALIDATED);
    cache.put("test", null);
    cache.remove("test");
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService#resolve(org.sakaiproject.kernel.api.user.User)
   */
  public UserEnvironment resolve(String userId) {
    if (userId != null) {
      if (cache.containsKey(userId)) {
        UserEnvironment ue = cache.get(userId);
        if (ue != null && !ue.hasExpired()) {
          if (debug) {
            LOG.debug("Loaded from Cache");
          }
          return ue;
        }
      }
      if (userId != null) {
        String userEnv = userFactoryService.getUserEnvPath(userId);
        UserEnvironment ue = loadUserEnvironmentBean(userEnv);
        if (ue != null) {
          cache.put(userId, ue);
          return ue;
        }
      }
    }
    return nullUserEnv;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService#resolve(org.sakaiproject.kernel.api.session.Session)
   */
  public UserEnvironment resolve(Session currentSession) {
    return resolve(currentSession.getUser());
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService#resolve(org.sakaiproject.kernel.api.user.User)
   */
  public UserEnvironment resolve(User user) {
    if (user == null) {
      return resolve((String) null);
    } else {
      return resolve(user.getUuid());
    }
  }

  public void expire(String userId) {
    cache.remove(userId);
  }

  /**
   * @param userEnv2
   * @return
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   * @throws IOException
   * @throws UnsupportedEncodingException
   */
  private UserEnvironment loadUserEnvironmentBean(String userEnvPath) {
    authzResolverService.setRequestGrant("Loading UserEnvironment");
    InputStream in = null;
    try {
      in = jcrNodeFactoryService.getInputStream(userEnvPath);
      String userEnvBody = IOUtils.readFully(in, "UTF-8");
      LOG.info(" Loaded User Env from JCR for " + userEnvPath);
      // convert to a bean, the
      UserEnvironment ue = beanConverter.convertToObject(userEnvBody,
          UserEnvironment.class);
      // seal the bean to prevent modification.
      ue.seal();
      return ue;
    } catch (UnsupportedEncodingException e) {
      LOG.error(e);
    } catch (IOException e) {
      LOG.warn("Failed to read userenv " + userEnvPath + " cause :" + e.getMessage());
      if (debug) {
        LOG.debug(e);
      }
    } catch (RepositoryException e) {
      LOG.warn("Failed to read userenv for " + userEnvPath + " cause :" + e.getMessage());
      if (debug) {
        LOG.debug(e);
      }
    } catch (JCRNodeFactoryServiceException e) {
      LOG.warn("Failed to read userenv for " + userEnvPath + " cause :" + e.getMessage());
      if (debug) {
        LOG.debug(e);
      }
    } finally {
      try {
        in.close();
      } catch (Exception ex) {
      }
      authzResolverService.clearRequestGrant();
    }
    return null;
  }

  private Map<String, Object> loadUserMap(String userEnvPath) {
    authzResolverService.setRequestGrant("Loading User Map");
    try {
      String userEnvBody = IOUtils.readFully(jcrNodeFactoryService
          .getInputStream(userEnvPath), "UTF-8");
      // convert to a bean, the
      Map<String, Object> ue = beanConverter.convertToObject(userEnvBody, Map.class);
      return ue;
    } catch (UnsupportedEncodingException e) {
      LOG.error(e);
    } catch (IOException e) {
      LOG.warn("Failed to read userenv " + userEnvPath + " cause :" + e.getMessage());
      if (debug) {
        LOG.debug(e);
      }
    } catch (RepositoryException e) {
      LOG.warn("Failed to read userenv for " + userEnvPath + " cause :" + e.getMessage());
      if (debug) {
        LOG.debug(e);
      }
    } catch (JCRNodeFactoryServiceException e) {
      LOG.warn("Failed to read userenv for " + userEnvPath + " cause :" + e.getMessage());
      if (debug) {
        LOG.debug(e);
      }
    } finally {
      authzResolverService.clearRequestGrant();
    }
    return null;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService#getUserEnvironmentBasePath(java.lang.String)
   */
  public String getUserEnvironmentBasePath(String userId) {
    return userFactoryService.getUserEnvironmentBasePath(userId);
  }

  /**
   * * Return user's prefered locale * First: return locale from Sakai user preferences,
   * if available * Second: return locale from user session, if available * Last: return
   * system default locale
   *
   * @param locale * *
   * @return user's Locale object
   */
  public Locale getUserLocale(Locale browserLocale, Session session) {
    Locale loc = null;

    User user = session.getUser();
    UserEnvironment userEnvironment = null;
    if (user != null && user.getUuid() != null) {
      userEnvironment = resolve(user.getUuid());
    }
    String localeKey = (String) session.getAttribute(LOCALE_SESSION_KEY);
    if (userEnvironment != null && localeKey == null) {
      localeKey = userEnvironment.getLocale();
    }
    if (localeKey != null){
      String[] locValues = localeKey.split("_");
      if (locValues != null && locValues.length > 1) {
        loc = new Locale(locValues[0], locValues[1]);
      } else if (locValues != null && locValues.length == 1) {
        loc = new Locale(locValues[0]);
      } else if (browserLocale != null) {
        loc = browserLocale;
      } else {
        loc = Locale.getDefault();
      }
    } else {
	  loc = Locale.getDefault();
    }
    return loc;
  }
  
  /**
   * @param locale * *
   * @return user's timezone
   */
  public String getUserTimezone(Locale browserLocale, Session session) {

    User user = session.getUser();
    UserEnvironment userEnvironment = null;
    if (user != null && user.getUuid() != null) {
      userEnvironment = resolve(user.getUuid());
    }
    String tz = (String) session.getAttribute(LOCALE_SESSION_KEY);
    if (userEnvironment != null && tz == null) {
      tz = userEnvironment.getTimezone();
    }
    if (tz != null){
      return tz;
    } else {
	  tz = "UTC";
    }
    return tz;
  }
  
  /**
   * * Return user's prefered locale * First: return locale from Sakai user preferences,
   * if available * Second: return locale from user session, if available * Last: return
   * system default locale
   *
   * @param locale * *
   * @return user's Locale object
   */
  public void setUserLocale(Locale browserLocale, Session session, String locale) {

    User user = session.getUser();
    UserEnvironment userEnvironment = null;
    if (user != null && user.getUuid() != null) {
    	userEnvironment = resolve(user.getUuid());
    }
    String localeKey = (String) session.getAttribute(LOCALE_SESSION_KEY);
    if (userEnvironment != null && localeKey == null) {
        userEnvironment.setLocale(locale);
    }
  }

  /**
   * {@inheritDoc}
   *
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService#save(org.sakaiproject.kernel.api.userenv.UserEnvironment)
   */
  public void save(UserEnvironment userEnvironment) throws UpdateFailedException {
    authzResolverService.setRequestGrant("Saving User Environment");
    InputStream bais = null;

    try {
      String userEnvironmentPath = userFactoryService.getUserEnvPath(userEnvironment
          .getUser().getUuid());
      Map<String, Object> userMap = loadUserMap(userEnvironmentPath);

      userMap.put("locale", userEnvironment.getLocale());
      userMap.put("timezone", userEnvironment.getTimezone());
      userMap.put("subjects", userEnvironment.getSubjects());

      // save the template
      String userEnvironmentJson = beanConverter.convertToString(userMap);
      System.err.println("New User at " + userEnvironmentPath + " Is "
          + userEnvironmentJson);
      bais = new ByteArrayInputStream(userEnvironmentJson.getBytes("UTF-8"));
      Node userEnvNode = jcrNodeFactoryService.setInputStream(
          userEnvironmentPath, bais, RestProvider.CONTENT_TYPE);

      expire(userEnvironment.getUser().getUuid());

      Node n = userEnvNode;
      while ( n.isNew() ) {
        n = n.getParent();
      }
      n.save();

    } catch (Exception ex) {
      throw new UpdateFailedException(ex.getMessage(), ex);
    } finally {
      try {
        bais.close();
      } catch (Exception ex) {
      }
      authzResolverService.clearRequestGrant();
    }

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService#create(org.sakaiproject.kernel.api.user.User,
   *      java.lang.String)
   */
  public UserEnvironment create(User u, String externalId, String password,
      String userType) {
    String userEnvironmentPath = userFactoryService.getUserEnvPath(u.getUuid());

    ByteArrayInputStream bais = null;
    InputStream templateInputStream = null;
    try {

      String userEnvironmentTemplate = userFactoryService.getUserEnvTemplate(userType);

      // load the template
      templateInputStream = jcrNodeFactoryService.getInputStream(userEnvironmentTemplate);
      String template = IOUtils.readFully(templateInputStream, "UTF-8");
      System.err
          .println("Loading UE from " + userEnvironmentTemplate + " as " + template);
      UserEnvironmentBean userEnvironmentBean = beanConverter.convertToObject(template,
          UserEnvironmentBean.class);

      // make the template this user
      userEnvironmentBean.setEid(externalId);
      userEnvironmentBean.setUuid(u.getUuid());
      Map<String, String> p = new HashMap<String, String>();
      p.put("userType", userType);
      userEnvironmentBean.setProperties(p);

      // save the template
      String userEnv = beanConverter.convertToString(userEnvironmentBean);
      System.err.println("Saving UE to " + userEnvironmentPath + " as " + userEnv);
      bais = new ByteArrayInputStream(userEnv.getBytes("UTF-8"));
      Node userEnvNode = jcrNodeFactoryService.setInputStream(userEnvironmentPath, bais,
          RestProvider.CONTENT_TYPE);

      // set the password
      userEnvNode.setProperty(JcrAuthenticationResolverProvider.JCRPASSWORDHASH,
          org.sakaiproject.kernel.util.StringUtils.sha1Hash(password));

      System.err.println("Voor de functie");
      // make the private and shares spaces for the user owned by this used.
      System.err.println("Get user private path = " + userFactoryService.getUserPrivatePath(u.getUuid()));
      System.err.println("UUID = " + u.getUuid());
      jcrNodeFactoryService.setOwner(userFactoryService.getUserPrivatePath(u.getUuid()),u.getUuid());
      System.err.println("Tussen de functie");
      jcrNodeFactoryService.setOwner(userFactoryService.getUserSharedPrivatePath(u.getUuid()),u.getUuid());
      System.err.println("Na de functie");

      // allow other provisioning agents to perform
      Registry<String, UserProvisionAgent> registry = registryService
          .getRegistry(UserProvisionAgent.REGISTRY);
      for (UserProvisionAgent agent : registry.getList()) {
        agent.provision(userEnvironmentBean);
      }

      userEnvironmentBean.seal();
      return userEnvironmentBean;

    } catch (RepositoryException e) {
      LOG.error(e.getMessage(), e);
    } catch (JCRNodeFactoryServiceException e) {
      LOG.error(e.getMessage(), e);
    } catch (UnsupportedEncodingException e) {
      LOG.error(e.getMessage(), e);
    } catch (NoSuchAlgorithmException e) {
      LOG.error(e.getMessage(), e);
    } catch (IOException e) {
      LOG.error(e.getMessage(), e);
    } finally {
      try {
        bais.close();
      } catch (Exception ex) {
        // not interested
      }
      try {
        templateInputStream.close();
      } catch (Exception ex) {
        // not interested
      }
    }
    return null;

  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService#addMembership(java.lang.String, java.lang.String, java.lang.String)
   */
  public void addMembership(String userId, String siteId, String membershipType) {
    UserEnvironmentBean userEnv = (UserEnvironmentBean) resolve(userId);
    UserEnvironmentBean newUserEnvironment = new UserEnvironmentBean(
        subjectPermissionService, 0, registryService);
    newUserEnvironment.copyFrom(userEnv);

    String newSubject = siteId + ":" + membershipType;
    String[] subjects = newUserEnvironment.getSubjects();
    subjects = org.sakaiproject.kernel.util.StringUtils.addString(subjects,
        newSubject);
    newUserEnvironment.setSubjects(subjects);

    save(newUserEnvironment);
  }
  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService#removeMembership(java.lang.String, java.lang.String, java.lang.String)
   */
  public void removeMembership(String userId, String siteId, String membershipType) {
    UserEnvironmentBean userEnv = (UserEnvironmentBean) resolve(userId);
    UserEnvironmentBean newUserEnvironment = new UserEnvironmentBean(
        subjectPermissionService, 0, registryService);
    newUserEnvironment.copyFrom(userEnv);

    String newSubject = siteId + ":" + membershipType;
    String[] subjects = newUserEnvironment.getSubjects();
    subjects = org.sakaiproject.kernel.util.StringUtils.removeString(subjects,
        newSubject);
    newUserEnvironment.setSubjects(subjects);

    save(newUserEnvironment);
  }



}
