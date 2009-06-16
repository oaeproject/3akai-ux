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

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;

import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.component.core.Maven2ArtifactResolver;
import org.sakaiproject.kernel.component.model.DependencyImpl;

import java.net.URISyntaxException;
import java.net.URL;

/**
 * 
 */
public class Maven2DependencyResolverTest {

  /**
   * Test method for {@link org.sakaiproject.kernel.component.core.Maven2ArtifactResolver#resolve(java.net.URL[], org.sakaiproject.kernel.api.ClasspathDependency)}.
   * @throws ComponentSpecificationException 
   */
  @Test
  public void testResolve() throws ComponentSpecificationException {
    Maven2ArtifactResolver m2resolver = new Maven2ArtifactResolver();
    DependencyImpl dep = new DependencyImpl();
    dep.setGroupId("com.google.code.guice");
    dep.setArtifactId("guice");
    dep.setVersion("1.0");
    URL[] urls = new URL[1];
    urls[0] = m2resolver.resolve(null, dep);
    try {
        System.err.println("Resolving "+urls[0]+":"+urls[0].toURI()); 
    } catch (URISyntaxException e) {
        fail("URISyntaxException " + e.toString());
    }
    assertNotNull(urls[0]);
    assertNull(m2resolver.resolve(urls, dep));
    
  }

}
