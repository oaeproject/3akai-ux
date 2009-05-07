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
package org.sakaiproject.kernel.component.core.guice;

import com.google.inject.Provider;

import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ServiceSpec;

/**
 * Performs lazy binding to a kernel service. The class must be created in the
 * module as the class of the required service must be specified. This class is
 * guice specific.
 */
public class ServiceProvider<T> implements Provider<T> {

  private ServiceManager serviceManager;
  private ServiceSpec service;

  /**
   * Construct a
   */
  public ServiceProvider(ServiceManager serviceManager, Class<T> clazz) {
    this.serviceManager = serviceManager;
    this.service = new ServiceSpec(clazz);
  }

  /**
   * Get the service from the service manager. 
   * @see com.google.inject.Provider#get()
   */
  @SuppressWarnings("unchecked")
  public T get() {
    return (T) serviceManager.getService(service); // cast is required to tell service manager what type
  }

}
