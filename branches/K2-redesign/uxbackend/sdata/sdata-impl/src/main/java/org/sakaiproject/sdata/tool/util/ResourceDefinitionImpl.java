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

package org.sakaiproject.sdata.tool.util;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.sdata.tool.api.ResourceDefinition;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.api.SecurityAssertion;

/**
 * A default ResoruceDefition bean for file system services and functions.
 * 
 */
public class ResourceDefinitionImpl implements ResourceDefinition {

  private static final Log LOG = LogFactory
      .getLog(ResourceDefinitionImpl.class);
  private static final boolean debug = LOG.isDebugEnabled();

  /**
   * The version
   */
  protected String version;

  protected String basePath;

  protected String repoPath;

  protected String function;

  protected int depth;

  private String pathspecification;

  private String method;

  private SecurityAssertion securityAssertion;

  /**
   * Create a filesystem or content resource definition bean
   * 
   * @param inbasePath
   *          the base path of the resource in the repository
   * @param inpath
   *          the path reference in the request in repository terms. This means
   *          after processing the path info from the http request, this is the
   *          path into the repository, but is not relative to the repository
   *          root. For that, the base path must be prefixed to this.
   * @param method
   *          the method being applied
   * @param depth
   *          the depth of of the query (normally used for metadata) made in the
   *          request. This is the number of levels below this resource for
   *          which data will be returned.
   * @param version
   *          the version being requested.
   * @throws SDataException
   */
  public ResourceDefinitionImpl(String method, String f, int depth,
      String inbasePath, String inpath, String inversion,
      SecurityAssertion securityAssertion) throws SDataException {
    if (debug) {
      LOG.debug("ResourceDef: Base:" + inbasePath + ": path:" + inpath
          + ": version:" + inversion);
    }

    this.pathspecification = cleanPath(inpath, false);
    this.method = method;
    this.securityAssertion = securityAssertion;
    this.version = inversion;
    this.basePath = String.valueOf(inbasePath);

    this.function = f;
    this.depth = depth;
    if (basePath.endsWith("/")) {
      repoPath = basePath + inpath;
    } else {
      repoPath = basePath + "/" + inpath;
    }
    repoPath = cleanPath(repoPath, true);
    repoPath = repoPath.replaceAll("//", "/");
    if (repoPath.length() > 1 && repoPath.endsWith("/")) {
      repoPath = repoPath.substring(0, repoPath.length() - 1);
    }
    if (!repoPath.startsWith("/")) {
      repoPath = "/" + repoPath;
    }

    securityAssertion.check(method, repoPath);
  }

  /**
   * {@inheritDoc}
   * @throws SDataException 
   * 
   * @see org.sakaiproject.sdata.tool.api.ResourceDefinition#getParentResourceDefinition()
   */
  public ResourceDefinition getParentResourceDefinition() throws SDataException {
    int i = pathspecification.lastIndexOf('/');
    if (i <= 0) {
      return null;
    } else {
      return new ResourceDefinitionImpl(method, function, depth, basePath,
          pathspecification.substring(0, i), version, securityAssertion);
    }
  }

  /**
   * Clean the path up, removing // and training /, this is per the JCR spec,
   * however CHS requires a trailing / on all collections, which (IMHO) is
   * wrong.
   * 
   * @param repoPath2
   * @return
   */
  protected String cleanPath(String p, boolean absolute) {
    p = p.replaceAll("//", "/");
    // remove trailing /
    if (p.length() > 1 && p.endsWith("/")) {
      p = p.substring(0, p.length() - 1);
    }
    // prepend / if absolute.
    if (absolute && !p.startsWith("/")) {
      p = "/" + p;
    }
    return p;

  }

  /**
   * Get the repository path of this bean
   * 
   * @return
   */
  public String getRepositoryPath() {
    return repoPath;
  }

  /**
   * {@inheritDoc}
   * 
   * @param path
   *          a path either absolute or relative.
   * @return a path relative to the base of this type of Resource Definition, or
   *         absolute where that is not possible.
   */
  public String convertToExternalPath(String path) {

    if (path == null) {
      return null;
    }
    if (path.startsWith(basePath)) {
      return cleanPath(path.substring(basePath.length()), false);
    }
    return cleanPath(path, false);
  }

  /**
   * {@inheritDoc}
   * 
   * @param relativePath
   *          the path relative to this resource
   * @return an absolute path. (note this is not a canonical and may include ../
   *         if the relative path includes )
   */
  public String convertToAbsoluteRepositoryPath(String relativePath) {
    return cleanPath(repoPath + "/" + relativePath, true);
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.sdata.tool.api.ResourceDefinition#isPrivate()
   */
  public boolean isPrivate() {
    return false;
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.sdata.tool.api.ResourceDefinition#getFunctionDefinition()
   */
  public String getFunctionDefinition() {
    return function;
  }

  /**
   * Get the depth of the request for recursive queries.
   */
  public int getDepth() {
    return depth;
  }
  
  /**
   * {@inheritDoc}
   * @see org.sakaiproject.sdata.tool.api.ResourceDefinition#getVersion()
   */
  public String getVersion() {
    return version;
  }

}
