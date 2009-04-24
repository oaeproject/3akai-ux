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

import org.sakaiproject.kernel.api.Artifact;
import org.sakaiproject.kernel.api.Exporter;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;

/**
 * 
 */
public class MockClassExport implements Exporter {

  private ClassLoader classLoader;
  private Artifact artifact;

  /**
   * @param classLoader
   */
  public MockClassExport(ClassLoader classLoader, Artifact artifact, String resource) {
    this.classLoader = classLoader;
    this.artifact = artifact;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.Exporter#getExportedResourceAsStream(java.lang.String)
   */
  public InputStream getExportedResourceAsStream(String name) {
    return classLoader.getResourceAsStream(name);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.Exporter#loadExportedClass(java.lang.String)
   */
  public Class<?> loadExportedClass(String name) throws ClassNotFoundException {
    return classLoader.loadClass(name);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.Exporter#getArtifact()
   */
  public Artifact getArtifact() {
    return artifact;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.Exporter#findExportedResources(java.lang.String)
   */
  public Enumeration<URL> findExportedResources(String name) throws IOException {
    return classLoader.getResources(name);
  }

}
