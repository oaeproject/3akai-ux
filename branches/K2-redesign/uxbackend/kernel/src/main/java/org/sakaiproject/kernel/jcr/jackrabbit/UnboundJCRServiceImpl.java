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
import com.google.inject.name.Named;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.jackrabbit.core.observation.EventImpl;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.locking.Lock;
import org.sakaiproject.kernel.api.locking.LockManager;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.SakaiJCRCredentials;

import javax.jcr.Credentials;
import javax.jcr.LoginException;
import javax.jcr.Node;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.observation.Event;
import javax.jcr.observation.ObservationManager;
import javax.jcr.query.QueryManager;

/* This is mostly the same as the JCRServiceImpl, except you are never bound to a
 * particular thread.  You will need to keep track of your session, and use the logout
 * methods available on JSR-170.
 */
public class UnboundJCRServiceImpl implements JCRService {

  private static final Log LOG = LogFactory.getLog(UnboundJCRServiceImpl.class);

  public static final String DEFAULT_WORKSPACE = "sakai";

  /**
   * The injected 170 repository
   */
  private RepositoryBuilder repositoryBuilder = null;

  private Credentials repositoryCredentials;
  /**
   * This is the sakai lock manager that does not hit the databse.
   */
  private LockManager lockManager;

  @Inject
  public UnboundJCRServiceImpl(RepositoryBuilder repositoryBuilder,
      @Named(JCRService.NAME_CREDENTIALS) Credentials repositoryCredentials,
      @Named(JCRService.NAME_REQUEST_SCOPE) boolean requestScope, LockManager lockManager) {
    this.lockManager = lockManager;
    boolean error = false;
    try {
      if (repositoryBuilder == null) {
        LOG.error("Repository has not been set ");
        error = true;
      }
      if (repositoryCredentials == null) {
        LOG.error("Credentials has not been set ");
        error = true;
      }
    } catch (Throwable t) {
      LOG.error("Failed init(): ", t);
      error = true;
    } finally {
      if (error) {
        throw new RuntimeException(
            "Fatal error initialising JCRService... (see previous logged ERROR for details)");
        // System.exit is not a good idea to use, it causes everything
        // to die instead of shutting down -AZ
        // System.exit(-1);
      }
    }
    LOG.info("JCR Service initialised...");
  }

  /**
   * Returns to uninitialized state.
   */
  public void destroy() {
    // repositoryBuilder.destroy();
    LOG.info("destroy()");
  }

  public Session getSession() throws LoginException, RepositoryException {
    return login();
  }

  public Session login() throws LoginException, RepositoryException {
    Repository repository = repositoryBuilder.getInstance();
    return repository.login();
  }

  public void save() throws RepositoryException {
    if ( hasActiveSession() ) {
      getSession().save();
    }
  }


  public Session loginSystem() throws LoginException, RepositoryException {
    Repository repository = repositoryBuilder.getInstance();
    return repository.login(repositoryCredentials);
  }

  /*
   * See JSR-170 for how to use session.logout()
   */
  public void logout() throws LoginException, RepositoryException {
  }

  public Repository getRepository() {
    return repositoryBuilder.getInstance();
  }

  public Session setSession(Session session) {
    return session;
  }

  public boolean needsMixin(Node node, String mixin) throws RepositoryException {
    return true;
  }

  public boolean hasActiveSession() {
    return false;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.jcr.JCRService#getDefaultWorkspace()
   */
  public String getDefaultWorkspace() {
    return DEFAULT_WORKSPACE;
  }

  /**
   * {@inheritDoc}
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
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.jcr.JCRService#isExternalEvent(javax.jcr.observation.Event)
   */
  public boolean isExternalEvent(Event event) {
    EventImpl eventImpl = (EventImpl) event;
    return eventImpl.isExternal();
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.jcr.JCRService#getObservationManager()
   */
  public QueryManager getQueryManager() {
    SakaiJCRCredentials ssp = new SakaiJCRCredentials();
    Session s = null;
    QueryManager queryManager = null;
    try {
      s = getRepository().login(ssp);
      queryManager = s.getWorkspace().getQueryManager();
    } catch (RepositoryException e) {
      LOG.error("Failed to get QueryManager from workspace");
      e.printStackTrace();
    } finally {
      try {
        s.logout();
      } catch (Exception ex) {
      }
      ;
    }
    return queryManager;
  }

  /**
   * {@inheritDoc}
   * @throws RepositoryException
   * @see org.sakaiproject.kernel.api.jcr.JCRService#lock(javax.jcr.Node)
   */
  public Lock lock(Node node) throws RepositoryException {
    Node lockable = node;
    while ( lockable.isNew() ) {
      lockable = lockable.getParent();
    }
    return lockManager.getLock(lockable.getUUID());
  }


  public void clearLocks() {
    lockManager.clearLocks();
  }

}
