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
package org.sakaiproject.resteasy;

import java.util.Map;

import javax.servlet.ServletContextEvent;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jboss.resteasy.plugins.server.servlet.ResteasyBootstrap;
import org.jboss.resteasy.spi.Registry;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.api.rest.JaxRsPrototypeProvider;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;

import static org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY;
import static org.sakaiproject.kernel.api.rest.JaxRsPrototypeProvider.JAXRS_PROTOTYPE_REGISTRY;

/**
 * Bootstraps the RestEasy JAX-RS implementation, using resources registered with the
 * sakai kernel's JaxRsResourceProvider.JAXRS_REGISTRY registry.
 */
public class ResteasyK2Bootstrap extends ResteasyBootstrap {
  /**
   *
   */
  private static final Log LOG = LogFactory.getLog(ResteasyBootstrap.class);
  /**
   *
   */
  private JaxRsSingletonRegistryListener singletonListener;
  /**
   *
   */
  private JaxRsPrototypeRegistryListener prototypeListener;
  /**
   * The default documentation bean
   */
  private RootRestEasyDocumentation defaultDocumentation;

  /**
   * {@inheritDoc}
   *
   * @see org.jboss.resteasy.plugins.server.servlet.ResteasyBootstrap#contextInitialized(javax.servlet.ServletContextEvent)
   */
  public void contextInitialized(ServletContextEvent event) {
    super.contextInitialized(event);
    Registry restEasyRegistry = (Registry) event.getServletContext().getAttribute(
        Registry.class.getName());

    defaultDocumentation = (RootRestEasyDocumentation) event.getServletContext().getAttribute(
        Documentable.class.getName());
    if (defaultDocumentation == null) {
      defaultDocumentation = new RootRestEasyDocumentation();
      event.getServletContext().setAttribute(Documentable.class.getName(),
          defaultDocumentation);
    }

    // Add listeners to keep the kernel registries aligned with the resteasy
    // registry
    singletonListener = new JaxRsSingletonRegistryListener(restEasyRegistry,defaultDocumentation);
    prototypeListener = new JaxRsPrototypeRegistryListener(restEasyRegistry,defaultDocumentation);

    // Add all of the resources in our JAX-RS providers to the resteasy registry
    KernelManager km = new KernelManager();
    RegistryService registryService = km.getService(RegistryService.class);
    org.sakaiproject.kernel.api.Registry<String, JaxRsSingletonProvider> jaxRsSingletonRegistry = registryService
        .getRegistry(JAXRS_SINGLETON_REGISTRY);
    org.sakaiproject.kernel.api.Registry<String, JaxRsPrototypeProvider> jaxRsPrototypeRegistry = registryService
        .getRegistry(JAXRS_PROTOTYPE_REGISTRY);

    // Sync the JAX-RS implementation's registry with the kernel's registry
    syncRestEasyRegistry(restEasyRegistry, jaxRsSingletonRegistry, jaxRsPrototypeRegistry);

    // Listen for changes to the kernel registry
    jaxRsSingletonRegistry.addListener(singletonListener);
    jaxRsPrototypeRegistry.addListener(prototypeListener);

    LOG.info("Added JAX-RS registry listener for updates to " + jaxRsSingletonRegistry);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.jboss.resteasy.plugins.server.servlet.ResteasyBootstrap#contextDestroyed(javax.servlet.ServletContextEvent)
   */
  public void contextDestroyed(ServletContextEvent event) {
  }

  /**
   * @param restEasyRegistry
   *          the registry to sync to.
   * @param jaxRsSingletonRegistry
   *          the JAXRS Singleton Registry.
   * @param jaxRsPrototypeRegistry
   *          the JAXRS Prototype Registry.
   */
  protected void syncRestEasyRegistry(
      Registry restEasyRegistry,
      org.sakaiproject.kernel.api.Registry<String, JaxRsSingletonProvider> jaxRsSingletonRegistry,
      org.sakaiproject.kernel.api.Registry<String, JaxRsPrototypeProvider> jaxRsPrototypeRegistry) {
    LOG.info("Updating " + restEasyRegistry);
    Map<String, JaxRsSingletonProvider> singletonProvidersMap = jaxRsSingletonRegistry
        .getMap();
    for (JaxRsSingletonProvider provider : singletonProvidersMap.values()) {
      
      try {
        restEasyRegistry.removeRegistrations(provider.getJaxRsSingleton().getClass());
        defaultDocumentation.removeRegistration(provider.getJaxRsSingleton().getClass());
      } catch (Exception e) {
        LOG.warn(e);
      }
      LOG.info("Added JAX-RS singleton: " + provider.getJaxRsSingleton());
      restEasyRegistry.addSingletonResource(provider.getJaxRsSingleton());
      defaultDocumentation.addRegistration(provider.getJaxRsSingleton());
    }
    Map<String, JaxRsPrototypeProvider> prototypeProvidersMap = jaxRsPrototypeRegistry
        .getMap();
    for (JaxRsPrototypeProvider provider : prototypeProvidersMap.values()) {
      try {
        defaultDocumentation.removeRegistration(provider.getJaxRsPrototype().getClass());
        restEasyRegistry.removeRegistrations(provider.getJaxRsPrototype());
      } catch (Exception e) {
        LOG.warn(e);
      }
      LOG.info("Added JAX-RS prototype: " + provider.getJaxRsPrototype());
      restEasyRegistry.addPerRequestResource(provider.getJaxRsPrototype());
      defaultDocumentation.addRegistration(provider.getJaxRsPrototype());
    }
  }
}
