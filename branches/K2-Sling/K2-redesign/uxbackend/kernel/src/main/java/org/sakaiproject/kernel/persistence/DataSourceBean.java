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

package org.sakaiproject.kernel.persistence;

import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.persistence.DataSourceService;

import javax.sql.DataSource;

/**
 * <p>
 * Bean to access the data source defined in Kernel. This class does not
 * directly use any dependency injection frameworks so that the data source is
 * agnostically available to users outside of Kernel since the data source is
 * created in Kernel using Guice. This class was created with the intention of
 * making the data source available to Spring.
 * </p>
 * <p>
 * A Spring bean definition would like:<br/>
 * <code>
 * <bean id="javax.sql.DataSource"
 *       class="org.sakaiproject.kernel.persistence.DataSourceBean"
 *       init-method="init"
 *       factory-method="getDataSource" />
 * </code>
 * </p>
 */
public class DataSourceBean {
  private KernelManager kernelManager;
  private Kernel kernel;

  /**
   * Initialize resources.
   */
  public void init() {
    kernelManager = new KernelManager();
    kernel = kernelManager.getKernel();
  }

  /**
   * Get the data source from kernel.
   */
  public DataSource getDataSource() {
    return kernel.getService(DataSourceService.class).getDataSource();
  }

}
