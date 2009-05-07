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

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.fail;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.DependencyScope;
import org.sakaiproject.kernel.api.Exporter;
import org.sakaiproject.kernel.component.core.ComponentClassLoader;
import org.sakaiproject.kernel.component.core.Maven2ArtifactResolver;
import org.sakaiproject.kernel.component.core.PackageRegistryServiceImpl;
import org.sakaiproject.kernel.component.model.DependencyImpl;
import org.sakaiproject.kernel.component.test.mock.MockArtifact;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;

/**
 * 
 */
public class ComponentClassloaderTest {

  private static final Log LOG = LogFactory
      .getLog(ComponentClassloaderTest.class);
  private ClassLoader exportClassloader;
  private ComponentClassLoader componentClassloader;
  private MockClassExport exporter;
  private PackageRegistryServiceImpl packageRegistryService;

  @Before
  public void setUp() throws ComponentSpecificationException {
    packageRegistryService = new PackageRegistryServiceImpl();
    exportClassloader = this.getClass().getClassLoader();
    exporter = new MockClassExport(exportClassloader,
        new MockArtifact("test1"), "META-INF/persistance.xml");
    packageRegistryService.addExport("org.sakaiproject.kernel.component.test",
        exporter);

    Maven2ArtifactResolver dependencyResolver = new Maven2ArtifactResolver();
    final DependencyImpl cpdep = new DependencyImpl();
    cpdep.setGroupId("commons-lang");
    cpdep.setArtifactId("commons-lang");
    cpdep.setVersion("2.3");
    cpdep.setScope(DependencyScope.SHARE);

    final URL[] urls = new URL[1];
    urls[0] = dependencyResolver.resolve(null, cpdep);

    componentClassloader = AccessController
        .doPrivileged(new PrivilegedAction<ComponentClassLoader>() {

          public ComponentClassLoader run() {
            return new ComponentClassLoader(packageRegistryService, urls, this
                .getClass().getClassLoader(), cpdep);
          }

        });

  }

  @After
  public void tearDown() {

  }

  @Test
  public void testExportedPackages() throws Exception {
    LOG.info("Classloader Structure is " + componentClassloader.toString());
    // test for a non found, look at code coverage to check that the export was
    // checked.
    try {
      componentClassloader
          .loadClass("org.sakaiproject.kernel.component.test.NonExistantClass");
      fail();
    } catch (ClassNotFoundException e) {
    }

    // load something from the exported classloader
    try {
      Class<?> c = componentClassloader
          .loadClass("org.sakaiproject.kernel.component.test.KernelLifecycleTest");
      assertSame(exportClassloader, c.getClassLoader());
      Object o = c.newInstance();
      LOG.info("Exported Object is " + o);
    } catch (ClassNotFoundException e) {
      fail();
    }
    // load something thats only in the ComponentClassloader
    try {
      Class<?> c = componentClassloader
          .loadClass("org.apache.commons.lang.text.StrTokenizer");
      assertSame(componentClassloader, c.getClassLoader());
      Object o = c.newInstance();
      LOG.info("Component Object is " + o);
    } catch (ClassNotFoundException e) {
      LOG.error("Failed ", e);
      fail();
    }

  }

  @Test
  public void testGetResorceAsStream() throws IOException {
    // load from the component classloader
    InputStream in = componentClassloader
        .getResourceAsStream("org/apache/commons/lang/text/StrTokenizer.class");
    assertNotNull(in);
    in.close();
    // load from the exported classloader
    in = componentClassloader
        .getResourceAsStream("org/sakaiproject/kernel/component/test/KernelLifecycleTest.class");
    assertNotNull(in);
    in.close();
  }

  @Test
  public void testGetResorcesAsStream() throws IOException {

    Vector<URL> v = new Vector<URL>();
    v.add(new URL("http://notareal.com/url"));
    Exporter mockExporter = EasyMock.createMock(Exporter.class);

    replay(mockExporter);

    Enumeration<URL> urls = componentClassloader
        .getResources("META-INF/persistance.xml");
    assertNotNull(urls);
    int i = 0;
    Map<String, String> map = new HashMap<String, String>();
    while (urls.hasMoreElements()) {
      i++;
      URL u = urls.nextElement();
      String url = u.toString();
      if (map.containsKey(url)) {
        fail("Duplicate URL found " + url);
      }
      map.put(url, url);
    }
    verify(mockExporter);

    reset(mockExporter);

    expect(mockExporter.findExportedResources("META-INF/persistance.xml"))
        .andReturn(v.elements());
    replay(mockExporter);

    packageRegistryService.addResource("META-INF", mockExporter);

    urls = componentClassloader.getResources("META-INF/persistance.xml");
    assertNotNull(urls);
    i = 0;
    Map<String, String> map2 = new HashMap<String, String>();
    while (urls.hasMoreElements()) {
      i++;
      URL u = urls.nextElement();
      String url = u.toString();
      if (map.containsKey(url)) {

      } else if (map2.containsKey(url)) {
        fail("Duplicate URL found second time " + url);
      } else {
        map2.put(url, url);
        map.put(url, url);
      }
    }
    verify(mockExporter);

  }
}
