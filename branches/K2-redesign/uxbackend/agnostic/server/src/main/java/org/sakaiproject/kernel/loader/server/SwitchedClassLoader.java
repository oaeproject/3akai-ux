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
package org.sakaiproject.kernel.loader.server;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.net.URL;
import java.net.URLClassLoader;

/**
 *
 */
public class SwitchedClassLoader extends URLClassLoader {

  private static final Log LOG = LogFactory.getLog(SwitchedClassLoader.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private ClassLoader containerClassloader;

  /**
   * @param giClassLoader
   */
  public SwitchedClassLoader(URL[] urls, ClassLoader parentClassLoader,
      ClassLoader containerClassloader) {
    super(urls, parentClassLoader);
    this.containerClassloader = containerClassloader;
  }

  /*
   * (non-Javadoc)
   * 
   * @see java.lang.ClassLoader#loadClass(java.lang.String, boolean)
   */
  @Override
  protected synchronized Class<?> loadClass(String name, boolean resolve)
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
        c = this.findClass(name);
      } catch (ClassNotFoundException e) {
        ex = e;
      }
    }

    if (debug)
      LOG.debug("Resolved "+name+" as "+c);
    if (c == null)
      throw ex;

    if (resolve)
      resolveClass(c);

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
      url = this.findResource(name);

      if (url == null && name.startsWith("/")) {
        url = this.findResource(name.substring(1));
      }
    }

    return url;
  }
}
