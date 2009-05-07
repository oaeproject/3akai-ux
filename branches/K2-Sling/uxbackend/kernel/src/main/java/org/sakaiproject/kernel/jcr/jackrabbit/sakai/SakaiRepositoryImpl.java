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
package org.sakaiproject.kernel.jcr.jackrabbit.sakai;

import com.google.inject.Injector;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.jackrabbit.core.NamespaceRegistryImpl;
import org.apache.jackrabbit.core.RepositoryImpl;
import org.apache.jackrabbit.core.SessionImpl;
import org.apache.jackrabbit.core.config.RepositoryConfig;
import org.apache.jackrabbit.core.config.WorkspaceConfig;
import org.apache.jackrabbit.core.fs.FileSystem;
import org.apache.jackrabbit.core.security.AuthContext;
import org.apache.jackrabbit.core.state.CacheManager;
import org.sakaiproject.kernel.api.locking.LockManager;

import java.util.HashMap;
import java.util.Map;

import javax.jcr.AccessDeniedException;
import javax.jcr.LoginException;
import javax.jcr.NoSuchWorkspaceException;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.transaction.TransactionManager;

/**
 * Extends the standard repository impl to allow the Guice injector to be passed through.
 */
public class SakaiRepositoryImpl extends RepositoryImpl {

  private static final Log LOG = LogFactory.getLog(SakaiRepositoryImpl.class);
  private Injector injector;
  private TransactionManager transactionManager;
  private ThreadLocal<Map<String, Session>> systemThreadSession = new ThreadLocal<Map<String, Session>>() {
    @Override
    protected java.util.Map<String, Session> initialValue() {
      return new HashMap<String, Session>();
    };
  };
  private LockManager lockManager;

  /**
   * @param repConfig
   * @param transactionManager
   * @throws RepositoryException
   */
  public SakaiRepositoryImpl(RepositoryConfig repConfig, Injector injector,
      TransactionManager transactionManager, LockManager lockManager) throws RepositoryException {
    super(repConfig);
    this.injector = injector;
    this.transactionManager = transactionManager;
    this.lockManager = lockManager;
    long maxMemory = Runtime.getRuntime().maxMemory() / (1024 * 1024);
    setCacheSize(maxMemory);

  }

  public void setCacheSize(long memoryMB) {
    long maxMem = Math.max(16, ((memoryMB * 16) / 128));
    long maxMemCache = Math.max(4, ((memoryMB * 4) / 128));
    long minMemCache = Math.max(128, ((memoryMB * 128) / 128));
    LOG.info("Set Cache sizes: Heap=" + memoryMB + "MB, Max="
        + maxMem + "MB, Max/Cache=" + maxMemCache
        + "MB, Min/Cache=" + minMemCache + "KB");
    CacheManager manager = getCacheManager();
    manager.setMaxMemory(maxMem * 1024 * 1024); // default is 16 * 1024 * 1024
    manager.setMaxMemoryPerCache(maxMemCache * 1024 * 1024); // default is 4 * 1024 * 1024
    manager.setMinMemoryPerCache(minMemCache * 1024); // default is 128 * 1024
  }

  /**
   * {@inheritDoc}
   *
   * @see org.apache.jackrabbit.core.RepositoryImpl#createSessionInstance(org.apache.jackrabbit.core.security.AuthContext,
   *      org.apache.jackrabbit.core.config.WorkspaceConfig)
   */
  @Override
  protected SessionImpl createSessionInstance(AuthContext loginContext,
      WorkspaceConfig wspConfig) throws AccessDeniedException, RepositoryException {
    return new SakaiXASessionImpl(this, injector, loginContext, wspConfig,
        transactionManager, lockManager);
  }

  /**
   * @param workspaceName
   * @return
   * @throws LoginException
   * @throws NoSuchWorkspaceException
   * @throws RepositoryException
   */
  Session createReadOnlySystemSession(String workspaceName) throws LoginException,
      NoSuchWorkspaceException, RepositoryException {
    Map<String, Session> sessionMap = systemThreadSession.get();
    // since this is a thread local map no sync is requried.
    Session session = sessionMap.get(workspaceName);
    if (session == null) {
      session = login(new SakaiJCRCredentials(), workspaceName);
      sessionMap.put(workspaceName, session);
    }
    return session;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.apache.jackrabbit.core.RepositoryImpl#getFileSystem()
   */
  @Override
  protected FileSystem getFileSystem() {
    return super.getFileSystem();
  }

  /**
   * {@inheritDoc}
   *
   * @see org.apache.jackrabbit.core.RepositoryImpl#getNamespaceRegistry()
   */
  @Override
  protected NamespaceRegistryImpl getNamespaceRegistry() {
    return super.getNamespaceRegistry();
  }

}
