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
package org.sakaiproject.kernel.component;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Artifact;
import org.sakaiproject.kernel.api.ClassLoaderService;
import org.sakaiproject.kernel.api.ComponentActivator;
import org.sakaiproject.kernel.api.ComponentManager;
import org.sakaiproject.kernel.api.ComponentSpecification;
import org.sakaiproject.kernel.api.ComponentSpecificationException;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelConfigurationException;
import org.sakaiproject.kernel.api.ServiceSpec;
import org.sakaiproject.kernel.util.ResourceLoader;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;

/**
 *
 */
public class ComponentManagerImpl implements ComponentManager {

  /**
   * The logger
   */
  private static final Log LOG = LogFactory.getLog(ComponentManagerImpl.class);
  /**
   * Properties for the kernel, contains a list of default components to load.
   */
  private static final String DEFAULT_COMPONENTS_PROPERTIES = "res://kernel.properties";

  /**
   * The name of the property containing the ; separated list of components to
   * load. If the component starts with class: its a class implementing
   * ComponentSpecification in the current classloader, if something else, then
   * its a resolvable URI.
   */
  private static final String DEFAULT_COMPONENTS = "components";
  /**
   * The kernel that this component manager services.
   */
  private Kernel kernel;
  /**
   * A map of components that have been started, indexed by spec.
   */
  private Map<ComponentSpecification, ComponentActivator> components = new ConcurrentHashMap<ComponentSpecification, ComponentActivator>();
  /**
   * A map of known components indexed by name
   */
  private Map<String, ComponentSpecification> componentsByName = new ConcurrentHashMap<String, ComponentSpecification>();
  /**
   * A map of started components indexed by name
   */
  private Map<String, ComponentSpecification> startedComponents = new ConcurrentHashMap<String, ComponentSpecification>();
  private Map<ComponentSpecification, ClassLoader> classloaders = new ConcurrentHashMap<ComponentSpecification, ClassLoader>();

  /**
   * create the component manager with a reference to the kernel.
   *
   * @param kernel
   *          the kernel.
   */
  public ComponentManagerImpl(KernelImpl kernel) {
    this.kernel = kernel;
    kernel.setComponentManager(this);
  }

  /**
   * Start the component manager.
   *
   * @throws KernelConfigurationException
   *           if there is a problem starting the component manager.
   *
   */
  public void start() throws KernelConfigurationException {
    LOG.info("==============> K2 system starting up!");
    LOG.info("==============> Starting Component Manager");
    startDefaultComponents();
  }

  /**
   * Stop the component manager and all the components.
   */
  public void stop() {
    LOG.info("Starting ComponentManager Shutdown");
    stopComponents();
    LOG.info("ComponentManager Shutdown Complete");
  }

  public boolean prepareStartComponent(ComponentSpecification spec)
      throws ComponentSpecificationException {
    if (classloaders.containsKey(spec)) {
      return true;
    }

    ClassLoader componentClassloader = Thread.currentThread()
        .getContextClassLoader();

    ClassLoaderService classLoaderService = kernel.getServiceManager()
        .getService(new ServiceSpec(ClassLoaderService.class));
    if (classLoaderService != null) {
      componentClassloader = classLoaderService.getComponentClassLoader(spec);
    }

    classloaders.put(spec, componentClassloader);

    for (Artifact dependant : spec.getComponentDependencies()) {
      if (!dependant.isManaged()) {
        prepareStartComponent(componentsByName.get(dependant.toString()));
      }
    }

    // scan for persistent classes

    return true;
  }

  /**
   * Start a component based on the specification. This will create a
   * classloader for the component, if required, then start all dependent
   * components and then start he component requested.
   *
   * @param spec
   *          the specification of a component to be started.
   * @return true of the component started.
   * @throws ComponentSpecificationException
   * @see org.sakaiproject.kernel.api.ComponentManager#startComponent(org.sakaiproject
   *      .kernel.api.ComponentSpecification)
   */
  @SuppressWarnings("unchecked")
  public boolean startComponent(ComponentSpecification spec)
      throws KernelConfigurationException, ComponentSpecificationException {

    if (components.containsKey(spec)) {
      return true;
    }

    LOG.info("==============> Starting Component " + spec.getName());
    ClassLoader componentClassloader = classloaders.get(spec);
    ClassLoader currentClassloader = Thread.currentThread()
        .getContextClassLoader();
    Thread.currentThread().setContextClassLoader(componentClassloader);

    try {

      for (Artifact dependant : spec.getComponentDependencies()) {
        if (!dependant.isManaged()) {
          startComponent(componentsByName.get(dependant.toString()));
        }
      }

      LOG.info("Activating component: " + spec.getName() + " with class: "
          + spec.getComponentActivatorClassName());
      Class<ComponentActivator> clazz = null;
      try {
        clazz = (Class<ComponentActivator>) componentClassloader.loadClass(spec
            .getComponentActivatorClassName());
      } catch (ClassNotFoundException e) {
        throw new ComponentSpecificationException(
            "Unable to find activator class "
                + spec.getComponentActivatorClassName() + " using "
                + componentClassloader, e);
      }

      ComponentActivator activator = null;
      try {
        activator = clazz.newInstance();
      } catch (ClassCastException e) {
        throw new ComponentSpecificationException("The Activator class "
            + spec.getComponentActivatorClassName() + " loaded using "
            + componentClassloader
            + " does not implement the ComponentActivator interface ", e);
      }

      activator.activate(kernel);

      components.put(spec, activator);
      startedComponents.put(spec.getName(), spec);
      LOG.info("==============> Component " + spec.getName() + " start successful");
      return true;
    } catch (RuntimeException e) {
      LOG.error("=============> Component " + spec.getName() + " start failed");
      throw new KernelConfigurationException("Unable to start component "
          + spec + " cause:" + e.getMessage(), e);
    } catch (Exception e) {
      LOG.error("=============> Component start failed for: " + spec.getName());
      throw new KernelConfigurationException("Unable to start component "
          + spec + " cause:" + e.getMessage(), e);
    } finally {
      Thread.currentThread().setContextClassLoader(currentClassloader);
    }
  }

