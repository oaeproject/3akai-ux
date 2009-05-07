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
package org.sakaiproject.kernel.component.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ServiceManagerException;
import org.sakaiproject.kernel.api.ServiceSpec;
import org.sakaiproject.kernel.component.KernelImpl;
import org.sakaiproject.kernel.component.ServiceManagerImpl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

/**
 *
 */
public class ServiceManagerImplTest {

  private KernelImpl kernel;

  /**
   * @throws java.lang.Exception
   */
  @Before
  public void setUp() throws Exception {
    kernel = new KernelImpl();
    kernel.start();
  }
  
  @After
  public void tearDown() throws Exception {
    kernel.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.ServiceManagerImpl#ServiceManagerImpl(org.sakaiproject.kernel.component.KernelImpl)}.
   */
  @Test
  public void testServiceManagerImpl() {
    ServiceManagerImpl serviceManager = new ServiceManagerImpl(kernel);
    assertNotNull(serviceManager);
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.ServiceManagerImpl#start()}.
   */
  @Test
  public void testStart() {
    ServiceManagerImpl serviceManager = new ServiceManagerImpl(kernel);
    serviceManager.start();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.ServiceManagerImpl#stop()}.
   */
  @Test
  public void testStop() {
    ServiceManagerImpl serviceManager = new ServiceManagerImpl(kernel);
    serviceManager.start();
    serviceManager.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.ServiceManagerImpl#getService(org.sakaiproject.kernel.api.ServiceSpec)}.
   * @throws ServiceManagerException 
   */
  @Test
  public void testGetService() throws ServiceManagerException {
    ServiceManagerImpl serviceManager = new ServiceManagerImpl(kernel);
    serviceManager.start();
    Object service = new Object();
    serviceManager.registerService(new ServiceSpec(ServiceManager.class), service);
    Object registeredService = serviceManager.getService(new ServiceSpec(ServiceManager.class));
    assertEquals(service, registeredService);
    
    // try and get a non matching service
    assertNull(serviceManager.getService(new ServiceSpec(ServiceManagerImpl.class)));
    serviceManager.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.ServiceManagerImpl#registerService(org.sakaiproject.kernel.api.ServiceSpec, java.lang.Object)}.
   * @throws ServiceManagerException 
   */
  @Test
  public void testRegisterService() throws ServiceManagerException {
    ServiceManagerImpl serviceManager = new ServiceManagerImpl(kernel);
    serviceManager.start();
    Object service = new Object();
    serviceManager.registerService(new ServiceSpec(ServiceManager.class), service);
    Object registeredService = serviceManager.getService(new ServiceSpec(ServiceManager.class));
    assertEquals(service, registeredService);
    
    try {
      serviceManager.registerService(new ServiceSpec(ServiceManager.class), service);
      fail("Service manager allows replacement of services");
    } catch ( ServiceManagerException sme ) {
    }
    
    serviceManager.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.ServiceManagerImpl#deregisterService(org.sakaiproject.kernel.api.ServiceSpec)}.
   * @throws ServiceManagerException 
   */
  @Test
  public void testDeregisterService() throws ServiceManagerException {
    ServiceManagerImpl serviceManager = new ServiceManagerImpl(kernel);
    serviceManager.start();
    Object service = new Object();
    serviceManager.registerService(new ServiceSpec(ServiceManager.class), service);
    Object registeredService = serviceManager.getService(new ServiceSpec(ServiceManager.class));
    assertEquals(service, registeredService);
    serviceManager.deregisterService(new ServiceSpec(ServiceManager.class));
    
    // try and get a non matching service
    assertNull(serviceManager.getService(new ServiceSpec(ServiceManager.class)));
    serviceManager.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.ServiceManagerImpl#getServices(org.sakaiproject.kernel.api.ServiceSpec)}.
   * @throws ServiceManagerException 
   */
  @Test
  public void testGetServices() throws ServiceManagerException {
    ServiceManagerImpl serviceManager = new ServiceManagerImpl(kernel);
    serviceManager.start();
    List<String> list = new ArrayList<String>();
    Collection<String> c = new HashSet<String>();
    
    serviceManager.registerService(new ServiceSpec(Collection.class), c);
    serviceManager.registerService(new ServiceSpec(List.class), list);
    Collection<ServiceManager> registeredServices = serviceManager.getServices(new ServiceSpec(Collection.class,true));
    assertEquals(2, registeredServices.size());
    registeredServices = serviceManager.getServices(new ServiceSpec(List.class,true));
    assertEquals(1, registeredServices.size());
    serviceManager.stop();
  }

}
