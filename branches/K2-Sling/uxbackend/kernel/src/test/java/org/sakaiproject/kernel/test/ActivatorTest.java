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
package org.sakaiproject.kernel.test;

import static org.junit.Assert.assertFalse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.Activator;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.ComponentManager;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelConfigurationException;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.RequiresStop;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ServiceSpec;
import org.sakaiproject.kernel.api.ShutdownService;
import org.sakaiproject.kernel.component.KernelLifecycle;
import org.sakaiproject.kernel.util.FileUtil;

import java.io.File;

/**
 * 
 */
public class ActivatorTest {

  private static final Log LOG = LogFactory.getLog(ActivatorTest.class);
  private Kernel kernel;
  @SuppressWarnings("unused")
  private ComponentManager componentManager;
  @SuppressWarnings("unused")
  private ServiceManager serviceManager;
  private KernelLifecycle lifecycle;

  @Before
  public void start() throws KernelConfigurationException {
    KernelIntegrationBase.disableKernelStartup();
        // If there are problems with startup and shutdown, these will prevent the
    // problem
    FileUtil.deleteAll(new File("target/jcr"));
    FileUtil.deleteAll(new File("target/testdb"));
    assertFalse(new File("target/jcr").exists());
    lifecycle = new KernelLifecycle();
    lifecycle.start();

    KernelManager kernelManager = new KernelManager();
    kernel = kernelManager.getKernel();
    serviceManager = kernel.getServiceManager();
    componentManager = kernel.getComponentManager();
  }

  @After
  public void stop() {
    try {
      lifecycle.stop();
    } catch (Exception ex) {
      LOG.info("Failed to stop kernel ", ex);
    }
    KernelIntegrationBase.enableKernelStartup();
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.Activator#activate(org.sakaiproject.kernel.api.Kernel)}
   * .
   * 
   * @throws ComponentActivatorException
   */
  @Test
  public void testActivate() throws ComponentActivatorException {
    Activator activator = new Activator();
    activator.activate(kernel);
    for (Class<?> c : Activator.getServiceClasses()) {

      ShutdownService ss = kernel.getServiceManager().getService(
          new ServiceSpec(ShutdownService.class));
      Object s = kernel.getServiceManager().getService(new ServiceSpec(c));
      if (s instanceof RequiresStop) {
        ss.register((RequiresStop) s);
      }
    }
  }

}
