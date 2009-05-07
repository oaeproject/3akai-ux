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

import com.google.inject.Inject;
import com.google.inject.Injector;

import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.ServiceManagerException;
import org.sakaiproject.kernel.api.ServiceSpec;

/**
 * This class creates a service that gives access to the injector that was used
 * to create the core kernel.
 */
public class KernelInjectorService {

  /**
   * The injector used to construct this service.
   */
  private Injector injector;

  /**
   * Create an injector service, specifying the kernel and the injector.
   * 
   * @param kernel the kernel
   * @param injector the injector to use.
   * @throws ServiceManagerException if there is a problem creating this service.
   */
  @Inject
  public KernelInjectorService(Kernel kernel, Injector injector)
      throws ServiceManagerException {
    this.injector = injector;
    kernel.getServiceManager().registerService(
        new ServiceSpec(KernelInjectorService.class), this);
  }

  /**
   * @return the core injector that was used to create the kernel.
   */
  public Injector getInjector() {
    return injector;
  }

}
