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
package org.sakaiproject.kernel.jcr.jackrabbit;

import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.jackrabbit.core.observation.EventImpl;
import org.sakaiproject.kernel.api.RequiresStop;
import org.sakaiproject.kernel.api.jcr.EventRegistration;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.locking.Lock;
import org.sakaiproject.kernel.api.locking.LockManager;
import org.sakaiproject.kernel.api.locking.LockTimeoutException;
import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.SakaiJCRCredentials;
import org.sakaiproject.kernel.util.StringUtils;

import java.util.List;

import javax.jcr.LoginException;
import javax.jcr.Node;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.observation.Event;
import javax.jcr.observation.ObservationManager;
import javax.jcr.query.QueryManager;

@Singleton
public class JCRServiceImpl implements JCRService, RequiresStop {
  private static final Log LOG = LogFactory.getLog(JCRServiceImpl.class);

  public static final String DEFAULT_WORKSPACE = "sakai";

  private static final String JCR_REQUEST_CACHE = "jcr.rc";

  private static final String JCR_SESSION_HOLDER = "sh";

  private static final boolean debug = LOG.isDebugEnabled();

  /**
   * The injected 170 repository
   */
  private RepositoryBuilder repositoryBuilder = null;

  // private Credentials repositoryCredentialsX;

  private boolean requestScope = true;

  private CacheManagerService cacheManager;

  private Injector injector;

  /**
   * This is the sakai lock manager that does not hit the databse.
   */
  private LockManager lockManager;

  /**
   * @throws RepositoryException
   *
   */
  @Inject
  public JCRServiceImpl(RepositoryBuilder repositoryBuilder,
      CacheManagerService cacheManager,
      @Named(JCRService.NAME_REQUEST_SCOPE) boolean requestScope,
      List<EventRegistration> registrations, LockManager lockManager, Injector injector)
      throws RepositoryException {
    this.repositoryBuilder = repositoryBuilder;
    this.cacheManager = cacheManager;
    this.requestScope = requestScope;
    this.injector = injector;
    this.lockManager = lockManager;
  }

  /*
   * (non-Javadoc)
   *
   * @see org.sakaiproject.kernel.api.RequiresStop#stop()
   */
  public void stop() {
    repositoryBuilder.stop();
    LOG.info("Repository has been stopped");
  }

  public Session getSession() throws LoginException, RepositoryException {
    return login();
  }

  public void save() throws RepositoryException {
    if (hasActiveSession()) {
      getSession().save();
    }
  }

  public Session login() throws LoginException, RepositoryException {
    Session session = null;
    SessionHolder sh = getSessionHolder();
    if (sh == null) {
      long t1 = System.currentTimeMillis();
      sh = new SessionHolder(repositoryBuilder, null, DEFAULT_WORKSPACE);
      setSesssionHolder(sh);
      if (debug) {
        LOG.debug("Session Start took " + (System.currentTimeMillis() - t1) + "ms");
      }
    }
    session = sh.getSession();
    return session;
  }

  public Session loginSystem() throws LoginException, RepositoryException {
    Session session = null;
    SessionHolder sh = getSessionHolder();
    if (sh == null) {
      long t1 = System.currentTimeMillis();

      sh = new SessionHolder(repositoryBuilder, new SakaiJCRCredentials(),
          DEFAULT_WORKSPACE);
      setSesssionHolder(sh);
      if (debug) {
        LOG.debug("Session Start took " + (System.currentTimeMillis() - t1) + "ms");
      }
    }
    session = sh.getSession();
    return session;
  }

  /**
   * @return
   */
  private Cache<SessionHolder> getRequestCache() {
    if (requestScope) {
      return cacheManager.getCache(JCR_REQUEST_CACHE, CacheScope.REQUEST);
    } else {
      return cacheManager.getCache(JCR_REQUEST_CACHE, CacheScope.THREAD);
    }

  }

  /*
   * (non-Javadoc)
   *
   * @see org.sakaiproject.kernel.api.jcr.JCRService#logout()
   */
  public void logout() throws LoginException, RepositoryException {
    clearSessionHolder();
  }

