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

import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.component.core.PackageRegistryServiceImpl;
import org.sakaiproject.kernel.component.test.mock.MockArtifact;

import java.net.URL;
import java.net.URLClassLoader;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.Enumeration;
import java.util.Map;
import java.util.Map.Entry;

/**
 * 
 */
public class PackageRegistryServiceTest {

  private MockClassExport apiLoader;
  private PackageRegistryServiceImpl registry;
  private MockClassExport special;
  private MockClassExport specialsomewhere;

  @Before
  public void setUp() {

    apiLoader = new MockClassExport(AccessController
        .doPrivileged(new PrivilegedAction<URLClassLoader>() {

          public URLClassLoader run() {
            return new URLClassLoader(new URL[0]);
          }

        }), new MockArtifact("apiloader"), "META-INF/persistance.xml");
    special = new MockClassExport(AccessController
        .doPrivileged(new PrivilegedAction<URLClassLoader>() {

          public URLClassLoader run() {
            return new URLClassLoader(new URL[0]);
          }

        }),
        new MockArtifact("special"), "META-INF/persistance.xml");
    specialsomewhere = new MockClassExport(AccessController
        .doPrivileged(new PrivilegedAction<URLClassLoader>() {

          public URLClassLoader run() {
            return new URLClassLoader(new URL[0]);
          }

        }),
        new MockArtifact("specialsomewhere"), "META-INF/persistance.xml");
    registry = new PackageRegistryServiceImpl();

  }

  @After
  public void tearDown() {

  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.core.PackageRegistryServiceImpl#addExport(java.lang.String, java.lang.ClassLoader)}
   * .
   */
  @Test
  public void testAddExport() {
    registry.addExport("org.sakaiproject.kernel.api", apiLoader);
    registry
        .addExport("org.sakaiproject.kernel.api.something.special", special);
    registry.addExport(
        "org.sakaiproject.kernel.api.something.special2.somewhere",
        specialsomewhere);
    registry.addExport(
        "org.sakaiproject.kernel.api.something.special.somewhere.else",
        specialsomewhere);

    assertNull(registry.findClassloader("com.ibm"));
    assertNull(registry.findClassloader("org.sakaiproject.kernel"));
    assertSame(apiLoader, registry
        .findClassloader("org.sakaiproject.kernel.api"));
    assertSame(apiLoader, registry
        .findClassloader("org.sakaiproject.kernel.api.user.util.other.Test123"));
    assertSame(apiLoader, registry
        .findClassloader("org.sakaiproject.kernel.api.something"));
    assertSame(apiLoader, registry
        .findClassloader("org.sakaiproject.kernel.api.something.special2"));
    assertSame(special, registry
        .findClassloader("org.sakaiproject.kernel.api.something.special"));
    assertSame(
        special,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special.Test12345"));
    assertSame(
        specialsomewhere,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special2.somewhere"));
    assertSame(
        specialsomewhere,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special2.somewhere.xsye.ses.Test321"));
    assertSame(
        special,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special.somewhere.Test213"));
    assertSame(
        specialsomewhere,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special.somewhere.else.Test213"));

    registry.removeExport("org.sakaiproject.kernel.api.something.special");
    assertSame(apiLoader, registry
        .findClassloader("org.sakaiproject.kernel.api.something.special"));
    assertSame(
        apiLoader,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special.Test12345"));
    assertSame(
        specialsomewhere,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special2.somewhere"));
    assertSame(
        specialsomewhere,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special2.somewhere.xsye.ses.Test321"));
    assertSame(
        apiLoader,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special.somewhere.Test213"));
    assertSame(
        specialsomewhere,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special.somewhere.else.Test213"));

    registry
        .removeExport("org.sakaiproject.kernel.api.something.special.somewhere.else.or.something");
    registry
        .removeExport("org.sakaiproject.kernel.api.something.special.somewhere.else");
    assertSame(apiLoader, registry
        .findClassloader("org.sakaiproject.kernel.api.something.special"));
    assertSame(
        apiLoader,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special.Test12345"));
    assertSame(
        specialsomewhere,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special2.somewhere"));
    assertSame(
        specialsomewhere,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special2.somewhere.xsye.ses.Test321"));
    assertSame(
        apiLoader,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special.somewhere.Test213"));
    assertSame(
        apiLoader,
        registry
            .findClassloader("org.sakaiproject.kernel.api.something.special.somewhere.else.Test213"));
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.core.PackageRegistryServiceImpl#addExport(java.lang.String, java.lang.ClassLoader)}
   * .
   */
  @Test
  public void testAddResource() {
    registry.addResource("org/sakaiproject/kernel", apiLoader);
    registry
        .addExport("org/sakaiproject/kernel/api/something/special", special);

    Enumeration<URL> e = registry
        .findExportedResources("org/sakaiproject/kernel");
    while (e.hasMoreElements()) {
      @SuppressWarnings("unused")
      URL u = e.nextElement();
    }

  }

  @Test
  public void testGetExports() {
    registry.addResource("org/sakaiproject/kernel", apiLoader);
    registry
        .addExport("org.sakaiproject.kernel.api.something.special", special);
    Map<String, String> exports = registry.getExports();
    for (Entry<String, String> e : exports.entrySet()) {
      System.err.println("Entry " + e.getKey() + ":" + e.getValue());
    }
  }

}
