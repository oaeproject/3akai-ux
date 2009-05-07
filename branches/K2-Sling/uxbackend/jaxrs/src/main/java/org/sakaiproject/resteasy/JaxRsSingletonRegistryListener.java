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

import org.jboss.resteasy.spi.Registry;
import org.sakaiproject.kernel.api.RegistryListener;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;

/**
 * Listens for changes to Sakai's JAX-RS registry, and updates RestEasy's internal
 * resource registry.
 */
public class JaxRsSingletonRegistryListener implements
    RegistryListener<JaxRsSingletonProvider> {
  /**
   *
   */
  private Registry registry;
  private RootRestEasyDocumentation defaultDocumentation;

  /**
   * @param jaxRsRegistry
   *          the registry where we are registering JAXRS Beans.
   * @param defaultDocumentation
   *          the default documentation bean.
   */
  public JaxRsSingletonRegistryListener(Registry jaxRsRegistry,
      RootRestEasyDocumentation defaultDocumentation) {
    this.registry = jaxRsRegistry;
    this.defaultDocumentation = defaultDocumentation;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.RegistryListener#added(java.lang.Object)
   */
  public void added(JaxRsSingletonProvider wasAdded) {
    registry.addSingletonResource(wasAdded.getJaxRsSingleton());
    defaultDocumentation.addRegistration(wasAdded.getJaxRsSingleton());
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.RegistryListener#removed(java.lang.Object)
   */
  public void removed(JaxRsSingletonProvider wasRemoved) {
    registry.removeRegistrations(wasRemoved.getJaxRsSingleton().getClass());
    defaultDocumentation.removeRegistration(wasRemoved.getJaxRsSingleton().getClass());
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.RegistryListener#updated(java.lang.Object)
   */
  public void updated(JaxRsSingletonProvider wasUpdated) {
    registry.removeRegistrations(wasUpdated.getJaxRsSingleton().getClass());
    registry.addSingletonResource(wasUpdated.getJaxRsSingleton());
    defaultDocumentation.addRegistration(wasUpdated.getJaxRsSingleton());
  }

}
