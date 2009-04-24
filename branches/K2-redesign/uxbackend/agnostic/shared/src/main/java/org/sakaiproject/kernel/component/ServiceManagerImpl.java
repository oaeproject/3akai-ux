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
package org.sakaiproject.kernel.component;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.ClassLoaderMisconfigurationException;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ServiceManagerException;
import org.sakaiproject.kernel.api.ServiceSpec;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The service manager implementation.
 */
public class ServiceManagerImpl implements ServiceManager {

  private static final Log LOG = LogFactory.getLog(ServiceManagerImpl.class);
  /**
   * The kernel
   */
  @SuppressWarnings("unused")
  private Kernel kernel;
  /**
   * A map of services.
   */
  private Map<ServiceSpec, Object> services = new ConcurrentHashMap<ServiceSpec, Object>();

  /**
   * Create the ServiceManager for the supplied kernel.
   * 
   * @param kernel
   *          the kernel.
   */
  public ServiceManagerImpl(KernelImpl kernel) {
    this.kernel = kernel;
    kernel.setServiceManager(this);
  }

  /**
   * Start the service manager.
   */
  public void start() {
  }

  /**
   * Stop the service manager.
   */
  public void stop() {
    LOG.info("== Starting ServiceManager Shutdown");
    LOG.info("== ServiceManager Shutdown Complete");
  }

  /**
   * @param <T>
   *          the service API class.
   * @param serviceSpec
   *          the specification of the service.
   * @return the service registered against the service spec. If none is found,
   *         then null is retruend.
   * @see org.sakaiproject.kernel.api.ServiceManager#getService(org.sakaiproject.kernel.api.ServiceSpec)
   */
  @SuppressWarnings("unchecked")
  public <T> T getService(ServiceSpec serviceSpec) {
    T service = (T) services.get(serviceSpec);
    if ( service == null ) {
      String serviceName = serviceSpec.getServiceClass().getName();
      for ( ServiceSpec ss : services.keySet() ) {
        if ( serviceName.equals(ss.getServiceClass().getName()) ) {
          throw new ClassLoaderMisconfigurationException(serviceSpec.getServiceClass(),ss.getServiceClass());
        }
      }
    }
    return service;
  }

  /**
   * Register a service against a spec.
   * 
   * @param serviceSpec
   *          the service specification to register the service against.
   * @param service
   *          the service to be registered.
   * @see org.sakaiproject.kernel.api.ServiceManager#registerService(org.sakaiproject.kernel.api.ServiceSpec,
   *      java.lang.Object)
   */
  public void registerService(ServiceSpec serviceSpec, Object service)
      throws ServiceManagerException {
    if (services.containsKey(serviceSpec)) {
      throw new ServiceManagerException("Can register duplicate services");
    }
    services.put(serviceSpec, service);
  }

  /**
   * De register a service.
   * 
   * @param serviceSpec
   *          the specification of the service to deregister.
   * @see org.sakaiproject.kernel.api.ServiceManager#deregisterService(org.sakaiproject.kernel.api.ServiceSpec)
   */
  public void deregisterService(ServiceSpec serviceSpec) {
    services.remove(serviceSpec);
  }

  /**
   * Get a list of services that match the supplied service spec, which may be
   * looking for services the implement an interface or extend a class.
   * 
   * @param <T>
   *          the type of service.
   * @param serviceSpec
   *          a service specification that may be a wildcard query based on
   *          implementing a class.
   * @return a collection of services matching the service spec query.
   * @see org.sakaiproject.kernel.api.ServiceManager#getServices(org.sakaiproject.kernel.api.ServiceSpec)
   */
  @SuppressWarnings("unchecked")
  public <T> Collection<T> getServices(ServiceSpec serviceSpec) {
    Collection<T> matchedServices = new ArrayList<T>();
    for (Entry<ServiceSpec, Object> e : services.entrySet()) {
      if (serviceSpec.matches(new ServiceSpec(e.getValue().getClass()))) {
        matchedServices.add((T) e.getValue());
      }
    }
    return matchedServices;
  }

  /**
   * @return an array of service specifications representing the current set of
   *         services.
   * @see org.sakaiproject.kernel.api.ServiceManager#getServices()
   */
  public ServiceSpec[] getServices() {
    return services.keySet().toArray(new ServiceSpec[0]);
  }

}
