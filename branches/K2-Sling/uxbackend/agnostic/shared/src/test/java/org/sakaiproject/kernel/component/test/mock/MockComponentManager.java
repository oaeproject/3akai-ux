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
package org.sakaiproject.kernel.component.test.mock;

import org.sakaiproject.kernel.api.ComponentManager;
import org.sakaiproject.kernel.api.ComponentSpecification;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.KernelConfigurationException;

import java.util.ArrayList;
import java.util.List;

/**
 * 
 */
public class MockComponentManager implements ComponentManager {

  private List<ComponentSpecification> loadedComponents = new ArrayList<ComponentSpecification>();
  private List<ComponentSpecification> startedComponents = new ArrayList<ComponentSpecification>();

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.ComponentManager#getLoadedComponents()
   */
  public ComponentSpecification[] getLoadedComponents() {
    return loadedComponents.toArray(new ComponentSpecification[0]);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.ComponentManager#getStartedComponents()
   */
  public ComponentSpecification[] getStartedComponents() {
    return startedComponents.toArray(new ComponentSpecification[0]);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.ComponentManager#loadComponents(java.util.List)
   */
  public void loadComponents(List<ComponentSpecification> cs) {
    loadedComponents.addAll(cs);
    
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.ComponentManager#startComponent(org.sakaiproject.kernel.api.ComponentSpecification)
   */
  public boolean startComponent(ComponentSpecification spec)
      throws KernelConfigurationException, ComponentSpecificationException {
    startedComponents.add(spec);
    return true;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.ComponentManager#startComponents(java.util.List)
   */
  public void startComponents(List<ComponentSpecification> specs)
      throws ComponentSpecificationException, KernelConfigurationException {
    startedComponents.addAll(specs);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.ComponentManager#stopComponent(org.sakaiproject.kernel.api.ComponentSpecification)
   */
  public boolean stopComponent(ComponentSpecification spec) {
    startedComponents.remove(spec);
    return true;
  }

}
