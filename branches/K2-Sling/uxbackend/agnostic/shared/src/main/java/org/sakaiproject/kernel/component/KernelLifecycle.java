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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.loader.common.CommonLifecycle;
import org.sakaiproject.kernel.loader.common.CommonLifecycleEvent;
import org.sakaiproject.kernel.loader.common.CommonLifecycleListener;

import javax.management.Descriptor;
import javax.management.MBeanParameterInfo;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import javax.management.modelmbean.DescriptorSupport;
import javax.management.modelmbean.ModelMBeanAttributeInfo;
import javax.management.modelmbean.ModelMBeanInfo;
import javax.management.modelmbean.ModelMBeanInfoSupport;
import javax.management.modelmbean.ModelMBeanOperationInfo;
import javax.management.modelmbean.RequiredModelMBean;
import javax.management.openmbean.CompositeData;

import java.lang.management.ManagementFactory;
import java.util.Date;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * The KernelLifecycle manages the lifecycle of Kernel.
 */
public class KernelLifecycle implements CommonLifecycle<Kernel> {

  /**
   * Create a kernel lifecycle object.
   */
  public KernelLifecycle() {
    super();
  }

  /**
   * a Logger.
   */
  private static final Log LOG = LogFactory.getLog(KernelLifecycle.class);

  /**
   * One Meg.
   */
  private static final long ONEM = 1024 * 1024;


  /**
   * a concurrent store of listeners.
   */
  private CopyOnWriteArraySet<CommonLifecycleListener> listeners =
    new CopyOnWriteArraySet<CommonLifecycleListener>();

  /**
   * the date the kernel was last loaded.
   */
  private Date lastLoadDate;

  /**
   * how long it took to load.
   */
  private long loadTime;

  /**
   * The service manager connected to the kernel
   */
  private ServiceManagerImpl serviceManager;
  /**
   * The component manager connected to the kernel.
   */
  private ComponentManagerImpl componentManager;
  /**
   * The kernel itself.
   */
  private KernelImpl kernel;
  

