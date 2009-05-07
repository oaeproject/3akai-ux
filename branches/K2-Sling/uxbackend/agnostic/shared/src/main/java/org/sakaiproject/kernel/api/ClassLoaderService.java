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

/**
 * A service to provide Classloaders to the kernel based on component
 * specifications. These classloaders should be fully populate with the the
 * class path elements in the component specification, and where appropriate
 * packages should be exported and dependencies injected into the shared
 * classloader. The resulting classloader should configured and ready for use.
 */
public interface ClassLoaderService {

  /**
   * Create a ComponentClassLoader based on the specification
   * 
   * @param spec
   *          the ComponentSpecification
   * @return the new Component Classloader
   * @throws ComponentSpecificationException
   */
  ClassLoader getComponentClassLoader(ComponentSpecification spec)
      throws ComponentSpecificationException;

}
