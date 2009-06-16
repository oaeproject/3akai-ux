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

package org.sakaiproject.kernel2.test;

import static org.junit.Assert.assertTrue;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.component.KernelLifecycle;
import org.sakaiproject.kernel.util.FileUtil;

import java.io.File;
import java.net.URL;
import java.util.Enumeration;

public class OrmProjectLoaderTest {
  private static final Log LOG = LogFactory.getLog(OrmProjectLoaderTest.class);


  @BeforeClass
  public static void beforeClass() throws ComponentActivatorException, ClassNotFoundException {

    
    /*

    // activate kernel core stuff
    ComponentActivator activator = new org.sakaiproject.kernel.Activator();
    activator.activate(kernel);

    // register with the shutdown service
    ShutdownService ss = kernel.getServiceManager().getService(
        new ServiceSpec(ShutdownService.class));
    for (Class<?> c : org.sakaiproject.kernel.Activator.SERVICE_CLASSES) {
      Object s = kernel.getServiceManager().getService(new ServiceSpec(c));
      if (s instanceof RequiresStop) {
        ss.register((RequiresStop) s);
      }
    }

    // // activate this project
    // activator = new org.sakaiproject.kernel.jpa.Activator();
    // activator.activate(kernel);
    //
    // // activate model project 2
    // activator = new org.sakaiproject.kernel2.mp2.Activator();
    // activator.activate(kernel);

    */
  }

  @AfterClass
  public static void afterClass() {
  }

  // ignore this because it is not relavent any more.
  @Ignore
  public void countPersistence() throws Exception {
    // count the number of persistence files found on the classpath
    int count = 0;
    for (Enumeration<URL> orms = this.getClass().getClassLoader().getResources(
        "META-INF/persistence.xml"); orms.hasMoreElements();) {
      URL orm = orms.nextElement();
      System.out.println("** pers:" + count + ": " + orm);
      count++;
    }
    System.out.println("*** Found " + count
        + " persistence.xml files on the classpath.");
    assertTrue(count > 1);
  }

  // ignore this because it is not relavent any more.
  @Ignore
  public void countOrm() throws Exception {
    // count the number of ORMs found on the classpath
    int count = 0;
    for (Enumeration<URL> orms = this.getClass().getClassLoader().getResources(
        "META-INF/orm.xml"); orms.hasMoreElements();) {
      URL orm = orms.nextElement();
      System.out.println("** orm:" + count + ": " + orm);
      count++;
    }
    System.out.println("*** Found " + count
        + " orm.xml files on the classpath.");
    assertTrue(count > 1);
  }

  
  @Test
  public void dummySoThereIsATest() {
    // If there are problems with startup and shutdown, these will prevent the
    // problem
    File jcrBase = new File("target/jcr");
    File dbBase = new File("target/testdb");
    System.err
        .println("==========================================================================");
    System.err.println("Removing all previous JCR and DB traces from "
        + jcrBase.getAbsolutePath() + " " + dbBase.getAbsolutePath());

    FileUtil.deleteAll(jcrBase);
    FileUtil.deleteAll(dbBase);
    System.err
        .println("==========================================================================");

    
    System.setProperty("sakai.kernel.properties", "inline://core.component.locations=../../kernel/target/classes/SAKAI-INF/component.xml;\ncomponent.locations=target/classes/SAKAI-INF/component.xml;../model-project-1/target/classes/SAKAI-INF/component.xml;../model-project-2/target/classes/SAKAI-INF/component.xml;../../kernel/target/classes/SAKAI-INF/component.xml\n");

    // the tests are in the activator
    KernelLifecycle kernelLifecycle = new KernelLifecycle();
    kernelLifecycle.start();

    
    try {
      if (kernelLifecycle != null) {
        kernelLifecycle.stop();
        kernelLifecycle.destroy();
      }
    } catch (Exception ex) {
      LOG.info("Failed to stop kernel ", ex);
    }

  }
}
