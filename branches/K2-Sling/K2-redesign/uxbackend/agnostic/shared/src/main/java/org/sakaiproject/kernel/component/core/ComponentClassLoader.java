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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Artifact;
import org.sakaiproject.kernel.api.Exporter;
import org.sakaiproject.kernel.api.PackageRegistryService;
import org.sakaiproject.kernel.component.model.DependencyImpl;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * The Component Classloader is used for components, and will resolve classes
 * exported from other Classloaders into the package registry service. In
 * addition it acts exactly in the same way the URLClassloader operates,
 * resolving to the parent.
 */
public class ComponentClassLoader extends URLClassLoader implements
    Exporter {

  private static final Log LOG = LogFactory.getLog(ComponentClassLoader.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private PackageRegistryService packageRegistryService;
  private Artifact artifact;
  private static final ThreadLocal<String> spacing = new ThreadLocal<String>() {
    /**
     * {@inheritDoc}
     * 
     * @see java.lang.ThreadLocal#initialValue()
     */
    @Override
    protected String initialValue() {
      return "1";
    }
  };

  /**
   * 
   */
  public ComponentClassLoader(PackageRegistryService packageRegistryService,
      URL[] urls, ClassLoader parent, Artifact artifact) {
    super(urls, parent);
    this.packageRegistryService = packageRegistryService;
    this.artifact = artifact;
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

    if ( c == null && packageRegistryService != null) {
      Exporter exporter = packageRegistryService.findClassloader(name);
      if (exporter != null) {
        try {

          if (debug) {
            LOG.debug("Using export ClassLoader " + exporter);
          }
          c = exporter.loadExportedClass(name);
          if (debug) {
            LOG.debug("Got Exported Class " + c + " from " + exporter);
          }
        } catch (ClassNotFoundException e) {
          ex = e;
        }
      }
    } else {
      if (debug) {
        LOG.info("Not Loading from exports ");
      }
    }

    // then load internally
    if (c == null) {
      try {
        c = this.findClass(name);
        if (debug) {
          LOG.debug("Got Internal Class " + c + " from " + this);
        }
      } catch (ClassNotFoundException e) {
        ex = e;
      }
    }

    if (c == null) {
      try {
        c = getParent().loadClass(name);
        if (debug) {
          LOG.debug("Got Parent Class " + c + " from " + getParent());
        }
      } catch (ClassNotFoundException e) {
        ex = e;
      }
    }

    if (debug) {
      LOG.debug("Resolved " + name + " as " + c);
    }
    if (c == null)
      throw ex;

    if (resolve) {
      resolveClass(c);
    }

    if (debug) {
      LOG.debug("loaded " + c + " from " + c.getClassLoader());
    }
    return c;

  }
  /**
   * {@inheritDoc}
   * @throws ClassNotFoundException 
   * 
   * @see org.sakaiproject.kernel.api.Exporter#loadExportedClass(java.lang.String)
   */
  public Class<?> loadExportedClass(String name) throws ClassNotFoundException {
    Class<?> c = findLoadedClass(name);
    if (c == null) {
        c = this.findClass(name);
    }
    return c;
  }


  /**
   * {@inheritDoc}
   * 
   * @see java.lang.Object#toString()
   */
  @Override
  public String toString() {
    String t = spacing.get();
    try {
      String bl = t + " :         ";
      StringBuilder sb = new StringBuilder();
      sb.append(DependencyImpl.toString(artifact)).append("(").append(super.toString()).append(")\n");
      sb.append(bl).append("Contents :");
      for (URL u : getURLs()) {
        sb.append("\n").append(bl).append(u);
      }
      ClassLoader parent = getParent();
      Map<ClassLoader, ClassLoader> parents = new LinkedHashMap<ClassLoader, ClassLoader>();

      while (parent != null && !parents.containsKey(parent)) {
        parents.put(parent, parent);
        parent = parent.getParent();
      }
      if (t.equals("1")) {
        sb.append("\n").append(bl).append("Classloaders :");
        int i = 1;
        for (ClassLoader p : parents.keySet()) {
          String l = t + "." + i;
          spacing.set(l);
          sb.append("\n").append(l).append(" :").append(p);
          i++;
        }
      }
      return sb.toString();
    } finally {
      spacing.set(t);
    }
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.apache.catalina.loader.WebappClassLoader#getResourceAsStream(java.lang.String)
   */
  @Override
  public InputStream getResourceAsStream(String name) {
    InputStream in = null;
    if (packageRegistryService != null) {
      Exporter exporter = packageRegistryService.findResourceloader(name);
      if (exporter != null) {

        in = exporter.getExportedResourceAsStream(name);

        if (in != null) {
          if (debug)
            LOG.debug("Loaded from Export " + in);
          return in;
        }
      }
    }
    return super.getResourceAsStream(name);
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.Exporter#getExportedResourceAsStream(java.lang.String)
   */
  public InputStream getExportedResourceAsStream(String name) {
    return super.getResourceAsStream(name);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.Exporter#getArtifact()
   */
  public Artifact getArtifact() {
    return artifact;
  }
  
  
  /**
   * {@inheritDoc}
   * @see java.net.URLClassLoader#findResources(java.lang.String)
   */
  @Override
  public Enumeration<URL> findResources(String name) throws IOException {
    final Enumeration<URL> resources = packageRegistryService.findExportedResources(name);
    final Enumeration<URL> parent = super.findResources(name);
    return new Enumeration<URL>() {
      boolean exported = true;
      public boolean hasMoreElements() {
        boolean hasmore = false;
        if ( exported ) {
          hasmore = resources.hasMoreElements(); 
        }
        if ( ! hasmore ) {
          exported = false;
          hasmore = parent.hasMoreElements();
        }
        return hasmore;
      }
      public URL nextElement() {
        if ( exported ) {
          return resources.nextElement();
        }
        return parent.nextElement();
      }
    };
  }

  /**
   * {@inheritDoc}
   * @throws IOException 
   * @see org.sakaiproject.kernel.api.Exporter#getExportedResources(java.lang.String)
   */
  public Enumeration<URL> findExportedResources(String name) throws IOException {
    return super.findResources(name);
  }
  
}
