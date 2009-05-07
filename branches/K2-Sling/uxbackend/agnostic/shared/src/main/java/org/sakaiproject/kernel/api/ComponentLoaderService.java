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

/**
 * The component loader service performs the job of loading components into the
 * kernel.
 */
public interface ComponentLoaderService {

  /**
   * Loads components from a specified location.
   * 
   * @param componentLocations
   *          the location of the components, this is a ; separated list of
   *          locations where the components are found each being the root of a
   *          classpath folder, individual jars or a directory containing jars
   * @param fromClassloader
   *          if true the kernel classloader will be added to the search for
   *          component specifications
   * @throws IOException
   *           if there is a problem reading any of the locations
   * @throws ComponentSpecificationException
   *           if there is a problem with any of the specification files
   * @throws KernelConfigurationException
   *           if the kernel hasnt been configured properly.
   */
  void load(String componentLocations, boolean fromClassloader)
      throws IOException, ComponentSpecificationException,
      KernelConfigurationException;

}
