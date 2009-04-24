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
package org.sakaiproject.kernel.api;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;

/**
 * This interface defines a class exporter, normally this will be implemented by
 * the classloader that is exporting the class. Care must be taken in
 * implementation since infinite recursion is possible if a class exporter
 * inadvertently invokes another class exporter.
 */
public interface Exporter {

  /**
   * Load the exported class.
   * 
   * @param name
   *          the name of the class
   * @return the class associated with the name
   * @throws ClassNotFoundException
   *           if the class was not found
   */
  Class<?> loadExportedClass(String name) throws ClassNotFoundException;

  /**
   * Get the exported resource as a stream.
   * 
   * @param name
   *          the path to the resource
   * @return an InputStream for the resource, or null if the resource was not
   *         found.
   */
  InputStream getExportedResourceAsStream(String name);

  /**
   * @return the artifact that created this exporter.
   */
  Artifact getArtifact();

  /**
   * @param name
   * @return
   * @throws IOException
   */
  Enumeration<URL> findExportedResources(String name) throws IOException;

}
