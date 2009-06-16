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

import com.google.inject.AbstractModule;
import com.google.inject.Scopes;
import com.google.inject.name.Names;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.persistence.DataSourceService;
import org.sakaiproject.kernel.component.core.SharedClassLoader;
import org.sakaiproject.kernel.component.core.SharedClassLoaderContainer;
import org.sakaiproject.kernel.persistence.dbcp.DataSourceServiceImpl;
import org.sakaiproject.kernel.persistence.eclipselink.EntityManagerFactoryProvider;
import org.sakaiproject.kernel.persistence.geronimo.TransactionManagerProvider;

import java.util.Properties;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import javax.transaction.TransactionManager;

/**
 * Configuration module for persistence bindings.
 */
public class PersistenceModule extends AbstractModule {
  private static final Log LOG = LogFactory.getLog(PersistenceModule.class);

  private final Kernel kernel;
  private Properties properties;

  public PersistenceModule(Kernel kernel) {
    this.kernel = kernel;
  }

  /**
   * {@inheritDoc}
   *
   * @see com.google.inject.AbstractModule#configure()
   */
  @Override
  protected void configure() {
    if (properties != null) {
      LOG.info("Loading supplied properties");
      Names.bindProperties(this.binder(), properties);
    }

    SharedClassLoaderContainer container = kernel
        .getService(SharedClassLoaderContainer.class);

    bind(SharedClassLoader.class).toInstance(
        (SharedClassLoader) container.getManagedObject());
    // bind the EntityManagerFactory to EclipseLink
    bind(EntityManagerFactory.class).toProvider(
        EntityManagerFactoryProvider.class).in(Scopes.SINGLETON);
    // bind the EntityManager to a ScopedEntityManger
    bind(EntityManager.class).to(ScopedEntityManager.class)
        .in(Scopes.SINGLETON);
    // Bind in the datasource
    bind(DataSource.class).toProvider(DataSourceServiceImpl.class).in(
        Scopes.SINGLETON);
    // and the transaction manager via a probider.
    bind(TransactionManager.class).toProvider(TransactionManagerProvider.class)
        .in(Scopes.SINGLETON);

    // bind the services
    bind(DataSourceService.class).to(DataSourceServiceImpl.class).in(
        Scopes.SINGLETON);
  }
}
