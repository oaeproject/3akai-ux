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

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

import org.sakaiproject.kernel.api.Artifact;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.ArtifactResolverService;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.PackageRegistryService;

import java.net.URL;

/**
 * The shared classloader acts a a shared space for utility jars. It will load
 * packages first from exported space and then from shared space. Components may
 * add urls to the shared classpath. It only provides loading of classes and not
 * resources from the exported classes.
 */
@Singleton
public class SharedClassLoader extends ComponentClassLoader {

  public static final String SHARED_CLASSLOADER_ARTIFACT = "shared.classloader.artifact";
  private ArtifactResolverService artifactResolverService;

  @Inject
  public SharedClassLoader(PackageRegistryService packageRegistryService,
      ArtifactResolverService artifactResolverService, @Named(SHARED_CLASSLOADER_ARTIFACT) Artifact artifact, Kernel kernel) {
    super(packageRegistryService,new URL[0],kernel.getParentComponentClassLoader(),artifact);
    this.artifactResolverService = artifactResolverService;
  }

  /**
   * @param groupId
   * @param artifactId
   * @param versionId
   * @param classifier
   * @throws ComponentSpecificationException 
   */
  public void addDependency(Artifact classpathDependency) throws ComponentSpecificationException {
    URL classPathUrl = artifactResolverService.resolve(getURLs(),
        classpathDependency);
    if (classPathUrl != null) {
      addURL(classPathUrl);
    }
  }

}
