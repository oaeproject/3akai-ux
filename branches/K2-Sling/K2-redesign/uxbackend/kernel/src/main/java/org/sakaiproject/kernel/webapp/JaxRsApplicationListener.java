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

package org.sakaiproject.kernel.webapp;

import java.util.HashSet;
import java.util.Set;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.ws.rs.core.Application;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.api.rest.JaxRsPrototypeProvider;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;

/**
 * Registers JAX-RS Resources from the {@link Application} specified by the
 * "sakai.jaxrs.application" context-param.
 */
public class JaxRsApplicationListener implements ServletContextListener {
  private static final Log LOG = LogFactory
      .getLog(JaxRsApplicationListener.class);

  protected Set<JaxRsSingletonProvider> jaxRsSingletonProviders = new HashSet<JaxRsSingletonProvider>();

  protected Set<JaxRsPrototypeProvider> jaxRsPrototypeProviders = new HashSet<JaxRsPrototypeProvider>();

  @SuppressWarnings("unchecked")
  public void contextInitialized(ServletContextEvent event) {
    Registry<String, JaxRsSingletonProvider> singletonRegistry = getSingletonRegistry();
    Registry<String, JaxRsPrototypeProvider> prototypeRegistry = getPrototypeRegistry();
    String appClass = event.getServletContext().getInitParameter(
        Application.class.getName());
    Application app;
    try {
      Class<?> clazz = Thread.currentThread().getContextClassLoader()
          .loadClass(appClass.trim());
      app = (Application) clazz.newInstance();
    } catch (Exception e) {
      LOG.warn("Unable to instantiate JAX-RS Application " + appClass);
      e.printStackTrace();
      return;
    }
    for (final Object object : app.getSingletons()) {
      if (!(object instanceof Documentable)) {
        throw new IllegalStateException(object + " must implement "
            + Documentable.class);
      }
      JaxRsSingletonProvider provider = new JaxRsSingletonProvider() {
        // The Application object is out of our hands, so we can't
        // properly constrain the classes it returns. Hence, cast it.
        private Documentable documentable = (Documentable) object;

        public Documentable getJaxRsSingleton() {
          return documentable;
        }

        public String getKey() {
          return documentable.getClass().getName();
        }

        public int getPriority() {
          return 0;
        }

        @Override
        public String toString() {
          return "Provider for: " + object.toString();
        }
      };
      jaxRsSingletonProviders.add(provider);
      singletonRegistry.add(provider);
      LOG.info("Added " + provider.getJaxRsSingleton()
          + " to JAX-RS registry " + singletonRegistry);
    }
    for (final Class<?> clazz : app.getClasses()) {
      if (!(Documentable.class.isAssignableFrom(clazz))) {
        throw new IllegalStateException(clazz + " must implement "
            + Documentable.class);
      }

      JaxRsPrototypeProvider provider = new JaxRsPrototypeProvider() {
        // The Application object is out of our hands, so we can't
        // properly constrain the classes it returns. Hence, cast it.
        private Class<? extends Documentable> documentable = (Class<? extends Documentable>) clazz;

        public Class<? extends Documentable> getJaxRsPrototype() {
          return documentable;
        }

        public String getKey() {
          return documentable.getClass().getName();
        }

        public int getPriority() {
          return 0;
        }

        @Override
        public String toString() {
          return "Provider for: " + clazz.toString();
        }
      };
      jaxRsPrototypeProviders.add(provider);
      prototypeRegistry.add(provider);
      LOG.info("Added " + provider.getJaxRsPrototype()
          + " to JAX-RS registry " + prototypeRegistry);

    }
  }

  public void contextDestroyed(ServletContextEvent event) {
    Registry<String, JaxRsSingletonProvider> singletonRegistry = getSingletonRegistry();
    for (JaxRsSingletonProvider provider : jaxRsSingletonProviders) {
      singletonRegistry.remove(provider);
    }
    Registry<String, JaxRsPrototypeProvider> prototypeRegistry = getPrototypeRegistry();
    for (JaxRsPrototypeProvider provider : jaxRsPrototypeProviders) {
      prototypeRegistry.remove(provider);
    }
  }

  protected Registry<String, JaxRsSingletonProvider> getSingletonRegistry() {
    return new KernelManager().getService(RegistryService.class).getRegistry(
        JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY);
  }

  protected Registry<String, JaxRsPrototypeProvider> getPrototypeRegistry() {
    return new KernelManager().getService(RegistryService.class).getRegistry(
        JaxRsPrototypeProvider.JAXRS_PROTOTYPE_REGISTRY);
  }
}
