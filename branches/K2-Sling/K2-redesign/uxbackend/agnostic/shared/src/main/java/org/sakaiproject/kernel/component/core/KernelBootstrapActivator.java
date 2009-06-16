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
package org.sakaiproject.kernel.component.core;

import com.google.inject.Guice;
import com.google.inject.Injector;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.ClassLoaderService;
import org.sakaiproject.kernel.api.ComponentActivator;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.ComponentLoaderService;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.ArtifactResolverService;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelConfigurationException;
import org.sakaiproject.kernel.api.PackageRegistryService;
import org.sakaiproject.kernel.api.RequiresStop;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ServiceManagerException;
import org.sakaiproject.kernel.api.ServiceSpec;
import org.sakaiproject.kernel.api.ShutdownService;

import java.io.IOException;
import java.util.Collection;
import java.util.Properties;

/**
 * The activator for the kernel bootstrap component.
 */
public class KernelBootstrapActivator implements ComponentActivator {

  /**
   * A logger
   */
  private static final Log LOG = LogFactory.getLog(KernelBootstrapActivator.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private static final Class<?>[] KERNEL_SERVICES = {
      KernelInjectorService.class, SharedClassLoaderContainer.class,
      ShutdownService.class, PackageRegistryService.class,
      ArtifactResolverService.class, ClassLoaderService.class,
      ComponentLoaderService.class };
  private static final Class<?>[] EXPORTED_KERNEL_SERVICES = {
      SharedClassLoaderContainer.class, ShutdownService.class,
      PackageRegistryService.class, ArtifactResolverService.class,
      ClassLoaderService.class, ComponentLoaderService.class };
  /**
   * The kernel in which this bootstrap was activated.
   */
  private Kernel kernel;

  /**
   * Activate the bootstrap.
   * 
   * @param kernel
   *          the kernel which is activating the bootstrap
   * @throws ComponentActivatorException
   *           if there was a problem activating the component.
   * @see org.sakaiproject.kernel.api.ComponentActivator#activate(org.sakaiproject.kernel.api.Kernel)
   */
  public void activate(Kernel kernel) throws ComponentActivatorException {
    LOG.info("Activating the bootstrap shared container");
    this.kernel = kernel;
    KernelBootstrapModule kbmodule = new KernelBootstrapModule(kernel);
    Injector injector = Guice.createInjector(kbmodule);
    for (Class<?> c : KERNEL_SERVICES) {
      Object s = injector.getInstance(c);
      if (debug) {
        LOG.debug("Loaded " + c + " as " + s);
      }
    }

    ServiceManager serviceManager = kernel.getServiceManager();
    for (Class<?> c : EXPORTED_KERNEL_SERVICES) {
      Object s = injector.getInstance(c);
      try {
        serviceManager.registerService(new ServiceSpec(c), s);
      } catch (ServiceManagerException e) {
        throw new ComponentActivatorException("Failed to register service " + c
            + " cause:" + e.getMessage(), e);
      }
      if (debug) {
        LOG.debug("Registered " + c + " as " + s);
      } else {
        LOG.info("Registered service " + c);
      }
    }

    // finally invoke the component loader
    ComponentLoaderService loader = kernel.getServiceManager().getService(
        new ServiceSpec(ComponentLoaderService.class));
    Properties p = kbmodule.getProperties();

    LOG.info("==============> Phase 1 Start Complete: Bootstrap activation successful");
    try {
      loader.load(p.getProperty("core.component.locations")+p.getProperty("component.locations"), false);
      LOG.info("==============> Phase 2 Start Complete: Core kernel component load success");
    } catch (IOException e) {
      LOG.info("==============> Phase 2 Start Failed: Core kernel component loading failed");
          throw new ComponentActivatorException("Failed to load kernel components "
          + e.getMessage(), e);
    } catch (ComponentSpecificationException e) {
      LOG.info("==============> Phase 2 Start Failed: Core kernel component loading failed");
            throw new ComponentActivatorException("Failed to load kernel components "
          + e.getMessage(), e);
    } catch (KernelConfigurationException e) {
      LOG.info("==============> Phase 2 Start Failed: Core kernel component loading failed");
           throw new ComponentActivatorException("Failed to load kernel components "
          + e.getMessage(), e);
    }
  }

  /**
   * Deactivate this component.
   * 
   * @see org.sakaiproject.kernel.api.ComponentActivator#deactivate()
   */
  public void deactivate() {
    Collection<RequiresStop> toStop = kernel.getServiceManager().getServices(
        new ServiceSpec(RequiresStop.class, true));

    for (RequiresStop s : toStop) {
      s.stop();
    }
    LogFactory.release(this.getClass().getClassLoader());
  }

}
