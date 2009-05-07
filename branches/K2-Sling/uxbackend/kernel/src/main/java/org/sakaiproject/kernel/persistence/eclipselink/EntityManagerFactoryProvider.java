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
package org.sakaiproject.kernel.persistence.eclipselink;

import static org.eclipse.persistence.config.PersistenceUnitProperties.LOGGING_LEVEL;
import static org.eclipse.persistence.config.PersistenceUnitProperties.LOGGING_SESSION;
import static org.eclipse.persistence.config.PersistenceUnitProperties.LOGGING_THREAD;
import static org.eclipse.persistence.config.PersistenceUnitProperties.LOGGING_TIMESTAMP;
import static org.eclipse.persistence.config.PersistenceUnitProperties.TARGET_SERVER;
import static org.eclipse.persistence.config.PersistenceUnitProperties.TRANSACTION_TYPE;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.name.Named;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.persistence.config.PersistenceUnitProperties;
import org.eclipse.persistence.config.TargetServer;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.persistence.DataSourceService;
import org.sakaiproject.kernel.component.core.PersistenceUnitClassLoader;

import java.util.HashMap;
import java.util.Map;

import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.spi.PersistenceUnitTransactionType;

/**
 * Guice provider for {@link javax.persistence.EntityManager} as implemented by
 * Eclipselink.
 */
public class EntityManagerFactoryProvider implements Provider<EntityManagerFactory> {
  private static final Log LOG = LogFactory.getLog(EntityManagerFactoryProvider.class);
  private static final boolean debug = LOG.isDebugEnabled();



  private EntityManagerFactory entityManagerFactory;

  /**
   * Construct an EclipseLink entity manager provider.
   *
   * @param minRead
   * @param minWrite
   * @param dataSourceService
   * @param unitName
   */
  @Inject
  @SuppressWarnings(value={"DP_CREATE_CLASSLOADER_INSIDE_DO_PRIVILEGED"}, justification="Expected to only ever be executed from a privalaged environment")
  public EntityManagerFactoryProvider(DataSourceService dataSourceService,
      @Named(KernelConstants.DB_MIN_NUM_READ) String minRead,
      @Named(KernelConstants.DB_MIN_WRITE) String minWrite,
      @Named(KernelConstants.DB_UNITNAME) String unitName,
      @Named(KernelConstants.JDBC_DRIVER_NAME) String driverClassName,
      @Named(KernelConstants.JDBC_URL) String url, @Named(KernelConstants.JDBC_USERNAME) String username,
      @Named(KernelConstants.JDBC_PASSWORD) String password) {

    Map<String, Object> properties = new HashMap<String, Object>();

    // Ensure RESOURCE_LOCAL transactions is used.
    properties.put(TRANSACTION_TYPE,
        PersistenceUnitTransactionType.RESOURCE_LOCAL.name());

    LOG.info("Using provided data source");
    properties.put(dataSourceService.getType(), dataSourceService
        .getDataSource());

    // Configure the internal EclipseLink connection pool
    // LOG.info("Creating internal data source");
    // properties.put(PersistenceUnitProperties.JDBC_DRIVER, driverClassName);
    // properties.put(PersistenceUnitProperties.JDBC_URL, url);
    // properties.put(PersistenceUnitProperties.JDBC_USER, username);
    // properties.put(PersistenceUnitProperties.JDBC_PASSWORD, password);
    // properties
    // .put(PersistenceUnitProperties.JDBC_READ_CONNECTIONS_MIN, minRead);
    // properties.put(PersistenceUnitProperties.JDBC_WRITE_CONNECTIONS_MIN,
    // minWrite);

    // Configure logging. FINE ensures all SQL is shown
    properties.put(LOGGING_LEVEL, (debug?"FINE":"INFO"));
    properties.put(LOGGING_TIMESTAMP, "true");
    properties.put(LOGGING_THREAD, "true");
    properties.put(LOGGING_SESSION, "true");

    // Ensure that no server-platform is configured
    properties.put(TARGET_SERVER, TargetServer.None);

    properties.put(PersistenceUnitProperties.DDL_GENERATION,
        PersistenceUnitProperties.CREATE_ONLY);
    properties.put(PersistenceUnitProperties.DROP_JDBC_DDL_FILE, "drop.sql");
    properties
        .put(PersistenceUnitProperties.CREATE_JDBC_DDL_FILE, "create.sql");
    properties.put(PersistenceUnitProperties.DDL_GENERATION_MODE,
        PersistenceUnitProperties.DDL_BOTH_GENERATION);

    // properties.put(PersistenceUnitProperties.SESSION_CUSTOMIZER,
    // EnableIntegrityChecker.class.getName());

    LOG.info("Starting connection manager with properties " + properties);
    final Thread currentThread = Thread.currentThread();
    final ClassLoader saveClassLoader = currentThread.getContextClassLoader();

    PersistenceUnitClassLoader persistenceCL = new PersistenceUnitClassLoader(this.getClass().getClassLoader());
    currentThread.setContextClassLoader(persistenceCL);
    entityManagerFactory = Persistence.createEntityManagerFactory(
        unitName, properties);
    currentThread.setContextClassLoader(saveClassLoader);


  }

  /**
   * {@inheritDoc}
   *
   * @see com.google.inject.Provider#get()
   */
  public EntityManagerFactory get() {
    return entityManagerFactory;
  }


}
