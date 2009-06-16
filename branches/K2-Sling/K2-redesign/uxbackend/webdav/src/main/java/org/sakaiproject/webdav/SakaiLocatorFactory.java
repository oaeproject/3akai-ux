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
package org.sakaiproject.webdav;

import org.apache.jackrabbit.util.Text;
import org.apache.jackrabbit.webdav.DavLocatorFactory;
import org.apache.jackrabbit.webdav.DavResourceLocator;

/**
 * This code is taken from the Apache Sling project, all credit should go there,
 * not here.
 */
public class SakaiLocatorFactory implements DavLocatorFactory {

  private String workspaceName;

  /**
   * @param workspace
   */
  public SakaiLocatorFactory(String workspaceName) {
    this.workspaceName = workspaceName;
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.apache.jackrabbit.webdav.DavLocatorFactory#createResourceLocator(java.lang.String,
   *      java.lang.String)
   */
  public DavResourceLocator createResourceLocator(String prefix, String href) {
    if (href == null) {
      throw new IllegalArgumentException("Request handle must not be null.");
    }

    // if href starts with the prefix, cut the prefix off the href
    if (prefix != null && prefix.length() > 0) {
      if (href.startsWith(prefix)) {
        href = href.substring(prefix.length());
      }
    }

    // remove trailing "/" that is present with collections
    if (href.endsWith("/")) {
      href = href.substring(0, href.length() - 1);
    }

    // an empty requestHandle (after removal of the "/") signifies a request
    // to the root that does not represent a repository item.
    String resourcePath;
    if ("".equals(href)) {
      resourcePath = "/";
    } else {
      resourcePath = Text.unescape(href);
    }
    if ( prefix == null ) {
      prefix = "";
    }

    return new SakaiResourceLocator(prefix, workspaceName, resourcePath, this);
  }

  /**
   * Create a new <code>DavResourceLocator</code> from the specified prefix,
   * workspace path and resource path, whithout modifying the specified Strings.
   * Note, that it is expected that the resource path starts with the given
   * workspace path unless both values are <code>null</code>.
   * 
   * @param prefix
   * @param workspacePath
   *          path or the workspace containing this resource or
   *          <code>null</code>.
   * @param resourcePath
   *          Path of the resource or <code>null</code>. Any non null value must
   *          start with the specified workspace path.
   * @return a new <code>DavResourceLocator</code>
   * @see DavLocatorFactory#createResourceLocator(String, String, String)
   */

  public DavResourceLocator createResourceLocator(String prefix,
      String workspacePath, String resourcePath) {
    return createResourceLocator(prefix, workspacePath, resourcePath, true);

  }

  /**
   * Create a new <code>DavResourceLocator</code> from the specified prefix,
   * workspace path and resource path. I
   * 
   * @param prefix
   * @param workspacePath
   * @param resourcePath
   * @param isResourcePath
   * @see DavLocatorFactory#createResourceLocator(String, String, String,
   *      boolean)
   */
  public DavResourceLocator createResourceLocator(String prefix,
      String workspacePath, String resourcePath, boolean isResourcePath) {
      return new SakaiResourceLocator(prefix, workspacePath, resourcePath, this);
  }

}
