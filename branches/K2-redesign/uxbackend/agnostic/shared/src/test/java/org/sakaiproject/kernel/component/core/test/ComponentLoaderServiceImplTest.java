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
package org.sakaiproject.kernel.component.core.test;

import static org.junit.Assert.*;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentSpecification;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.KernelConfigurationException;
import org.sakaiproject.kernel.component.core.ComponentLoaderServiceImpl;
import org.sakaiproject.kernel.component.core.Maven2ArtifactResolver;
import org.sakaiproject.kernel.component.test.mock.MockComponentManager;
import org.sakaiproject.kernel.util.FileUtil;
import org.sakaiproject.kernel.util.ResourceLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;

/**
 * 
 */
public class ComponentLoaderServiceImplTest {

  private static final String COMPONENT1 = "res://org/sakaiproject/kernel/component/core/test/component1.xml";
  private static final String COMPONENT2 = "res://org/sakaiproject/kernel/component/core/test/component2.xml";
  private static final Log LOG = LogFactory.getLog(ComponentLoaderServiceImplTest.class) ;
  private static final boolean debug = LOG.isDebugEnabled();
  private File baseFile;

  /**
   * @throws java.lang.Exception
   */
  @Before
  public void setUp() throws Exception {
    baseFile = new File("target/fileutiltest");
    touchFile(new File(baseFile, "testfile1.txt"));
    touchFile(new File(baseFile, "testfile2.txt"));
    createComponent(new File(baseFile, "testfile1.jar"), COMPONENT1);
    File c = new File(baseFile, "sub");
    File d = new File(c, "sub");
    File e = new File(d, "sub");
    File x = new File(e, "sub");
    touchFile(new File(x, "testfile1.txt"));
    touchFile(new File(x, "testfile2.txt"));
    createComponent(new File(x, "testfile2.jar"), COMPONENT2);

  }

  /**
   * @param file
   * @throws IOException
   */
  private void createComponent(File f, String component) throws IOException {
    if (f.getParentFile().mkdirs()) {
      if (debug)
        LOG.debug("Created Directory " + f);
    }
    JarOutputStream jarOutput = new JarOutputStream(new FileOutputStream(f));
    JarEntry jarEntry = new JarEntry("SAKAI-INF/component.xml");
    jarOutput.putNextEntry(jarEntry);
    String componentXml = ResourceLoader.readResource(component, this
        .getClass().getClassLoader());
    jarOutput.write(componentXml.getBytes("UTF-8"));
    jarOutput.closeEntry();
    jarOutput.close();
  }

  /**
   * @param f
   * @throws IOException
   */
  private void touchFile(File f) throws IOException {
    if (f.getParentFile().mkdirs()) {
      if (debug)
        LOG.debug("Created Directory " + f);
    }
    FileWriter fw = new FileWriter(f);
    try {
      fw.write(String.valueOf(System.currentTimeMillis()));
    } finally {
      fw.close();
    }
  }

  /**
   * @throws java.lang.Exception
   */
  @After
  public void tearDown() throws Exception {
    FileUtil.deleteAll(baseFile);
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.core.ComponentLoaderServiceImpl#load(java.lang.String, boolean)}
   * .
   * 
   * @throws KernelConfigurationException
   * @throws ComponentSpecificationException
   * @throws IOException
   */
  @Test
  public void testLoad() throws IOException, ComponentSpecificationException,
      KernelConfigurationException {
    MockComponentManager cm = new MockComponentManager();
    Maven2ArtifactResolver dependencyResolver = new Maven2ArtifactResolver();
    ComponentLoaderServiceImpl cl = new ComponentLoaderServiceImpl(cm,
        dependencyResolver);
    cl.load(baseFile.getPath(), false);
    ComponentSpecification[] specs = cm.getStartedComponents();
    assertEquals(2, specs.length);
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.core.ComponentLoaderServiceImpl#load(java.lang.String, boolean)}
   * .
   * 
   * @throws KernelConfigurationException
   * @throws ComponentSpecificationException
   * @throws IOException
   */
  @Test
  public void testLoadSingle() throws IOException,
      ComponentSpecificationException, KernelConfigurationException {
    MockComponentManager cm = new MockComponentManager();
    Maven2ArtifactResolver dependencyResolver = new Maven2ArtifactResolver();
    ComponentLoaderServiceImpl cl = new ComponentLoaderServiceImpl(cm,
        dependencyResolver);
    File singleJar = new File(baseFile, "testfile1.jar");
    createComponent(singleJar, COMPONENT1);

    cl.load(singleJar.getPath(), false);
    ComponentSpecification[] specs = cm.getStartedComponents();
    assertEquals(1, specs.length);
  }

}
