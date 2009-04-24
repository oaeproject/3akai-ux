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
package org.sakaiproject.componentsample;

import com.google.inject.Guice;
import com.google.inject.Injector;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.componentsample.api.HelloWorldService;
import org.sakaiproject.kernel.api.ComponentActivator;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ServiceManagerException;
import org.sakaiproject.kernel.api.ServiceSpec;
import org.sakaiproject.kernel.api.jcr.JCRService;

import javax.jcr.Repository;

/**
 * This class brings the component up and down on demand.
 */
public class GuiceActivator implements ComponentActivator {

  /**
   *
   */
  private static final Log LOG = LogFactory.getLog(GuiceActivator.class);
  /**
   * We might need to know which kernel this activator is attached to, its
   * possible to have more than one in a JVM.
   */
  private Kernel kernel;

  /**
   *
   */
  private Injector injector;

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.ComponentActivator#activate(org.sakaiproject.kernel.api.Kernel)
   */
  public void activate(Kernel pKernel) throws ComponentActivatorException {

    this.kernel = pKernel;
    this.injector = Guice.createInjector(new ComponentModule(kernel));

    // here I want to create my services and register them
    HelloWorldService hws = injector.getInstance(HelloWorldService.class);

    // thats it. my service is ready to go, so lets register it
    // get the service manager
    ServiceManager serviceManager = kernel.getServiceManager();

    // just for fun.. resolve the JCRService and get a reference to the repository.
    LOG.info("Resolving a reference to the JCR service");
    JCRService service = serviceManager.getService(new ServiceSpec(
        JCRService.class));
    Repository repo = service.getRepository();
    for (String k : repo.getDescriptorKeys()) {
      LOG.info("JCR Repo Key "+k+":"+repo.getDescriptor(k));
    }
    LOG.info("Successfully logged in to the JCR service");

    // create a ServiceSpecification for the class I want to register,
    // the class here MUST be a class that was exported (see component.xml)
    // otherwise
    // nothing else will be able to see it. The service manager might enforce
    // this if I get
    // around to it.
    ServiceSpec serviceSpec = new ServiceSpec(HelloWorldService.class);

    // register the service
    try {
      serviceManager.registerService(serviceSpec, hws);
    } catch (ServiceManagerException e) {
      // oops something happened, re-throw as an activation issue
      throw new ComponentActivatorException("Failed to register service ", e);
    }

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.ComponentActivator#deactivate()
   */
  public void deactivate() {
    // we need to remove the service (this is the short way of doing the above)
    kernel.getServiceManager().deregisterService(
        new ServiceSpec(HelloWorldService.class));
  }

}
