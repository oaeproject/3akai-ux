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
package org.sakaiproject.kernel.loader.server.test;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.loader.common.CommonObject;

import java.lang.management.ManagementFactory;

import javax.management.Descriptor;
import javax.management.JMException;
import javax.management.JMRuntimeException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import javax.management.modelmbean.DescriptorSupport;
import javax.management.modelmbean.InvalidTargetObjectTypeException;
import javax.management.modelmbean.ModelMBeanAttributeInfo;
import javax.management.modelmbean.ModelMBeanInfo;
import javax.management.modelmbean.ModelMBeanInfoSupport;
import javax.management.modelmbean.ModelMBeanOperationInfo;
import javax.management.modelmbean.RequiredModelMBean;

/**
 * A container to hold the shared classloader for webapps as a bean.
 */
public class DummySharedClassLoaderContainer implements CommonObject {

  /**
   * A logger.
   */
  private static final Log LOG = LogFactory
      .getLog(DummySharedClassLoaderContainer.class);
  private ClassLoader sharedClassLoader;

  /**
   * Create a shared classloader object.
   * 
   * @param kernel
   *          the kernel to connect to.
   * @param shutdownService
   *          the shutdown service.
   * @throws JMRuntimeException
   * @throws JMException
   * @throws InvalidTargetObjectTypeException
   */
  public DummySharedClassLoaderContainer(ClassLoader classLoader) throws JMRuntimeException, JMException,
      InvalidTargetObjectTypeException {
    this.sharedClassLoader = classLoader;
    MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
    RequiredModelMBean model = new RequiredModelMBean(createMBeanInfo());
    model.setManagedResource(this, "objectReference");
    ObjectName common = new ObjectName(CommonObject.MBEAN_COMMON
        + ".sharedclassloader");
    mbs.registerMBean(model, common);
  }

  /**
   * Stop the classloader container, removing the MBean from the MBean server.
   * @see org.sakaiproject.kernel.api.RequiresStop#stop()
   */
  public void stop() {
    try {
      MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
      ObjectName common = new ObjectName(CommonObject.MBEAN_COMMON
          + ".sharedclassloader");
      mbs.unregisterMBean(common);
      LOG.info("Shared Classloader Container stopped Ok");
    } catch (JMException e) {
      LOG
          .info(
              "Cant stop the shared classloader bean, this will cause problems if the kernel is restarted in this jvm "
                  + e.getMessage(), e);
    }
  }

  /**
   * Create the the MBean Info for the Shared ClassLoader so that the methods
   * and properties are accessible via JMX.
   * 
   * @return a new MBeanInfo structure
   */
  private ModelMBeanInfo createMBeanInfo() {
    Descriptor sharedClassLoader = new DescriptorSupport(new String[] {
        "name=SharedClassLoader", "descriptorType=attribute", "default=null",
        "displayName=Shared Class Loader", "getMethod=getManagedObject" });

    ModelMBeanAttributeInfo[] mmbai = new ModelMBeanAttributeInfo[1];
    mmbai[0] = new ModelMBeanAttributeInfo("SharedClassLoader",
        ClassLoader.class.getName(), "Shared Class Loader", true, false, false,
        sharedClassLoader);

    ModelMBeanOperationInfo[] mmboi = new ModelMBeanOperationInfo[1];

    mmboi[0] = new ModelMBeanOperationInfo("getManagedObject",
        "Get the Shared Class Loader", null, ClassLoader.class.getName(),
        ModelMBeanOperationInfo.INFO);

    return new ModelMBeanInfoSupport(this.getClass().getName(),
        "Sakai Shared Classloader", mmbai, null, mmboi, null);
  }

  /**
   * Get the shared classloader..
   * @see org.sakaiproject.kernel.loader.common.CommonObject#getManagedObject()
   */
  @SuppressWarnings("unchecked")
  public <T> T getManagedObject() {
    return (T) sharedClassLoader;
  }

}
