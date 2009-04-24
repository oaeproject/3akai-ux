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

/**
 * A Component Activator activates the component within the Kernel. During
 * activation, the component activator should register any services with the
 * kernel. Some components may perform de-activation depending on their
 * dependencies. The ComponentActivator is invoked by the component manager
 * that understands dependencies and the component specification.
 */
public interface ComponentActivator {

  /**
   * Activate the component in the context of the suppled kernel.
   * 
   * @param kernel
   *          the kernel context in which to perform the activation.
   * @throws ComponentActivatorException 
   * 
   */
  void activate(Kernel kernel) throws ComponentActivatorException;

  /**
   * De-activate the component.
   */
  void deactivate();

}
