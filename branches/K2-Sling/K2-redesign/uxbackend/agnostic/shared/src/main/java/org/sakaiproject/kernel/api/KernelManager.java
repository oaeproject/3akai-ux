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
package org.sakaiproject.kernel.api;

import java.lang.management.ManagementFactory;

import javax.management.InstanceNotFoundException;
import javax.management.MBeanException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.ReflectionException;

/**
 * A kernel manager manages the kernel.
 */
public class KernelManager {
  /**
   * The current kernel.
   */
  private Kernel kernel;
  /**
   * A lock on the kernel to handle multiple threads getting the first item.
   */
  private Object lock = new Object();

  /**
   * Get the kernel, this will be a single instance for the JVM, but the method
   * will retrieve the same instance regardless of this object instance.
   * 
   * @return the kernel
   * @throws KernelConfigurationException
   *           if the kernel is not available.
   */
  public Kernel getKernel() throws KernelConfigurationException {
    if (kernel == null) {
      synchronized (lock) {
        MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
        try {
          ObjectName kernelName = new ObjectName(Kernel.MBEAN_KERNEL);
          kernel = (Kernel) mbs.invoke(kernelName, "getManagedObject", null,
              null);
        } catch (InstanceNotFoundException e) {
          throw new KernelConfigurationException(e);
        } catch (MBeanException e) {
          throw new KernelConfigurationException(e);
        } catch (ReflectionException e) {
          throw new KernelConfigurationException(e);
        } catch (MalformedObjectNameException e) {
          throw new KernelConfigurationException(e);
        } catch (NullPointerException e) {
          throw new KernelConfigurationException(e);
        }
      }
    }

    return kernel;
  }

  /**
   * Get a service, bound to an API, of the same type as the API
   * 
   * @param <T>
   *          the type of the service
   * @param serviceApi
   *          the class representing the service that is also used for
   *          registration.
   * @return the service or null if none is found.
   */
  public <T> T getService(Class<T> serviceApi) {
    try {
      return (T) getKernel().getService(serviceApi);
    } catch (KernelConfigurationException e) {
      e.printStackTrace();
      return null;
    }
  }

  
  /**
   * is the Kernel in unit test mode
   * @return
   */
  public static Boolean isTestMode() {
    return "true".equals(System.getProperty("kernel.testmode"));
  }

  /**
   * Sets the test mode control on the kernel
   * @return
   */
  public static void setTestMode() {
    System.setProperty("kernel.testmode","true");
  }

  /**
   * Clears the test mode control on the kernel.
   * @return
   */
  public static void clearTestMode() {
    System.clearProperty("kernel.testmode");
  }

}
