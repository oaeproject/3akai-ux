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

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.Artifact;
import org.sakaiproject.kernel.api.ArtifactResolverService;
import org.sakaiproject.kernel.api.ComponentSpecificationException;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

/**
 *
 */
public class Maven2ArtifactResolver implements ArtifactResolverService {

  private File repo;

  /**
   *
   */
  @Inject
  public Maven2ArtifactResolver() {
    String repoHome = System.clearProperty("local.repo.location");
    if ( StringUtils.isEmpty(repoHome)) {
      repoHome = System.getProperty("user.home");
    }
    repo = new File(new File(repoHome, ".m2"),
        "repository");

  }

  /**
   * {@inheritDoc}
   *
   * @throws ComponentSpecificationException
   *
   * @see org.sakaiproject.kernel.api.ArtifactResolverService#resolve(java.net.URL[],
   *      org.sakaiproject.kernel.api.Artifact)
   */
  public URL resolve(URL[] urls, Artifact classpathDependency)
      throws ComponentSpecificationException {
    String groupId = classpathDependency.getGroupId().replace('.',
        File.separatorChar);
    String artifactId = classpathDependency.getArtifactId();
    String version = classpathDependency.getVersion();
    if (version == null || version.trim().length() == 0 || groupId == null
        || groupId.trim().length() == 0 || artifactId == null
        || artifactId.trim().length() == 0) {
      throw new ComponentSpecificationException(
          "GroupId, ArtifactId and Version must all be specified on " +
          "dependencies that are resolved GroupId="
              + groupId + " Artifact=" + artifactId + " Version=" + version);
    }
    groupId = groupId.trim();
    artifactId = artifactId.trim();
    version = version.trim();
    String type = classpathDependency.getType();
    if ( type == null ||  type.trim().length() == 0 ) {
      type = "jar";
    }
    type = type.trim();

    String classifier = classpathDependency.getClassifier();
    if ( classifier != null && classifier.trim().length() > 0 ) {
      classifier = "-"+classifier.trim();
    } else {
      classifier = "";
    }

    File resource = new File(new File(new File(groupId, artifactId), version),
        artifactId + "-" + version + classifier + "." + type);
    File localResource = new File(repo, resource.getPath());
    if (!localResource.exists()) {
      throw new ComponentSpecificationException(
          "Resource does not exist locally " + classpathDependency
              + " resloved as " + localResource.getAbsolutePath());
    }

    URI ui = localResource.toURI();
    if ((urls != null) && (ui != null)) {
      URI cui = null;
      for (URL clu : urls) {
        try {
          cui = clu.toURI();
        } catch (URISyntaxException e) {
          throw new ComponentSpecificationException("Unable to create URI for  "    + clu.toString()
              + " in urls while resolving " + classpathDependency, e);
        }
        if (ui.equals(cui)) {
          return null;
        }
      }
    }

    URL u = null;
    try {
        u = ui.toURL();
    } catch (MalformedURLException e) {
      throw new ComponentSpecificationException("Unable to create URL for  "
          + classpathDependency, e);
    }
    return u;
  }

}
