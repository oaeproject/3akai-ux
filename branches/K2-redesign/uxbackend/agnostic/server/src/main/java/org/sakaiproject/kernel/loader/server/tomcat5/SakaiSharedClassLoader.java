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
package org.sakaiproject.kernel.loader.server.tomcat5;

import org.apache.catalina.loader.WebappClassLoader;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.loader.common.CommonObjectConfigurationException;
import org.sakaiproject.kernel.loader.common.CommonObjectManager;

import java.io.InputStream;
import java.net.URL;

/**
 * This class provides a classloader that may be used underneath other
 * components to give control over the structure of the application. In the case
 * of tomcat all webapps share the same common classloader. It is registered
 */
public class SakaiSharedClassLoader extends WebappClassLoader {
  private static final Log LOG = LogFactory.getLog(SakaiSharedClassLoader.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private ClassLoader containerClassloader;

  /**
   * 
   */
  public SakaiSharedClassLoader() {
    super();
    containerClassloader = getContainerClassloader();
    LOG
        .info("====================================CREATING WEBAPP CLASSLOADER\n"
            + "Parent :\n"
            + parent
            + "\nKernel Shared Classloader:\n"
            + containerClassloader + "\nParent Classloader:\n" + parent);
  }

  public SakaiSharedClassLoader(ClassLoader parent) {
    super(parent);
    containerClassloader = getContainerClassloader();

    LOG
        .info("====================================CREATING WEBAPP CLASSLOADER\n"
            + "Parent :\n"
            + parent
            + "\nKernel Shared Classloader:\n"
            + containerClassloader + "\nParent Classloader:\n" + parent);

  }

  /**
   * @param pcl
   * @return
   */
  protected ClassLoader getContainerClassloader() {
    ClassLoader parentClassLoader = null;
    try {
      CommonObjectManager commonObjectManager = new CommonObjectManager(
          "sharedclassloader");
      parentClassLoader = commonObjectManager.getManagedObject();
    } catch (CommonObjectConfigurationException e) {
      LOG.error(e);
    }
    if (debug)
      LOG.debug("Using Custom Shared Classloader Ok Using parent as  "
          + parentClassLoader);
    return parentClassLoader;
  }

  /*
   * (non-Javadoc)
   * 
   * @see java.lang.ClassLoader#loadClass(java.lang.String, boolean)
   */
  @Override
  public synchronized Class<?> loadClass(String name, boolean resolve)
      throws ClassNotFoundException {
    Class<?> c = findLoadedClass(name);
    ClassNotFoundException ex = null;

    if (c == null && containerClassloader != null) {
      try {
        c = containerClassloader.loadClass(name);

        if (debug)
          LOG.debug("loaded " + c);
      } catch (ClassNotFoundException e) {
        ex = e;
      }
    }

    if (c == null) {
      try {
        c = super.loadClass(name, resolve);
      } catch (ClassNotFoundException e) {
        ex = e;
      }
    }

    if (debug)
      LOG.debug("Resolved " + name + " as " + c);
    if (c == null)
      throw ex;

    if (debug)
      LOG.debug("loaded " + c + " from " + c.getClassLoader());

    return c;
  }

  /*
   * (non-Javadoc)
   * 
   * @see java.lang.ClassLoader#getResource(java.lang.String)
   */
  @Override
  public URL getResource(String name) {
    URL url = null;
    url = containerClassloader.getResource(name);
    if (url == null) {
      url = super.getResource(name);

      if (url == null && name.startsWith("/")) {
        url = super.getResource(name.substring(1));
      }
    }
    return url;
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.apache.catalina.loader.WebappClassLoader#getResourceAsStream(java.lang.String)
   */
  @Override
  public InputStream getResourceAsStream(String name) {
    InputStream in = null;
    if (containerClassloader != null) {
      in = containerClassloader.getResourceAsStream(name);

      if (in != null) {
        if (debug)
          LOG.debug("loaded " + in);
        return in;
      }
    }
    in = super.getResourceAsStream(name);
    return in;
  }
}
