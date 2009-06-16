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

package org.sakaiproject.componentsample;

import com.google.inject.AbstractModule;
import com.google.inject.Scopes;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.componentsample.api.HelloWorldService;
import org.sakaiproject.componentsample.api.InternalDateService;
import org.sakaiproject.componentsample.core.HelloWorldServiceGuicedImpl;
import org.sakaiproject.componentsample.core.InternalDateServiceImpl;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.component.core.guice.ServiceProvider;

import javax.persistence.EntityManager;

/**
 * Configures the sample component module.
 */
public class ComponentModule extends AbstractModule {

  /**
   *
   */
  private static final Log LOG = LogFactory.getLog(ComponentModule.class);
  private static final boolean debug = LOG.isDebugEnabled();
  /**
   *
   */
  private final Kernel kernel;

  /**
   * @param pKernel the kernel to configure the component module with.
   */
  public ComponentModule(Kernel pKernel) {
    this.kernel = pKernel;
  }

  /**
   * {@inheritDoc}
   * @see com.google.inject.AbstractModule#configure()
   */
  @Override
  protected void configure() {
    // First bind external services to this injector
    ServiceManager serviceManager = kernel.getServiceManager();
    bind(JCRService.class).toProvider(
        new ServiceProvider<JCRService>(serviceManager, JCRService.class));
    bind(EntityManager.class)
        .toProvider(
            new ServiceProvider<EntityManager>(serviceManager,
                EntityManager.class));

    // Now bind local services
    bind(InternalDateService.class).to(InternalDateServiceImpl.class).in(
        Scopes.SINGLETON);
    bind(HelloWorldService.class).to(HelloWorldServiceGuicedImpl.class).in(
        Scopes.SINGLETON);
    if (debug) {
      LOG.debug("Bound HelloWorldService");
    }
  }
}
