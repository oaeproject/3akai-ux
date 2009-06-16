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

import java.util.Collection;

/**
 * The Service manager provides a central core service where the components
 * register services. Services are registered using the ServiceSpec which allows
 * only one service to be registered against a name. Each service must be
 * registered against an API class, by convention this is the API that the
 * service implements. It is not a requirement of the ServiceManager that the
 * API class is visible outside the component that is registering it, but that
 * would be slightly pointless. Where a service implementation provides more
 * than one Service API, the same service object may be registered multiple
 * times against different APIs. The reason for taking this restrictive approach
 * is to discourage the registration of services that are private to components,
 * or don't represent API's.
 */
public interface ServiceManager {

  /**
   * De-register a service from the component manager, how calls to this service
   * get handled once de-registered is an implementation detail. A simple
   * implementation will de-register the service from lookup, a more complex
   * implementation will enable references to the service to be gracefully
   * restarted once the service is de-registered.
   * 
   * @param serviceSpec
   */
  void deregisterService(ServiceSpec serviceSpec);

  /**
   * get a service based on a specification, the specification must be exact,
   * and only the service that matches the specification will be delivered. To
   * locate services that provide a service type use getServices with a search
   * ServiceSpec.
   * 
   * @param serviceSpec
   *          the precise service spec.
   * @return the service that matches the spec.
   */
  <T> T getService(ServiceSpec serviceSpec);

  /**
   * Register a service with a precise specification.
   * 
   * @param serviceSpec
   *          the service specification
   * @param service
   *          the service to register
   * @throws ServiceManagerException
   *           when there is a problem registering the service.
   */
  void registerService(ServiceSpec serviceSpec, Object service)
      throws ServiceManagerException;

  /**
   * Get all services that match the specification, which may be precise or a
   * search.
   * 
   * @param serviceSpec
   *          the serviceSpecification.
   * @return a collection of services that match the requested type.
   */
  <T> Collection<T> getServices(ServiceSpec serviceSpec);

  /**
   * @return a list of all the service specifications.
   */
  ServiceSpec[] getServices();

}
