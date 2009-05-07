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
package org.sakaiproject.kernel.integration.test;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.component.KernelLifecycle;

/**
 * Integration test for the kernel.
 */
public class KernelIntegrationTest {

  /**
   *
   */
  private static final Log LOG = LogFactory.getLog(KernelIntegrationTest.class);
  /**
   *
   */
  private static KernelLifecycle kernelLifecycle;

  /**
   * @throws Exception if anything failes to start.
   */
  @BeforeClass
  public static void setUpBeforeClass() throws Exception {
    System.setProperty("sakai.kernel.properties",
        "inline://core.component.locations=\n");
    kernelLifecycle = new KernelLifecycle();
    kernelLifecycle.start();
  }

  /**
   * @throws Exception if anything fails to start.
   */
  @AfterClass
  public static void tearDownAfterClass() throws Exception {
    kernelLifecycle.stop();
    kernelLifecycle.destroy();
    System.clearProperty("sakai.kernel.properties");
  }

  /**
   * @throws Exception on fail.
   */
  @Before
  public void setUp() throws Exception {
  }

  /**
   * @throws Exception on fail.
   */
  @After
  public void tearDown() throws Exception {
  }

  /**
   * Dummy test.
   */
  @Test
  public void testSomething() {
    LOG.info("Tested");
  }

}