  /**
   * @param jcrSessionHolder
   * @return
   */
  private SessionHolder getSessionHolder() {
    return (SessionHolder) getRequestCache().get(JCR_SESSION_HOLDER);
  }

  /**
   * @param sh
   */
  private void setSesssionHolder(SessionHolder sh) {
    getRequestCache().put(JCR_SESSION_HOLDER, sh);
  }

  /**
   *
   */
  private void clearSessionHolder() {
    Cache<SessionHolder> cache = getRequestCache();
    SessionHolder sh = cache.get(JCR_SESSION_HOLDER);
    if (sh != null) {
      lockManager.clearLocks();
      cache.remove(JCR_SESSION_HOLDER);
    }
  }

  public void clearLocks() {
    Cache<SessionHolder> cache = getRequestCache();
    SessionHolder sh = cache.get(JCR_SESSION_HOLDER);
    if (sh != null) {
      lockManager.clearLocks();
    }
  }

  /*
   * (non-Javadoc)
   *
   * @see org.sakaiproject.kernel.api.jcr.JCRService#getRepository()
   */
  public Repository getRepository() {
    return repositoryBuilder.getInstance();
  }

  /*
   * (non-Javadoc)
   *
   * @see org.sakaiproject.kernel.api.jcr.JCRService#setCurrentSession(javax.jcr. Session)
   */
  public Session setSession(Session session) {
    Session currentSession = null;
    SessionHolder sh = getSessionHolder();
    if (sh != null) {
      currentSession = sh.getSession();
      sh.keepLoggedIn();
    }
    if (debug) {
      LOG.debug("Replacing " + currentSession + " with " + session);
    }
    if (session == null) {
      clearSessionHolder();
    } else {
      sh = new SessionHolder(session);
      setSesssionHolder(sh);
    }
    return currentSession;
  }

  public boolean needsMixin(Node node, String mixin) throws RepositoryException {
    return true;
    // ! node.getSession().getWorkspace().getNodeTypeManager().getNodeType(node.
    // getPrimaryNodeType().getName()).isNodeType(mixin);
  }

  public boolean hasActiveSession() {
    Session session = null;
    SessionHolder sh = getSessionHolder();
    if (sh != null) {
      session = sh.getSession();
    }
    return (session != null);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.JCRService#getDefaultWorkspace()
   */
  public String getDefaultWorkspace() {
    return "";
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.JCRService#getObservationManager()
   */
  public ObservationManager getObservationManager() {
    SakaiJCRCredentials ssp = new SakaiJCRCredentials();
    Session s = null;
    ObservationManager observationManager = null;
    try {
      s = getRepository().login(ssp);
      observationManager = s.getWorkspace().getObservationManager();
    } catch (RepositoryException e) {
      LOG.error("Failed to get ObservationManager from workspace");
      e.printStackTrace();
    } finally {
      try {
        s.logout();
      } catch (Exception ex) {
      }
      ;
    }
    return observationManager;
  }

  /**
   * @return the injector
   */
  public Injector getInjector() {
    return injector;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.JCRService#isExternalEvent(javax.jcr.observation.Event)
   */
  public boolean isExternalEvent(Event event) {
    EventImpl eventImpl = (EventImpl) event;
    return eventImpl.isExternal();
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.JCRService#getQueryManager()
   */
  public QueryManager getQueryManager() throws RepositoryException {
    QueryManager queryManager = getSession().getWorkspace().getQueryManager();
    return queryManager;
  }

  /**
   * {@inheritDoc}
   *
   * @throws RepositoryException
   * @throws LockTimeoutException
   * @see org.sakaiproject.kernel.api.jcr.JCRService#lock(javax.jcr.Node)
   */
  public Lock lock(Node node) throws RepositoryException, LockTimeoutException {
    Node lockable = node;
    while (lockable.isNew()) {
      lockable = lockable.getParent();
    }
    String lockId = null;
    try {
      lockId = StringUtils.sha1Hash(lockable.getPath());
    } catch (Exception e) {
      throw new RepositoryException("Failed to locate SHA1 Hash algoritm ", e);
    }
    Lock lock = lockManager.waitForLock(lockId);
    return lock;
  }
}
