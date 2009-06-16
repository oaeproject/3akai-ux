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

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentManager;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.component.KernelImpl;

/**
 *
 */
public class KernelImplTest {
  
  

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelImpl#start()}.
   */
  @Test
  public void testStart() {
    KernelImpl k = new KernelImpl();
    k.start();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelImpl#stop()}.
   */
  @Test
  public void testStop() {
    KernelImpl k = new KernelImpl();
    k.start();
    k.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelImpl#getComponentManager()}.
   */
  @Test
  public void testGetComponentManager() {
    KernelImpl k = new KernelImpl();
    k.start();
    ComponentManager cm = k.getComponentManager();
    assertNull(cm);
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelImpl#getServiceManager()}.
   */
  @Test
  public void testGetServiceManager() {
    KernelImpl k = new KernelImpl();
    k.start();
    ServiceManager sm = k.getServiceManager();
    assertNull(sm);
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelImpl#getParentComponentClassLoader()}.
   */
  @Test
  public void testGetParentComponentClassLoader() {
    KernelImpl k = new KernelImpl();
    k.start();
    ClassLoader cl = k.getParentComponentClassLoader();
    assertNotNull(cl);
  }


}
