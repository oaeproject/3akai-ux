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


/**
 * A ComponentSpecification is required to manage a component, it may specify a
 * list of classpath urls to build a classpath and it may optionally specify and
 * activation classloader.
 */
public interface ComponentSpecification  {

  /**
   * @return an list of classpath dependencies
   */
  Artifact[] getDependencies();

  /**
   * @return the packages that will be exported
   */
  PackageExport[] getExports();

  /**
   * @return the ClassName of the activator class for this component, expected
   *         to be resolvable in the classpath specified. This class must
   *         implement the ComponentActivator interface
   */
  String getComponentActivatorClassName();

  /**
   * @return an array of ComponentDependencies that this component depends upon.
   */
  Artifact[] getComponentDependencies();

  String getDefinition();

  /**
   * @return the component name.
   */
  String getName();

  /**
   * @return a string representation of the dependency description.
   */
  String getDependencyDescription();

  /**
   * @return the classpath of the component itself
   */
  URL getComponentClasspath();

  /**
   * @return true if the component is part of the kernel bootstrap
   */
  boolean isKernelBootstrap();
  
  
  /**
   * @return the artifact for this component
   */
  Artifact getComponentArtifact();

}
