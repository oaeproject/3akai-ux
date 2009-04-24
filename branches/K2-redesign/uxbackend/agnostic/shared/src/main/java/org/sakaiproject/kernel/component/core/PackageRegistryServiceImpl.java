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

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.Exporter;
import org.sakaiproject.kernel.api.PackageRegistryService;

import java.io.IOException;
import java.net.URL;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 * Provides a tree implementation of the package register
 */
public class PackageRegistryServiceImpl implements PackageRegistryService {

  protected static final Log LOG = LogFactory
      .getLog(PackageRegistryService.class);
  private PackageExport root = new PackageExport("root", null);

  /**
   * {@inheritDoc}
   *
   * @throws ComponentSpecificationException
   * @see org.sakaiproject.kernel.api.ExportedPackagedRegistryService#addExport(java.lang.String,
   *      java.lang.ClassLoader)
   */
  public void addExport(String stub, Exporter exporter) {
    String[] elements = StringUtils.split(stub, '.');
    PackageExport p = root;
    if (elements != null) {
      for (String element : elements) {
        PackageExport np = p.get(element);
        if (np == null) {
          np = new PackageExport(element, p);
          p.put(element, np);
        }
        p = np;
      }
    }
    p.setClassExporter(exporter);
  }

  /**
   * {@inheritDoc}
   *
   * @throws ComponentSpecificationException
   * @see org.sakaiproject.kernel.api.ExportedPackagedRegistryService#addExport(java.lang.String,
   *      java.lang.ClassLoader)
   */
  public void addResource(String stub, Exporter exporter) {
    String[] elements = StringUtils.split(stub, '/');
    PackageExport p = root;
    if (elements != null) {
      for (String element : elements) {
        PackageExport np = p.get(element);
        if (np == null) {
          np = new PackageExport(element, p);
          p.put(element, np);
        }
        p = np;
      }
    }
    p.addResourceExporter(exporter);
  }

  /**
   * {@inheritDoc}
   *
   * @return
   *
   * @see org.sakaiproject.kernel.api.ExportedPackagedRegistryService#findClassloader(java.lang.String)
   */
  public Exporter findClassloader(String packageName) {
    return findExporter(StringUtils.split(packageName, '.'));
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.PackageRegistryService#findResourceloader(java.lang.String)
   */
  public Exporter findResourceloader(String resource) {
    return findExporter(StringUtils.split(resource, '/'));
  }

  /**
   * Find the exported by traversing the treemap
   *
   * @param elements
   *          the pathway to the exporter.
   * @return the most specific exporter or null if none.
   */
  private Exporter findExporter(String[] elements) {
    PackageExport p = root;
    if (elements != null) {
      for (String element : elements) {
        PackageExport np = p.get(element);
        if (np == null) {
          break;
        }
        p = np;
      }
    }
    return p.getClassExporter();
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.ExportedPackagedRegistryService#removeExport(java.lang.String)
   */
  public void removeExport(String stub) {
    String[] elements = StringUtils.split(stub, '.');
    PackageExport p = root;
    PackageExport container = root;
    String key = null;
    if (elements != null) {
      for (String element : elements) {
        PackageExport np = p.get(element);
        if (np == null) {
          break;
        }
        container = p;
        key = element;
        p = np;

      }
    }
    if (key != null) {
      PackageExport child = container.get(key);
      if (child != null) {
        Exporter parentClassloader = container.getClassExporter();

        if (setChildClassLoaders(child, child.getClassExporter(),
            parentClassloader) == 0) {
          // if there are no other classloaders in in the child tree, remove the
          // child tree alltogether.
          container.remove(key);
        } else {
          child.setClassExporter(parentClassloader);
        }
      } else {
        LOG.warn("Located a null child at a key that should have contained a PackageExport Key was:"+key);
      }
    }
  }

  /**
   * @param child
   * @param classLoader
   * @param classLoader2
   * @return
   */
  private int setChildClassLoaders(PackageExport child,
      Exporter childClassLoader, Exporter parentClassloader) {
    int t = 0;
    for (PackageExport pe : child.values()) {
      if (pe.getClassExporter() == childClassLoader) {
        pe.setClassExporter(parentClassloader);
      } else {
        // found a classloader that is not the child classloader, so increment
        // the counter
        t++;
      }
      t += setChildClassLoaders(pe, childClassLoader, parentClassloader);
    }
    return t;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.PackageRegistryService#getExports()
   */
  public Map<String, String> getExports() {
    Map<String, String> flattenedMap = new HashMap<String, String>();
    loadExports("", root, flattenedMap);
    return flattenedMap;
  }

  /**
   * @param root2
   * @param flattenedMap
   */
  private void loadExports(String base, PackageExport pe,
      Map<String, String> flattenedMap) {
    flattenedMap.put(base, String.valueOf(pe.getClassExporter()));
    for (Entry<String, PackageExport> npe : pe.entrySet()) {
      loadExports(base + npe.getKey() + ".", npe.getValue(), flattenedMap);
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.PackageRegistryService#findExportedResources(java.lang.String)
   */
  public Enumeration<URL> findExportedResources(final String name) {
    PackageExport p = root;
    String[] elements = StringUtils.split(name, '/');
    if (elements != null) {
      for (String element : elements) {
        PackageExport np = p.get(element);
        if (np == null) {
          break;
        }
        p = np;
      }
    }
    List<Exporter> exporters = p.getResourceExporters();
    final Iterator<Exporter> iexporters = exporters.iterator();
    return new Enumeration<URL>() {

      private Enumeration<URL> currentEnumerator;

      public boolean hasMoreElements() {
        // check the current enumerator
        if (currentEnumerator != null && currentEnumerator.hasMoreElements()) {
          return true;
        }
        currentEnumerator = null;
        // find the next available enumerator with elements
        while (currentEnumerator == null && iexporters.hasNext()) {
          Exporter currentExporter = iexporters.next();
          try {
            currentEnumerator = currentExporter.findExportedResources(name);
          } catch (IOException e) {
            LOG.error("Failed to open Exporter, ignored ", e);
          }
          if (currentEnumerator != null && currentEnumerator.hasMoreElements()) {
            return true;
          }
        }
        return false;
      }

      public URL nextElement() {
        return currentEnumerator.nextElement();
      }
    };

  }

}
