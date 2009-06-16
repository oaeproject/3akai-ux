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

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.Key;
import com.google.inject.Module;
import com.google.inject.TypeLiteral;

import org.apache.commons.lang.StringUtils;

import java.util.List;

import javax.servlet.ServletContextEvent;

/**
 *
 */
public class GuiceLoaderListener {

  private static final String INIT_MODULES = "modules";
  private Injector injector;
  private List<Initialisable> initializers;

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.ServletContextListener#contextDestroyed(javax.servlet.ServletContextEvent)
   */
  public void contextDestroyed(ServletContextEvent sce) {
    if (initializers != null) {
      for (Initialisable init : initializers) {
        init.destroy();
      }
    }
  }

  @SuppressWarnings("unchecked")
  public void contextInitialized(ServletContextEvent sce, ClassLoader classloader) {
    try {
      String[] moduleNames = StringUtils.split(sce.getServletContext()
          .getInitParameter(INIT_MODULES), ',');
      Module[] modules = null;
      if (moduleNames == null) {
        modules = new Module[0];
      } else {
        modules = new Module[moduleNames.length];
        for (int i = 0; i < moduleNames.length; i++) {
          Class<Module> clazz = (Class<Module>) classloader
              .loadClass(moduleNames[i]);
          modules[i] = clazz.newInstance();
        }
      }
      injector = Guice.createInjector(modules);
      TypeLiteral<List<Initialisable>> initializersType = new TypeLiteral<List<Initialisable>>() {
      };
      initializers = injector.getInstance(Key.get(initializersType));
      for (Initialisable init : initializers) {
        init.init();
      }
    } catch (RuntimeException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new RuntimeException("Failed to start guild context :"
          + ex.getMessage(), ex);
    }
  }

}