  /**
   * Execute the start phase of the lifecycle, creating the MBean and registering the newly started
   * Kernel with JMX.
   *
   * @see org.sakaiproject.kernel.loader.common.CommonLifecycle#start()
   */
  public void start() {
    LOG.info("==========PHASE 1 STARTING =================");
    try {
      long start = System.currentTimeMillis();
      lifecycleEvent(CommonLifecycleEvent.BEFORE_START);
      lastLoadDate = new Date();
      
      // Start the kernel
      MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
      RequiredModelMBean model = new RequiredModelMBean(createMBeanInfo());
      model.setManagedResource(this, "objectReference");
      ObjectName kernelName = new ObjectName(Kernel.MBEAN_KERNEL);
      mbs.registerMBean(model, kernelName);
      
      
      kernel = new KernelImpl();
           
      kernel.start();

      // Start the service manager
      serviceManager = new ServiceManagerImpl(kernel);
      serviceManager.start();
      
      
      
      // Start the component manager.
      componentManager = new ComponentManagerImpl(kernel);
      componentManager.start();
      
      


      
      

      try {
        System.runFinalization();
        Runtime.getRuntime().gc();
        CompositeData permGen = null;
        try {
          permGen = (CompositeData) mbs.getAttribute(new ObjectName(
              "java.lang:type=MemoryPool,name=Perm Gen"), "Usage");
        } catch (Exception ex) {
          permGen = (CompositeData) mbs.getAttribute(new ObjectName(
              "java.lang:type=MemoryPool,name=CMS Perm Gen"), "Usage");
        }
        CompositeData tenuredGen;
        try {
          tenuredGen = (CompositeData) mbs.getAttribute(new ObjectName(
              "java.lang:type=MemoryPool,name=Tenured Gen"), "Usage");
        } catch (Exception ex) {
          tenuredGen = (CompositeData) mbs.getAttribute(new ObjectName(
              "java.lang:type=MemoryPool,name=CMS Old Gen"), "Usage");
        }
        CompositeData codeCache = (CompositeData) mbs.getAttribute(new ObjectName(
            "java.lang:type=MemoryPool,name=Code Cache"), "Usage");
        CompositeData edenSpace = null;
        try {
          edenSpace = (CompositeData) mbs.getAttribute(new ObjectName(
              "java.lang:type=MemoryPool,name=Eden Space"), "Usage");
        } catch (Exception ex) {
          edenSpace = (CompositeData) mbs.getAttribute(new ObjectName(
              "java.lang:type=MemoryPool,name=Par Eden Space"), "Usage");

        }
        CompositeData survivorSpace = null;
        try {
          survivorSpace = (CompositeData) mbs.getAttribute(new ObjectName(
              "java.lang:type=MemoryPool,name=Survivor Space"), "Usage");
        } catch (Exception ex) {
          survivorSpace = (CompositeData) mbs.getAttribute(new ObjectName(
              "java.lang:type=MemoryPool,name=Par Survivor Space"), "Usage");
        }
        long permGenUsed = Long.parseLong(String.valueOf(permGen.get("used")));
        long codeCacheUsed = Long.parseLong(String.valueOf(codeCache.get("used")));
        long edenSpaceUsed = Long.parseLong(String.valueOf(edenSpace.get("used")));
        long tenuredGenUsed = Long.parseLong(String.valueOf(tenuredGen.get("used")));
        long survivorSpaceUsed = Long.parseLong(String.valueOf(survivorSpace.get("used")));

        LOG.info("Memory Stats after startup\n" + "\tPermgen Used " + permGenUsed / (ONEM)
            + " MB\n" + "\tCode Cache Used " + codeCacheUsed / (ONEM) + " MB\n" + "\tEden Used "
            + edenSpaceUsed / (ONEM) + " MB\n" + "\tTenured Used " + tenuredGenUsed / (ONEM)
            + " MB\n" + "\tSurvivour Used " + survivorSpaceUsed / (ONEM) + " MB");
      } catch (RuntimeException ex2) {
        LOG.info("Startup Memory Stats Not available ",ex2);
      } catch (Exception ex2) {
        LOG.info("Startup Memory Stats Not available ",ex2);
      }
      lifecycleEvent(CommonLifecycleEvent.START);
      lifecycleEvent(CommonLifecycleEvent.AFTER_START);
      loadTime = System.currentTimeMillis() - start;

    } catch (Throwable ex) {
      LOG.error("Failed to start Component Lifecycle ", ex);
      throw new Error("Failed to start Component Lifecycle ",ex);
    }
    LOG.info("============END of LIFECYCLE STARTUP===============================");

  }