  /**
   * Start a default set of components, how the default set is specified is an
   * implementation detail.
   *
   * @return true if the default set start was sucessfull.
   * @throws KernelConfigurationException
   */
  @SuppressWarnings("unchecked")
  protected boolean startDefaultComponents()
      throws KernelConfigurationException {
    try {
      // load a list of components urls from a properties file.
      Properties p = new Properties();
      InputStream in = ResourceLoader.openResource(
          DEFAULT_COMPONENTS_PROPERTIES, this.getClass().getClassLoader());
      try {
        if (in != null) {
          p.load(in);
          in.close();
        }
      } finally {
        if (in != null) {
          in.close();
        }
      }
      String dc = p.getProperty(DEFAULT_COMPONENTS);
      List<ComponentSpecification> toStart = new ArrayList<ComponentSpecification>();
      LOG.info("Starting " + dc);
      if (dc != null) {
        String[] defaultComponents = StringUtils.split(dc, ';');
        if (defaultComponents != null) {
          for (String d : defaultComponents) {
            d = d.trim();
            if (d.length() > 0) {
              ComponentSpecification spec = null;
              if (d.startsWith("class:")) {
                String activatorName = d.substring("class:".length());
                Class<ComponentSpecification> aclazz = (Class<ComponentSpecification>) this
                    .getClass().getClassLoader().loadClass(activatorName);
                spec = aclazz.newInstance();
              } else {
                spec = new URLComponentSpecificationImpl(null, d);
              }
              toStart.add(spec);
            }
          }
        }
      }
      startComponents(toStart);
      return true;
    } catch (Exception ex) {
      throw new KernelConfigurationException("Unable To start components "
          + ex.getMessage(), ex);
    }
  }

