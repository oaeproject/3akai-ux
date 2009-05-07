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
package org.sakaiproject.kernel.loader.common;

import javax.management.InstanceNotFoundException;
import javax.management.MBeanException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.ReflectionException;

import java.lang.management.ManagementFactory;

/**
 * A kernel manager manages the kernel.
 */
public class CommonObjectManager {

  /**
   * The current kernel.
   */
  private Object common;
  /**
   * A lock on the kernel to handle multiple threads getting the first item.
   */
  private Object lock = new Object();
  /**
   * The location of the object being  managed.
   */
  private String commonObjectSpec;

  /**
   * @param pCommonObjectSpec the specification for the common object being managed.
   */
  public CommonObjectManager(String pCommonObjectSpec) {
    this.commonObjectSpec = pCommonObjectSpec;
  }

  /**
   * Get the kernel, this will be a single instance for the JVM, but the method
   * will retrieve the same instance regardless of this object instance.
   *
   * @param <T> The type of the manged object.
   * @return the kernel
   * @throws CommonObjectConfigurationException
   *           if the kernel is not available.
   */
  @SuppressWarnings("unchecked")
  public <T> T getManagedObject()
      throws CommonObjectConfigurationException {
    if (common == null) {
      synchronized (lock) {
        MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
        try {
          ObjectName commonObjectName = new ObjectName(
              CommonObject.MBEAN_COMMON + "." + commonObjectSpec);
          common = mbs.invoke(commonObjectName,
              "getManagedObject", null, null);
        } catch (InstanceNotFoundException e) {
          throw new CommonObjectConfigurationException(e);
        } catch (MBeanException e) {
          throw new CommonObjectConfigurationException(e);
        } catch (ReflectionException e) {
          throw new CommonObjectConfigurationException(e);
        } catch (MalformedObjectNameException e) {
          throw new CommonObjectConfigurationException(e);
        } catch (NullPointerException e) {
          throw new CommonObjectConfigurationException(e);
        }
      }
    }

    return (T) common;
  }

  /**
   * @param listener a listener to add that will be notified of changes to common object.
   */
  public void addListener(CommonLifecycleListener listener) {
  }

  /**
   * @param listener a listener to remove.
   */
  public void removeListener(CommonLifecycleListener listener) {
  }
}
