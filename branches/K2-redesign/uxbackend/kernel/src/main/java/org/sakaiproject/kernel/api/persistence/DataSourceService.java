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

package org.sakaiproject.kernel.api.persistence;

import javax.sql.DataSource;

/**
 * Service to provide data sources.
 */
public interface DataSourceService {

  /**
   * Standard JPA JTA DataSource name.
   */
  public static final String JTA_DATASOURCE = "javax.persistence.jtaDataSource";

  /**
   * Standard JPA non-JTA DataSource name.
   */
  public static final String NON_JTA_DATASOURCE = "javax.persistence.nonJtaDataSource";

  /**
   * @return
   */
  DataSource getDataSource();

  /**
   * @return
   */
  String getType();
}