  /**
   * Work out the start order of all.
   *
   * @param toStart
   *          the list of components to be started
   * @return a sorted list in start order of all the components that need to be
   *         started.
   * @throws ComponentSpecificationException
   */
  public List<ComponentSpecification> getStartOrder(
      List<ComponentSpecification> toStart)
      throws ComponentSpecificationException {
    final Map<ComponentSpecification, Integer> speclevel = new HashMap<ComponentSpecification, Integer>();
    List<ComponentSpecification> errors = new ArrayList<ComponentSpecification>();
    List<ComponentSpecification> unstable = new ArrayList<ComponentSpecification>();
    // Analyse the list, pulling in additional dependencies, and assigning each
    // dependency a level.
    // Convergence will happen in at worst the size of the populated speclevel
    // list.

    unstable.add(toStart.get(0));
    speclevel.put(toStart.get(0), 0);
    for (int i = 0; i < speclevel.size() + 1 && unstable.size() > 0; i++) {
      unstable.clear();
      for (ComponentSpecification spec : toStart) {
        Integer plevel = speclevel.get(spec);
        if (plevel == null) {
          plevel = 0;
          speclevel.put(spec, plevel);
          unstable.add(spec);
        }
        for (Artifact d : spec.getComponentDependencies()) {
          ComponentSpecification cs = componentsByName.get(d.toString());
          if (cs == null && !errors.contains(spec)) {
            errors.add(spec);
          } else {
            Integer dlevel = speclevel.get(cs);
            if (dlevel == null || dlevel <= plevel) {
              dlevel = plevel + 1;
              speclevel.put(cs, dlevel);
              unstable.add(cs);
            }
          }
        }
      }
    }
    // look for instability or missing dependencies
    StringBuilder message = new StringBuilder();
    if (unstable.size() > 0) {
      message
          .append("\n\tERROR:There is a cyclic dependency between components, that must be removed\n");
      for (ComponentSpecification cs : unstable) {
        message.append("\t\tUnstable Component ").append(
            cs.getDependencyDescription()).append("\n");
      }

    }
    if (errors.size() > 0) {
      Map<String, Map<String, String>> missing = new HashMap<String, Map<String, String>>();

      for (ComponentSpecification spec : errors) {
        for (Artifact d : spec.getComponentDependencies()) {
          if (!componentsByName.containsKey(d.toString())) {
            Map<String, String> l = missing.get(d.toString());
            if (l == null) {
              l = new HashMap<String, String>();
              missing.put(d.toString(), l);
            }
            l.put(spec.getName(), spec.getName());
          }
        }
      }
      message
          .append("\n\tERROR:The component dependency graph has unsatisfield dependencies\n");

      for (Entry<String, Map<String, String>> e : missing.entrySet()) {
        message.append("\n\tMissing dependency:").append(e.getKey()).append(
            " required by:");
        for (String n : e.getValue().values()) {
          message.append("\n\t\t").append(n);
        }
      }
      message.append("\n");

    }
    if (message.length() > 0) {

      message.append("\n\tINFO:There are " + toStart.size()
          + " components in this set are \n");
      for (ComponentSpecification spec : toStart) {
        message.append("\n\t\t").append(spec.getName());
      }
      message.append("\n\tINFO: " + startedComponents.size()
          + " Components that have been started \n");
      for (ComponentSpecification spec : startedComponents.values()) {
        message.append("\n\t\t").append(spec.getName());
      }

      throw new ComponentSpecificationException(
          "Unable to start the component tree due to the following errors "
              + message.toString());
    }
    // we now have a level sorted list, extract the levels in order leaving out
    // the components that are already started
    List<ComponentSpecification> notStarted = new ArrayList<ComponentSpecification>();
    for (ComponentSpecification spec : toStart) {
      if (!startedComponents.containsValue(spec)) {
        notStarted.add(spec);
      }
    }
    // sort according to the level
    Collections.sort(notStarted, new Comparator<ComponentSpecification>() {

      public int compare(ComponentSpecification o1, ComponentSpecification o2) {
        return speclevel.get(o2) - speclevel.get(o1);
      }

    });

    LOG.info("Components start order decided: " + notStarted.size()
        + " component(s) to start");
    for (ComponentSpecification spec : notStarted) {
      LOG.info("Component: " + spec.getName() + " will start at level " + speclevel.get(spec));
    }
    LOG.info("==============> Component Start Order End");

    return notStarted;

  }

  /**
   * Stop all components.
   *
   * @return
   */
  protected boolean stopComponents() {
    for (ComponentSpecification spec : components.keySet()) {
      stopComponent(spec);
    }
    components.clear();
    startedComponents.clear();
    return true;
  }

  /**
   * Stop a component.
   *
   * @param spec
   *          the specification of the component to stop.
   * @return true if the component was successfully stopped.
   * @see org.sakaiproject.kernel.api.ComponentManager#stopComponent(org.sakaiproject
   *      .kernel.api.ComponentSpecification)
   */
  public boolean stopComponent(ComponentSpecification spec) {
    for (Artifact dependant : spec.getComponentDependencies()) {
      if (dependant.isManaged()) {
        stopComponent(startedComponents.get(dependant.toString()));
      }
    }
    ComponentActivator activator = components.get(spec);
    if (activator != null) {
      activator.deactivate();
    }
    components.remove(spec);
    startedComponents.remove(spec.getName());
    return false;
  }

  /**
   * @return a list of components that have been started.
   * @see org.sakaiproject.kernel.api.ComponentManager#getComponents()
   */
  public ComponentSpecification[] getStartedComponents() {
    return components.keySet().toArray(new ComponentSpecification[0]);
  }

  /**
   * @return a list of components that have been loaded.
   * @see org.sakaiproject.kernel.api.ComponentManager#getComponents()
   */
  public ComponentSpecification[] getLoadedComponents() {
    return componentsByName.values().toArray(new ComponentSpecification[0]);
  }

  /**
   * Load components ready for starting
   *
   * @param cs
   *          a list of component specifications to load
   */
  public void loadComponents(List<ComponentSpecification> cs) {
    for (ComponentSpecification spec : cs) {
      if (componentsByName.containsKey(spec.getName())) {
        if (components.containsKey(spec)) {
          LOG.warn("Component " + spec.getName()
              + " is already started, and cant be re-loaded ");
        } else {
          LOG.warn("Component " + spec.getName()
              + "is already loaded, and cant be re-loaded ");
        }
      } else {
        componentsByName.put(spec.getName(), spec);
      }
    }

  }

  /**
   * {@inheritDoc}
   *
   * @throws KernelConfigurationException
   * @throws ComponentSpecificationException
   * @see org.sakaiproject.kernel.api.ComponentManager#startComponents(java.util.List)
   */
  public void startComponents(List<ComponentSpecification> specs)
      throws ComponentSpecificationException, KernelConfigurationException {
    loadComponents(specs);
    List<ComponentSpecification> sortedSpecs = getStartOrder(specs);
    for (ComponentSpecification spec : sortedSpecs) {
      prepareStartComponent(spec);
    }
    for (ComponentSpecification spec : sortedSpecs) {
      startComponent(spec);
    }
  }
}
