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

import java.net.URL;
import java.util.Enumeration;
import java.util.Map;

/**
 * Provides an in memory tree register for exporters that load exported
 * resources and classes.
 */
public interface PackageRegistryService {

  /**
   * Add a exporter for the package, creating the pathway to the package and
   * setting the exporter at this package to the supplied exporter. If
   * there is already a exporter for this precise package, then it will be
   * replaced. If there is a exporter of a child package, this exporter
   * will take precedence for all packages that do not match that exporter
   * package path, but that exporter will take precedence for any package
   * path that matches that package path.
   * 
   * @param stub
   *          the package stub that identifies this exporter
   * @param classLoader
   *          the exporter
   * @throws ComponentSpecificationException
   */
  void addExport(String stub, Exporter classLoader)
      throws ComponentSpecificationException;

  /**
   * Remove an exporter export, and all child exports for a package path.
   * 
   * @param stub
   *          the exporter stub.
   */
  void removeExport(String stub);

  /**
   * Find an Exporter for a class or package
   * 
   * @param packageName
   *          the name of the package to find the exporter for.
   * @return the exporter that manages the class or package.
   */
  Exporter findClassloader(String packageName);

  /**
   * Find an exporter for a resource path.
   * 
   * @param resource
   *          the name of the resource to find the exporter for.
   * @return the exporter responsible for the resource.
   */
  Exporter findResourceloader(String resource);

  /**
   * Get a list of exports.
   * @return a list of exports
   */
  Map<String, String> getExports();


  /**
   * Get an Enumeration of external resources, looking up in classloaders that have exported resource paths.
   * @param name
   * @return
   */
  Enumeration<URL> findExportedResources(String name);
  
}
