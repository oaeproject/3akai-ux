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

package org.sakaiproject.kernel1;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Map.Entry;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.jar.JarInputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.component.cover.ComponentManager;
import org.sakaiproject.componentsample.api.HelloWorldService;
import org.sakaiproject.componentsample.core.HelloWorldServiceImpl;
import org.sakaiproject.componentsample.core.InternalDateServiceImpl;
import org.sakaiproject.kernel.api.Artifact;
import org.sakaiproject.kernel.api.ArtifactResolverService;
import org.sakaiproject.kernel.api.ComponentActivator;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ServiceManagerException;
import org.sakaiproject.kernel.api.ServiceSpec;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.component.core.Maven2ArtifactResolver;
import org.sakaiproject.kernel.component.model.DependencyImpl;
import org.sakaiproject.kernel.util.FileUtil;
import org.sakaiproject.kernel.util.ResourceLoader;
import org.sakaiproject.kernel.util.StringUtils;

import javax.jcr.Repository;

/**
 * This class brings the component up and down on demand
 */
public class Activator implements ComponentActivator {

  private static final String K1_COMPONENT_LOCATION = "k1.component.location";
  public static final String K1_PROPERTIES = "res://k1.properties";
  private static final Log LOG = LogFactory.getLog(Activator.class);
  /**
   * We might need to know which kernel this activator is attached to, its
   * possible to have more than one in a JVM
   */
  private Kernel kernel;

  private Properties properties = new Properties();

  private List<String> ifcClassNames = new ArrayList<String>();

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.ComponentActivator#activate(org.sakaiproject.kernel.api.Kernel)
   */
  public void activate(Kernel kernel) throws ComponentActivatorException {

    this.kernel = kernel;
    // here I want to create my services and register them
    // I could use Guice or Spring to do this, but I am going to do manual IoC
    // to keep it really simple
    InternalDateServiceImpl internalDateService = new InternalDateServiceImpl();
    HelloWorldService helloWorldService = new HelloWorldServiceImpl(
        internalDateService);

    org.sakaiproject.component.api.ComponentManager cm = null;

    long start = System.currentTimeMillis();
    try {
      LOG.info("START---------------------- Loading kernel 1");
      cm = ComponentManager.getInstance();
    } catch (Throwable t) {
      LOG.error("Failed to Startup ", t);
    }
    LOG.info("END------------------------ Loaded kernel 1 in  "
        + (System.currentTimeMillis() - start) + "ms");

    Properties localProperties = new Properties();
    try {
      InputStream is = ResourceLoader.openResource(K1_PROPERTIES, this
          .getClass().getClassLoader());
      localProperties.load(is);
    } catch (IOException e2) {
      // TODO Auto-generated catch block
      e2.printStackTrace();
    }

    /**
     * plagerized from k2 bootstrap module **
     */

    for (Entry<Object, Object> o : localProperties.entrySet()) {
      String k = o.getKey().toString();

      if (k.startsWith("+")) {
        String p = properties.getProperty(k.substring(1));
        if (p != null) {
          properties.put(k.substring(1), p + o.getValue());
        } else {
          properties.put(o.getKey(), o.getValue());
        }
      } else {
        properties.put(o.getKey(), o.getValue());
      }
    }
    LOG.info("Loaded " + localProperties.size() + " properties from "
        + K1_PROPERTIES);

    /**
     * plagerized from the ComponentLoaderService
     */

    ArtifactResolverService artifactResolverService = new Maven2ArtifactResolver();

    List<URL> locations = new ArrayList<URL>();
    String[] locs = StringUtils.split(properties
        .getProperty(K1_COMPONENT_LOCATION), ';');
    if (locs != null) {
      for (String location : locs) {
        location = location.trim();
        if (location.startsWith("maven-repo")) {
          Artifact dep = DependencyImpl.fromString(location);
          URL u = null;
          try {
            u = artifactResolverService.resolve(null, dep);
          } catch (ComponentSpecificationException e) {
            LOG.error("Can't resolve " + K1_COMPONENT_LOCATION
                + " property in file " + K1_PROPERTIES);
            e.printStackTrace();
          }
          LOG.info("added k1 api bundle:" + u);
          locations.add(u);
        } else if (location.endsWith(".jar")) {
          if (location.indexOf("://") < 0) {
            File f = new File(location);
            if (!f.exists()) {
              LOG.warn("Jar file " + f.getAbsolutePath()
                  + " does not exist, will be ignored ");
            } else {
              try {
                location = "file://" + f.getCanonicalPath();
                locations.add(new URL(location));
                LOG.info("added k1 api bundle:" + location);
              } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
              }
            }
          } else {
            LOG.info("added api bundle:" + location);
            try {
              locations.add(new URL(location));
            } catch (MalformedURLException e) {
              // TODO Auto-generated catch block
              e.printStackTrace();
            }
          }
        } else {
          LOG.info("Locating api bundle in " + location);
          for (File f : FileUtil.findAll(location, ".jar")) {
            String path = null;
            try {
              path = f.getCanonicalPath();
            } catch (IOException e) {
              // TODO Auto-generated catch block
              e.printStackTrace();
            }
            if (path.indexOf("://") < 0) {
              path = "file://" + path;
            }
            LOG.info("    added api bundle:" + path);
            try {
              locations.add(new URL(path));
            } catch (MalformedURLException e) {
              // TODO Auto-generated catch block
              e.printStackTrace();
            }
          }
        }
      }
    }
    LOG.info("    bundle contains " + locations.size() + " uri's");

