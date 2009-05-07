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
 * Services are specified and searched for using a ServiceSpec class, this may
 * be a direct match or it may be a search for services implementing a certain
 * type.
 */
public class ServiceSpec {

  /**
   * The class defining the service.
   */
  private Class<?> serviceClass;
  /**
   * true if the service spec is specifying an interface to be implemented.
   */
  private boolean ofType;

  /**
   * Create a service spec based on a service API. Injecting a service with this
   * class will register the service against the supplied class. Finding or
   * searching for the service will result in a single service implementation.
   * 
   * @param service
   *          the API class that the service represents.
   */
  public ServiceSpec(Class<?> service) {
    serviceClass = service;
    ofType = false;
  }

  /**
   * Create a specification based on a service API, if injecting the service,
   * the service class is used for registration, if finding, again the service
   * type is used for retrieving. If finding, and the ofType is true, then the
   * ServiceSpec matches any service registered as implementing the service
   * class.
   * 
   * @param service
   *          the service class
   * @param ofType
   *          false if the service spec related to a single service, true if it
   *          may relate to more than one service. Note, each service must still
   *          be registered with a unique service class, but by setting this to
   *          true all services of a type may be located.
   */
  public ServiceSpec(Class<?> service, boolean ofType) {
    serviceClass = service;
    this.ofType = ofType;
  }


  /**
   * Check if this specification matches the supplied search specification.
   * 
   * @param serviceSpec
   *          the search specification
   * @return true if this ServiceSpec matches.
   */
  public boolean matches(ServiceSpec serviceSpec) {
    if (equals(serviceSpec)) {
      return true;
    } else if (ofType) {
      return getServiceClass().isAssignableFrom(serviceSpec.getServiceClass());
    }
    return false;
  }

  /**
   * @return the service class of this ServiceSpec.
   */
  public Class<?> getServiceClass() {
    return serviceClass;
  }

  /**
   * calculates the hash-code, delegating to the hash-code of the serviceClass
   * 
   * @return the hascode of the serivce class.
   * @see java.lang.Object#hashCode()
   */
  @Override
  public int hashCode() {
    return serviceClass.hashCode();
  }

  /**
   * Custom equals delegates to the equals of the service class if the test
   * object is a ServiceSpec instanceof.
   * 
   * @param object
   *          the test object.
   * @return true if equal.
   * @see java.lang.Object#equals(java.lang.Object)
   */
  @Override
  public boolean equals(Object object) {
    if (object instanceof ServiceSpec) {
      ServiceSpec ss = (ServiceSpec) object;
      return getServiceClass().equals(ss.getServiceClass());
    }
    return super.equals(object);
  }

  /**
   * @return a string representation of the spec, namely the service classname
   *         that the spec represents.
   * @see java.lang.Object#toString()
   */
  @Override
  public String toString() {
    return getServiceClass().getName();
  }

}
