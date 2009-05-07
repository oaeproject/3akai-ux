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
import org.sakaiproject.kernel.api.rest.JaxRsPrototypeProvider;

/**
 * Listens for changes to Sakai's JAX-RS prototype registry, and updates
 * RestEasy's internal resource registry.
 */
public class JaxRsPrototypeRegistryListener implements
    RegistryListener<JaxRsPrototypeProvider> {
  /**
   *
   */
  private Registry registry;
  private RootRestEasyDocumentation defaultDocumentation;

  /**
   * @param jaxRsRegistry the where we are registering JAXRS beans.
   * @param defaultDocumentation 
   */
  public JaxRsPrototypeRegistryListener(Registry jaxRsRegistry, RootRestEasyDocumentation defaultDocumentation) {
    this.registry = jaxRsRegistry;
    this.defaultDocumentation = defaultDocumentation;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.RegistryListener#added(java.lang.Object)
   */
  public void added(JaxRsPrototypeProvider wasAdded) {
    registry.addPerRequestResource(wasAdded.getJaxRsPrototype());
    defaultDocumentation.addRegistration(wasAdded.getJaxRsPrototype());
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.RegistryListener#removed(java.lang.Object)
   */
  public void removed(JaxRsPrototypeProvider wasRemoved) {
    registry.removeRegistrations(wasRemoved.getJaxRsPrototype());
    defaultDocumentation.removeRegistration(wasRemoved.getJaxRsPrototype().getClass());
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.RegistryListener#updated(java.lang.Object)
   */
  public void updated(JaxRsPrototypeProvider wasUpdated) {
    registry.removeRegistrations(wasUpdated.getJaxRsPrototype());
    registry.addPerRequestResource(wasUpdated.getJaxRsPrototype());
    defaultDocumentation.addRegistration(wasUpdated.getJaxRsPrototype());
  }

}