    // find all the instances
    URLClassLoader uclassloader = new URLClassLoader(locations
        .toArray(new URL[0]), null);

    /**
     * end plagerism.... for now
     */
    JarFile jar = null;
    for (URL url : locations) {
      try {
        jar = new JarFile(new File(url.toURI()));

        Enumeration<JarEntry> entries = jar.entries();

        for (; entries.hasMoreElements();) {
          JarEntry entry = entries.nextElement();
          if (entry != null && entry.getName().endsWith(".class")) {
            ifcClassNames.add(entry.getName().replaceAll("/", "."));
          }
        }

        jar.close();
      } catch (FileNotFoundException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      } catch (IOException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      } catch (URISyntaxException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
    }

    // thats it. my service is ready to go, so lets register it
    // get the service manager
    ServiceManager serviceManager = kernel.getServiceManager();

    List<Class> ifcClasses = new ArrayList<Class>();
    String className = null;
    for (Iterator<String> i = ifcClassNames.iterator(); i.hasNext();) {
      try {
        className = i.next();
        ifcClasses.add(Class.forName(className));
      } catch (ClassNotFoundException e) {
        LOG.error("Can't find '" + className + "' in the classpath");
        i.remove(); // / with a sharp stick
        e.printStackTrace();
      }
    }

    for (Class clazz : ifcClasses) {
      ServiceSpec serviceSpec = new ServiceSpec(clazz);

      // register the service
      try {
        serviceManager.registerService(serviceSpec, cm.get(clazz));
      } catch (ServiceManagerException e) {
        // oops something happened, re-throw as an activation issue
        throw new ComponentActivatorException("Failed to register service ", e);
      }

    }

    // just for fun.. resolve the JCRService and get a reference to the
    // respository.
    LOG.info("Getting JCR =============================");
    JCRService service = serviceManager.getService(new ServiceSpec(
        JCRService.class));
    Repository repo = service.getRepository();
    for (String k : repo.getDescriptorKeys()) {
      LOG.info("  JCR Repo Key " + k + "::" + repo.getDescriptor(k));
    }
    LOG.info("Logged In OK-=============================");

    // create a ServiceSpecification for the class I want to register,
    // the class here MUST be a class that was exported (see component.xml)
    // otherwise
    // nothing else will be able to see it. The service manager might enforce
    // this if I get
    // arround to it.
    ServiceSpec serviceSpec = new ServiceSpec(HelloWorldService.class);

    // register the service
    try {
      serviceManager.registerService(serviceSpec, helloWorldService);
    } catch (ServiceManagerException e) {
      // oops something happened, re-throw as an activation issue
      throw new ComponentActivatorException("Failed to register service ", e);
    }

  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.ComponentActivator#deactivate()
   */
  public void deactivate() {
    // we need to remove the service (this is the short way of doing the above)
    kernel.getServiceManager().deregisterService(
        new ServiceSpec(HelloWorldService.class));
  }
  /*
   * jar tf
   * ~/.m2/repository/org/sakaiproject/kernel/sakai-kernel-api/1.1-SNAPSHOT
   * /sakai-kernel-api-1.1-SNAPSHOT.jar | grep '\.class$' | awk -F'\/' '{printf
   * "<export><name>";for (i=1; i<NF; i++) printf "."$i;printf
   * "</name></export>";print""}' | sort -u
   */
}
