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

import static org.junit.Assert.*;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.component.KernelLifecycle;

/**
 *
 */
public class KernelLifecycleTest {

  private KernelLifecycle kl;

  @BeforeClass
  public static void beforeClass() {
    System.setProperty("sakai.kernel.properties", "inline://core.component.locations=\n");    
  }
  
  @AfterClass
  public static void afterClass() {
    System.clearProperty("sakai.kernel.properties");  
  }

  /**
   * @throws java.lang.Exception
   */
  @Before
  public void setUp() throws Exception {
    kl = new KernelLifecycle();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelLifecycle#start()}.
   */
  @Test
  public void testStart() {
    kl.start();
    kl.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelLifecycle#stop()}.
   */
  @Test
  public void testStop() {
    kl.start();
    kl.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelLifecycle#getManagedObject()}.
   */
  @Test
  public void testGetManagedObject() {
    kl.start();
    assertNotNull(kl.getManagedObject());
    kl.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelLifecycle#getLastLoadDate()}.
   */
  @Test
  public void testGetLastLoadDate() {
    kl.start();
    assertNotNull(kl.getLastLoadDate());
    kl.stop();
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.component.KernelLifecycle#getLoadTime()}.
   */
  @Test
  public void testGetLoadTime() {
    kl.start();
    assertTrue(kl.getLoadTime()<10000);
    kl.stop();
  }

}