  /**
   * Create the the MBean Info for the Kernel so that the methods and properties are accessable via
   * JMX.
   *
   * @return a new MBeanInfo structure
   */
  private ModelMBeanInfo createMBeanInfo() {
    Descriptor lastLoadDateDesc = new DescriptorSupport(new String[] {"name=LastLoadDate",
        "descriptorType=attribute", "default=0", "displayName=Last Load Date",
        "getMethod=getLastLoadDate"});
    Descriptor lastLoadTimeDesc = new DescriptorSupport(new String[] {"name=LastLoadTime",
        "descriptorType=attribute", "default=0", "displayName=Last Load Time",
        "getMethod=getLoadTime" });

    ModelMBeanAttributeInfo[] mmbai = new ModelMBeanAttributeInfo[2];
    mmbai[0] = new ModelMBeanAttributeInfo("LastLoadDate", "java.util.Date", "Last Load Date",
        true, false, false, lastLoadDateDesc);

    mmbai[1] = new ModelMBeanAttributeInfo("LastLoadTime", "java.lang.Long", "Last Load Time",
        true, false, false, lastLoadTimeDesc);

    ModelMBeanOperationInfo[] mmboi = new ModelMBeanOperationInfo[7];

    mmboi[0] = new ModelMBeanOperationInfo("start", "Start the Kernel", null, "void",
        ModelMBeanOperationInfo.ACTION);
    mmboi[1] = new ModelMBeanOperationInfo("stop", "Stop the Kernel", null, "void",
        ModelMBeanOperationInfo.ACTION);
    mmboi[2] = new ModelMBeanOperationInfo("getManagedObject", "Get the Current Kernel", null,
        Kernel.class.getName(), ModelMBeanOperationInfo.INFO);

    mmboi[3] = new ModelMBeanOperationInfo("addKernelLifecycleListener",
        "Add a listener to the kernel lifecycle",
        new MBeanParameterInfo[] {new MBeanParameterInfo("Lifecycle Listener",
            CommonLifecycleListener.class.getName(), "The Lifecycle Listener to be added") },
        "void", ModelMBeanOperationInfo.ACTION);
    mmboi[4] = new ModelMBeanOperationInfo("removeKernelLifecycleListener",
        "Remove a listener to the kernel lifecycle",
        new MBeanParameterInfo[] {new MBeanParameterInfo("Lifecycle Listener",
            CommonLifecycleListener.class.getName(), "The Lifecycle Listener to be removed") },
        "void", ModelMBeanOperationInfo.ACTION);
    mmboi[5] = new ModelMBeanOperationInfo("getLastLoadDate",
        "The date the kernel was last loaded", null, "java.util.Date",
        ModelMBeanOperationInfo.INFO);
    mmboi[6] = new ModelMBeanOperationInfo("getLoadTime", "The time it took to load the kernel",
        null, "long", ModelMBeanOperationInfo.INFO);

    /*
     * mmboi[1] = new ModelMBeanOperationInfo("decPanelValue", "decrement the meter value", null,
     * "void", ModelMBeanOperationInfo.ACTION ); mmboi[2] = new
     * ModelMBeanOperationInfo("getPanelValue", "getter for PanelValue", null,"Integer",
     * ModelMBeanOperationInfo.INFO); MBeanParameterInfo [] mbpi = new MBeanParameterInfo[1];
     * mbpi[0] = new MBeanParameterInfo("inVal", "java.lang.Integer", "value to set"); mmboi[3] =
     * new ModelMBeanOperationInfo("setPanelValue", "setter for PanelValue", mbpi, "void",
     * ModelMBeanOperationInfo.ACTION); ModelMBeanConstructorInfo [] mmbci = new
     * ModelMBeanConstructorInfo[1]; mmbci[0] = new ModelMBeanConstructorInfo("ClickMeterMod",
     * "constructor for Model Bean Sample", null);
     */

    return new ModelMBeanInfoSupport(this.getClass().getName(), "Sakai Kernel", mmbai, null,
        mmboi, null);
  }

  /**
   * Stop the kernel.
   */
  public void stop() {
    LOG.info("Component Lifecyle is stopping");
    try {
      lifecycleEvent(CommonLifecycleEvent.BEFORE_STOP);
      lifecycleEvent(CommonLifecycleEvent.STOP);
      componentManager.stop();
      serviceManager.stop();
      kernel.stop();
      lifecycleEvent(CommonLifecycleEvent.AFTER_STOP);
      MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
      ObjectName kernel = new ObjectName(Kernel.MBEAN_KERNEL);
      mbs.unregisterMBean(kernel);
    } catch (Throwable ex) {
      LOG.error("Failed to stop Component Lifecycle ", ex);
    }

  }

  /**
   * Destroy the kernel.
   */
  public void destroy() {
    LOG.info("Component Lifecycle is stopping");
    try {
      lifecycleEvent(CommonLifecycleEvent.DESTROY);
      listeners.clear();
    } catch (Throwable ex) {
      LOG.error("Failed to stop Component Lifecycle ", ex);
    }

  }

  /**
   * Get the kernel. (JMX method)
   * @return the kernel object
   */
  public Kernel getManagedObject() {
    return kernel;
  }

  /**
   * Fire the lifecycle events.
   *
   * @param event the event to be sent to listeners
   */
  protected void lifecycleEvent(final CommonLifecycleEvent event) {
    for (CommonLifecycleListener l : listeners) {
      l.lifecycleEvent(event);
    }
  }

  /**
   * Add a listener to the lifecycle.
   * @param listener the listener to add
   */
  public void addKernelLifecycleListener(final CommonLifecycleListener listener) {
    if (!listeners.contains(listener)) {
      listeners.add(listener);
    }
  }

  /**
   * @param listener the listener to add to a set of lifecycle listeners.
   */
  public void removeKernelLifecycleListener(CommonLifecycleListener listener) {
    listeners.remove(listener);
  }

  /**
   * @return the date the kernel was last loaded.
   */
  public Date getLastLoadDate() {
    return new Date(lastLoadDate.getTime());
  }

  /**
   * @return the time taken to load last time.
   */
  public long getLoadTime() {
    return loadTime;
  }

}
