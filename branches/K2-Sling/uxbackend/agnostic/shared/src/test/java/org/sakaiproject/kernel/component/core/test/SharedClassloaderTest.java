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

import static org.junit.Assert.assertSame;
import static org.junit.Assert.fail;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.DependencyScope;
import org.sakaiproject.kernel.api.Exporter;
import org.sakaiproject.kernel.component.KernelImpl;
import org.sakaiproject.kernel.component.core.Maven2ArtifactResolver;
import org.sakaiproject.kernel.component.core.PackageRegistryServiceImpl;
import org.sakaiproject.kernel.component.core.SharedClassLoader;
import org.sakaiproject.kernel.component.core.SharedClassloaderArtifact;
import org.sakaiproject.kernel.component.model.DependencyImpl;
import org.sakaiproject.kernel.component.test.mock.MockArtifact;

import java.io.IOException;
import java.net.MalformedURLException;

/**
 *
 */
public class SharedClassloaderTest {

  private static final Log LOG = LogFactory.getLog(SharedClassloaderTest.class);

  @Test
  public void testExportedPackages() throws MalformedURLException, IOException,
      ComponentSpecificationException {
    PackageRegistryServiceImpl prs = new PackageRegistryServiceImpl();
    Maven2ArtifactResolver dependencyResolver = new Maven2ArtifactResolver();
    KernelImpl kernel = new KernelImpl();

    // add an export that wont be used
    Exporter exportClassloader = new MockClassExport(this.getClass()
        .getClassLoader(),new MockArtifact("unused-exporter"),"META-INF/persistance.xml");
    prs.addExport("org.sakaiproject.kernel.component.test", exportClassloader);

    SharedClassLoader cc = new SharedClassLoader(prs, dependencyResolver,
        new SharedClassloaderArtifact(), kernel);
    LOG.info("Classloader Structure is " + cc.toString());

    // Check the class in not visible
    try {
      cc.loadClass("org.apache.commons.codec.binary.Base64");
      fail();
    } catch (ClassNotFoundException e) {
    }

    DependencyImpl cpdep = new DependencyImpl();
    cpdep.setGroupId("commons-codec");
    cpdep.setArtifactId("commons-codec");
    cpdep.setVersion("1.3");
    cpdep.setScope(DependencyScope.SHARE);

    cc.addDependency(cpdep);

    LOG.info("Classloader Structure after add is  " + cc.toString());

    // load something from the exported classloader
    try {
      Class<?> c = cc.loadClass("org.apache.commons.codec.binary.Base64");
      assertSame(cc, c.getClassLoader());
    } catch (ClassNotFoundException e) {
      fail();
    }

  }
}
