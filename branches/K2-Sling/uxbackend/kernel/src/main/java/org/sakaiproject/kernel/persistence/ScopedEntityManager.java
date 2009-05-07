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
package org.sakaiproject.kernel.persistence;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import com.google.inject.util.ReferenceMap;
import com.google.inject.util.ReferenceType;

import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.RequiresStop;
import org.sakaiproject.kernel.api.ShutdownService;
import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;

import java.util.Map.Entry;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import javax.persistence.FlushModeType;
import javax.persistence.LockModeType;
import javax.persistence.Query;

/**
 *
 */
public class ScopedEntityManager implements EntityManager, RequiresStop {

  private static final String JPA_CACHE = "jpa.cache";
  private static final String ENTITY_MANAGER = "em";
  private EntityManagerFactory entityManagerFactory;
  private CacheManagerService cacheManagerService;
  private ReferenceMap<String, EntityManagerHolder> entityManagerReferenceMap = new ReferenceMap<String, EntityManagerHolder>(
      ReferenceType.STRONG, ReferenceType.WEAK);
  private CacheScope scope;
  private long nextReport = 0;

  @Inject
  public ScopedEntityManager(EntityManagerFactory entityManagerFactory,
      CacheManagerService cacheManagerService,
      @Named(KernelConstants.ENTITY_MANAGER_SCOPE) String entityManagerScope,
      ShutdownService shutdownService) {
    this.entityManagerFactory = entityManagerFactory;
    this.cacheManagerService = cacheManagerService;
    this.scope = CacheScope.valueOf(entityManagerScope);
    shutdownService.register(this);
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.RequiresStop#stop()
   */
  public void stop() {
    for (EntityManagerHolder emh : entityManagerReferenceMap.values()) {
      try {
        emh.unbind();
      } catch (Exception ex) {
      }
    }
    try {
      if (entityManagerFactory.isOpen()) {
        entityManagerFactory.close();
      }
    } catch (Exception ex) {
      // not logging a shutdown failure
    }
  }

  /**
   * @return
   */
  private EntityManager getEntityManager() {
    Cache<EntityManagerHolder> cache = cacheManagerService.getCache(JPA_CACHE, scope);
    EntityManagerHolder entityManagerHolder = cache.get(ENTITY_MANAGER);
    if (entityManagerHolder == null) {
      entityManagerHolder = new EntityManagerHolder(entityManagerFactory
          .createEntityManager());
      cache.put(ENTITY_MANAGER, entityManagerHolder);
      entityManagerReferenceMap.put(String.valueOf(entityManagerHolder),
          entityManagerHolder);
    }
    if (nextReport < System.currentTimeMillis()) {
      nextReport = System.currentTimeMillis() + 10000L;
      StringBuilder sb = new StringBuilder();
      sb.append("Entity Manager List ").append(entityManagerReferenceMap.size()).append(
          "\n");
      for (Entry<String, EntityManagerHolder> ehes : entityManagerReferenceMap.entrySet()) {
        EntityManagerHolder eh = ehes.getValue();
        sb.append("\t").append(eh.getEntityManager()).append(" on ").append(
            eh.getSourceThread()).append("\n");
      }
      System.err.println(sb.toString());
    }
    return entityManagerHolder.getEntityManager();
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#clear()
   */
  public void clear() {
    getEntityManager().clear();

  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#close()
   */
  public void close() {
    getEntityManager().close();
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#contains(java.lang.Object)
   */
  public boolean contains(Object entity) {
    return getEntityManager().contains(entity);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#createNamedQuery(java.lang.String)
   */
  public Query createNamedQuery(String name) {
    return getEntityManager().createNamedQuery(name);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#createNativeQuery(java.lang.String)
   */
  public Query createNativeQuery(String sqlString) {
    return getEntityManager().createNativeQuery(sqlString);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#createNativeQuery(java.lang.String,
   *      java.lang.Class)
   */
  @SuppressWarnings("unchecked")
  public Query createNativeQuery(String sqlString, Class resultClass) {
    return getEntityManager().createNativeQuery(sqlString, resultClass);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#createNativeQuery(java.lang.String,
   *      java.lang.String)
   */
  public Query createNativeQuery(String sqlString, String resultSetMapping) {
    return getEntityManager().createNativeQuery(sqlString, resultSetMapping);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#createQuery(java.lang.String)
   */
  public Query createQuery(String qlString) {
    return getEntityManager().createQuery(qlString);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#find(java.lang.Class, java.lang.Object)
   */
  public <T> T find(Class<T> entityClass, Object primaryKey) {
    return getEntityManager().find(entityClass, primaryKey);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#flush()
   */
  public void flush() {
    getEntityManager().flush();
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#getDelegate()
   */
  public Object getDelegate() {
    return getEntityManager().getDelegate();
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#getFlushMode()
   */
  public FlushModeType getFlushMode() {
    return getEntityManager().getFlushMode();
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#getReference(java.lang.Class, java.lang.Object)
   */
  public <T> T getReference(Class<T> entityClass, Object primaryKey) {
    return getEntityManager().getReference(entityClass, primaryKey);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#getTransaction()
   */
  public EntityTransaction getTransaction() {
    return getEntityManager().getTransaction();
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#isOpen()
   */
  public boolean isOpen() {
    return getEntityManager().isOpen();
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#joinTransaction()
   */
  public void joinTransaction() {
    getEntityManager().joinTransaction();
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#lock(java.lang.Object,
   *      javax.persistence.LockModeType)
   */
  public void lock(Object entity, LockModeType lockMode) {
    getEntityManager().lock(entity, lockMode);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#merge(java.lang.Object)
   */
  public <T> T merge(T entity) {
    return getEntityManager().merge(entity);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#persist(java.lang.Object)
   */
  public void persist(Object entity) {
    getEntityManager().persist(entity);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#refresh(java.lang.Object)
   */
  public void refresh(Object entity) {
    getEntityManager().refresh(entity);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#remove(java.lang.Object)
   */
  public void remove(Object entity) {
    getEntityManager().remove(entity);
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.persistence.EntityManager#setFlushMode(javax.persistence.FlushModeType)
   */
  public void setFlushMode(FlushModeType flushMode) {
    getEntityManager().setFlushMode(flushMode);
  }

}
