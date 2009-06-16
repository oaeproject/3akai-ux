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
 * Resolves artifacts into URLs
 */
public interface ArtifactResolverService {

  /**
   * Convert a specification for a jar into a URL to be added to a set of URL's.
   * Rules for adding later versions are embedded in the implementation of the
   * dependency resolver service.
   * 
   * @param urls
   *          the existing urls in the classloader
   * @param groupId
   *          the groupId of the new dependency
   * @param artifactId
   *          the artifact of the dependency
   * @param versionId
   *          the version of the dependency
   * @param classifier
   *          the classifier of the dependency (may be null)
   * @return null if there is nothing to add, or the URL if the url needs to be
   *         added.
   * @throws ComponentSpecificationException 
   */
  URL resolve(URL[] urls, Artifact classpathDependency) throws ComponentSpecificationException;

}
