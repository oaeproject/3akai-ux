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

import org.apache.catalina.Engine;
import org.apache.catalina.Lifecycle;
import org.apache.catalina.LifecycleEvent;
import org.apache.catalina.LifecycleListener;
import org.apache.catalina.Server;
import org.apache.catalina.ServerFactory;
import org.apache.catalina.Service;
import org.apache.catalina.core.StandardService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.loader.common.CommonLifecycle;
import org.sakaiproject.kernel.loader.server.LoaderEnvironment;

import javax.management.ObjectName;

/**
 * This is a loader for Tomcat5 that is deployed as a Lifecycle listener inside tomcat. This needs
 * to be deployed into Server as its loaded from server. <Listener
 * className="org.sakaiproject.kernel.loader.server.tomcat5.KernelLoader"/>
 *
 *
 */
public class KernelLoader implements LifecycleListener {

  /**
   * the standard Logger.
   */
  private static final Log LOG = LogFactory.getLog(KernelLoader.class);
  private static final boolean debug = LOG.isDebugEnabled();

  /**
   * The name of the container Mbean where the shared classloader comes from.
   */
  private static final String MBEAN_CONTAINER = "Catalina:type=Host,host=localhost";

  /**
   * The kernel lifecycle that implements a common lifecycle API.
   */
  private CommonLifecycle<?> kernelLifecycle;

  /**
   * The classloade to use to load the kernel, in tomcat 5 this is the shared classloader.
   */
  private ClassLoader sharedClassloader;

  /**
   * The parent tomcat Engine that represents this tomcat instance.
   */
  private Engine engine;

  /**
   * {@inheritDoc} Loads the kernel when the Container start event is emitted.
   *
   * @param event the lifecycle event from tomcat.
   */
  public void lifecycleEvent(final LifecycleEvent event) {
    try {
      String type = event.getType();
      LOG.debug("At " + type);
      if (Lifecycle.INIT_EVENT.equals(type)) {
	if (debug)
	  LOG.debug("INIT");
      } else if (Lifecycle.BEFORE_START_EVENT.equals(type)) {
	if (debug)
          LOG.debug("Before Start");
        start();
      } else if (Lifecycle.START_EVENT.equals(type)) {
	if (debug)
          LOG.debug("Start");
      } else if (Lifecycle.AFTER_START_EVENT.equals(type)) {
	if (debug)
          LOG.debug("After Start");
      } else if (Lifecycle.PERIODIC_EVENT.equals(type)) {
	if (debug)
          LOG.debug("Periodic");
      } else if (Lifecycle.BEFORE_STOP_EVENT.equals(type)) {
	if (debug)
          LOG.debug("Before Stop");
      } else if (Lifecycle.STOP_EVENT.equals(type)) {
	if (debug)
          LOG.debug("Stop");
      } else if (Lifecycle.AFTER_STOP_EVENT.equals(type)) {
	if (debug)
          LOG.debug("After Stop");
        stop();
      } else if (Lifecycle.DESTROY_EVENT.equals(type)) {
	if (debug)
          LOG.debug("Destroy ");
      } else {
        LOG.warn("Unrecognised Container Lifecycle Event ");
      }
    } catch (Exception ex) {
      LOG.error("Failed to start Component Context ", ex);
    }
  }

  /**
   * Perform the start operation, by constructing the shared classloader and then instancing the
   * kernel lifecycle in that classloader and starting the kernel.
   *
   * @throws Exception if there is a problem with the start operation
   */
  private void start() throws Exception {
    ObjectName pname = new ObjectName(MBEAN_CONTAINER);
    Service service = getService(pname);
    LOG.info("Got service as " + service);
    engine = (Engine) service.getContainer();
    LOG.info("Got engine as " + engine + " with classloader " + engine.getClass().getClassLoader()
        + " and with parent classloader " + engine.getParentClassLoader());
    sharedClassloader = engine.getParentClassLoader();
    ClassLoader oldClassLoader = Thread.currentThread().getContextClassLoader();
    Thread.currentThread().setContextClassLoader(sharedClassloader);
    try {
      Class<CommonLifecycle<?>> clazz = LoaderEnvironment.getLifecyleClass(sharedClassloader);
      kernelLifecycle = clazz.newInstance();
      LOG.info("Starting Component Lifecyle " + clazz.getName());
      kernelLifecycle.start();

    } finally {
      Thread.currentThread().setContextClassLoader(oldClassLoader);
    }
  }

  /**
   * Stop the configured kernel manager.
   *
   * @throws Exception if the kernel component cant be stopped
   */
  private void stop() throws Exception {
    LOG.info("Stopping Component Manger");
    ClassLoader oldClassLoader = Thread.currentThread().getContextClassLoader();
    Thread.currentThread().setContextClassLoader(sharedClassloader);
    try {
      kernelLifecycle.stop();
    } finally {
      Thread.currentThread().setContextClassLoader(oldClassLoader);
    }
  }

  /**
   * Get hold of the parent service.
   *
   * @param oname the name of the service
   * @return the service
   * @throws Exception if there was a problem locating the service.
   */
  private Service getService(final ObjectName oname) throws Exception {

    String domain = oname.getDomain();
    Server server = ServerFactory.getServer();
    Service[] services = server.findServices();
    StandardService service = null;
    for (int i = 0; i < services.length; i++) {
      service = (StandardService) services[i];
      if (domain.equals(service.getObjectName().getDomain())) {
        break;
      }
    }
    if (!service.getObjectName().getDomain().equals(domain)) {
      throw new Exception("Service with the domain is not found");
    }
    return service;

  }

}
