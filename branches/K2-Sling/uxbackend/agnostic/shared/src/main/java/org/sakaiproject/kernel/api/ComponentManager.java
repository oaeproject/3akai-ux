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
package org.sakaiproject.kernel.api;

import java.util.List;

/**
 * The ComponentManager, manages the life-cycle of components on demand. It is
 * capable so starting and stopping individual components as well as starting
 * the core components, and stopping all components. The ComponentManger does
 * not deal with service registration, only the component life-cycle. The
 * defining of default component and the technology that is used to manage
 * components is a concern for the implementation and not a concern here. Care
 * must be taken to ensure that the ComponentManager API does not bind to any
 * one component manager framework.
 */
public interface ComponentManager {

  /**
   * Start the component specified in the component spec using the supplied
   * ComponentSpec. If the component spec defines component dependencies, these
   * will be started first. If those components already exist within the kernel
   * context, the reference could of each component is incremented.
   * 
   * @param spec
   *          the component specification for the component to start.
   * @return true if the component started ok
   * @throws KernelConfigurationException
   *           if there was a problem starting the component.
   * @throws ComponentSpecificationException 
   */
  boolean startComponent(ComponentSpecification spec)
      throws KernelConfigurationException, ComponentSpecificationException;

  /**
   * Stop the component and all managed dependent components.
   * 
   * @param spec
   *          the component specification.
   * @return
   */
  boolean stopComponent(ComponentSpecification spec);

  /**
   * @return an array of component specifications for components currently loaded.
   */
  ComponentSpecification[] getLoadedComponents();
  
  /**
   * @return an array of component specifications for components currently started.
   */
  ComponentSpecification[] getStartedComponents();

  /**
   * Load components into the component manager ready to be started.
   * @param cs a list of components to load
   */
  void loadComponents(List<ComponentSpecification> cs);

  /**
   * @param specs
   * @throws KernelConfigurationException 
   * @throws ComponentSpecificationException 
   */
  void startComponents(List<ComponentSpecification> specs) throws ComponentSpecificationException, KernelConfigurationException;


}
