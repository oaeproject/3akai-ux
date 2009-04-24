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
package org.sakaiproject.kernel.component.core;

import org.sakaiproject.kernel.api.Exporter;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Provides a spefication for classloading for a specific package. If the next
 * element in the package name is not a key in the map, then the classloader in
 * this class is the classloader that may container the desired class. If the
 * key is there then the value of that key is a PackageExport, and resolution
 * should continue in that class.
 */
public class PackageExport extends ConcurrentHashMap<String, PackageExport> {

  /**
   * Object ID.
   */
  private static final long serialVersionUID = -6420923543893666199L;
  /**
   * The classloader to use for package stubs that end here in the tree.
   */
  private transient Exporter exporter;
  /**
   * The name of the package at this point.
   */
  private String packageName;
  private List<Exporter> resourceExporters;

  /**
   * Create a package export with a package path element and a classloader.
   * 
   * @param packageName
   *          the name of the package (not the full path) that names this
   *          element.
   * @param classLoader
   *          the classloader to use with this package and all unspecified child
   *          packages.
   */
  public PackageExport(String packageName, PackageExport export) {
    this.packageName = packageName;
    resourceExporters = new ArrayList<Exporter>();
    if (export != null) {
      this.exporter = export.getClassExporter();
      for (Exporter e : export.getResourceExporters()) {
        resourceExporters.add(e);
      }
    }
  }

  /**
   * @return the resourceExporters
   */
  public List<Exporter> getResourceExporters() {
    return resourceExporters;
  }

  /**
   * @return the packageName for this PackageExport.
   */
  public String getPackageName() {
    return packageName;
  }

  /**
   * @return the exporter
   */
  public Exporter getClassExporter() {
    return exporter;
  }

  /**
   * @param exporter
   *          the exporter to set
   */
  public void setClassExporter(Exporter exporter) {
    this.exporter = exporter;
  }

  /**
   * @param exporter
   */
  public void addResourceExporter(Exporter exporter) {
    resourceExporters.add(exporter);
  }
}
