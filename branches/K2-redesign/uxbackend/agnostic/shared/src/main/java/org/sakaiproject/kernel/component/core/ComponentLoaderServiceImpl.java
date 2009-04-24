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
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Artifact;
import org.sakaiproject.kernel.api.ArtifactResolverService;
import org.sakaiproject.kernel.api.ComponentLoaderService;
import org.sakaiproject.kernel.api.ComponentManager;
import org.sakaiproject.kernel.api.ComponentSpecification;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.KernelConfigurationException;
import org.sakaiproject.kernel.component.URLComponentSpecificationImpl;
import org.sakaiproject.kernel.component.model.DependencyImpl;
import org.sakaiproject.kernel.util.FileUtil;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLClassLoader;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads components
 */
public class ComponentLoaderServiceImpl implements ComponentLoaderService {

  private static final String COMPONENT_SPEC_XML = "SAKAI-INF/component.xml";
  private static final Log LOG = LogFactory
      .getLog(ComponentLoaderServiceImpl.class);
  private ComponentManager componentManager;
  private ArtifactResolverService artifactResolverService;

  /**
   * @param artifactResolverService
   * @throws IOException
   * @throws ComponentSpecificationException
   * @throws KernelConfigurationException
   *
   */
  @Inject
  public ComponentLoaderServiceImpl(ComponentManager componentManager,
      ArtifactResolverService artifactResolverService) {
    this.componentManager = componentManager;
    this.artifactResolverService = artifactResolverService;
  }

  public void load(String componentLocations, boolean fromClassloader)
      throws IOException, ComponentSpecificationException,
      KernelConfigurationException {
    // convert the location set into a list of URLs
    final Map<String,URL> locations = new HashMap<String,URL>();
    LOG.info("Components are located in: " + componentLocations);
    String[] compLocs = StringUtils.split(componentLocations, ';');
    if (compLocs != null) {
      for (String location : compLocs) {
        location = location.trim();
        if (location.startsWith("maven-repo")) {
          Artifact dep = DependencyImpl.fromString(location);
          URL u = artifactResolverService.resolve(null, dep);
          LOG.info("Added component: " + u);
          locations.put(u.toString(), u);
        } else if (location.endsWith(".jar")) {
          if (location.indexOf("://") < 0) {
            File f = new File(location);
            if (!f.exists()) {
              LOG.warn("Jar file " + f.getAbsolutePath()
                  + " does not exist, will be ignored ");
            } else {
              URL url = null;
              try {
                url = f.toURI().toURL();
                LOG.info("Added component: " + url);
                locations.put(url.toString(), url);
              } catch (MalformedURLException e) {
                LOG
                    .warn("Component load failed, could not map file path to URL");
                LOG.warn("Cause was: " + e.getMessage());
              }
            }
          } else {
            LOG.info("Added component: " + location);
            URL u = new URL(location);
            locations.put(u.toString(), u);
          }
        } else if (location.startsWith("classpath")) {
          // resolve in the current classpath and add directly
          fromClassloader = true;
        } else if (location.endsWith(COMPONENT_SPEC_XML)) {
          location = location.substring(0, location.length()
              - COMPONENT_SPEC_XML.length());
          File f = new File(location);
          URL url = f.toURI().toURL();
          LOG.info("Added component: " + url);
          locations.put(url.toString(), url);
        } else {
          LOG.info("Locating Components in " + location);
          for (File f : FileUtil.findAll(location, ".jar")) {
            URL url = f.toURI().toURL();
            LOG.info("-> added component: " + url);
            locations.put(url.toString(), url);
          }
        }
      }
    }
    LOG.info("Bundle contains " + locations.size() + " components");

    // bind to the parent classloader ?
    ClassLoader pcl = null;
    if (fromClassloader) {
      pcl = this.getClass().getClassLoader();
    }
    final ClassLoader parent = pcl;
    // find all the instances

    LOG.info("==============> Determining class search locations:");
    for ( URL location : locations.values() ) {
      LOG.info("-> searching in "+location.toString());
    }
    LOG.info("==============> End determining class search locations");
    URLClassLoader uclassloader = AccessController.doPrivileged(new PrivilegedAction<URLClassLoader>() {

      public URLClassLoader run() {
        return
        new URLClassLoader(locations.values()
            .toArray(new URL[0]), parent);
     }

    });

    for ( URL u : uclassloader.getURLs() ) {
      LOG.info("URLClassLoader configured with: "+u);
    }
    for (Enumeration<URL> components = uclassloader
        .getResources(COMPONENT_SPEC_XML); components.hasMoreElements();) {
      LOG.info("URLClassLoader found: "+components.nextElement());
    }



    Map<String,ComponentSpecification> specs = new HashMap<String,ComponentSpecification>();
    for (Enumeration<URL> components = uclassloader
        .getResources(COMPONENT_SPEC_XML); components.hasMoreElements();) {
      URL url = components.nextElement();
      try {
        String componentSpecXml = url.toURI().toString();
        String source = componentSpecXml;
       if (source.endsWith(COMPONENT_SPEC_XML)) {
          source = source.substring(0, source.length()
              - COMPONENT_SPEC_XML.length() - 1);
        }
       if ( source.endsWith("!") ) {
         source = source.substring(0,source.length()-1);
       }
        if (source.startsWith("jar:")) {
          source = source.substring(4);
        }
        if (source.endsWith("/")) {
          source = source.substring(0, source.length() - 1);
        }
        LOG.info("Adding Component: " + componentSpecXml + " from " + source);
        specs.put(source,new URLComponentSpecificationImpl(source, componentSpecXml));
      } catch (URISyntaxException e) {
        LOG.warn("Failed to resolve URL " + e.getMessage());
      }
    }
    LOG.info("==============> Specifying Component Set");
    for ( ComponentSpecification spec : specs.values()) {
      LOG.info("-> Specification: "+spec.getName());
    }
    LOG.info("==============> End specifying Component Set");
    if (specs.size() > 0) {
      uclassloader = null;
      componentManager.startComponents(new ArrayList<ComponentSpecification>(specs.values()));
    } else if (locations.size() > 0) {
      StringBuilder sb = new StringBuilder();
      sb.append("No Components found in classpath:");
      for (URL u : uclassloader.getURLs()) {
        sb.append("\n    ").append(u.toString());
      }
      sb
          .append("\n so no components were loaded.\nThis is almost certainly bad!\n");
      LOG.error(sb.toString());
    } else {
      LOG.error("Load operation should have specified some Components / locations but did not.");
    }
    uclassloader = null;
  }

}
