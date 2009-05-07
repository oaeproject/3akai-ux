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

package org.sakaiproject.kernel.api.site;

import org.sakaiproject.kernel.model.SiteBean;
import org.sakaiproject.kernel.util.rest.CollectionOptions;

import java.util.Map;

/**
 * Provides functionality for working with Sites.
 */
public interface SiteService {
  /**
   * Path where site information is stored in the user environment.
   */
  String PATH_SITE = "/.site";

  /**
   * Name of the group definition file.
   */
  String FILE_GROUPDEF = "groupdef.json";

  /**
   * Validates if a given path contains a site
   *
   * @param path
   * @return true if the site exists
   */
  boolean siteExists(String path);

  /**
   * Retrieves a requested site by path. If the site doesn't exist, null will be returned.
   *
   * @param path
   * @return The requested site or null if not found.
   */
  SiteBean getSite(String path);

  /**
   * Creates a Site Bean
   *
   * @param sitePath
   * @param siteType
   * @return the SiteBean ready for modification, and saving.
   * @throws SiteException
   */
  SiteBean createSite(String sitePath, String siteType) throws SiteException;

  /**
   * Deletes a site, at a given path, leaving all the content as is.
   *
   * @param path
   */
  void deleteSite(String path);

  /**
   * Get the location of a site template
   *
   * @param siteType
   *          the type of site
   * @return the location of a site template.
   */
  String getSiteTemplate(String siteType);

  /**
   * Save a site Bean, this needs to be here to keep the interface complete, but please
   * use siteBean.save() in preference to this method.
   *
   * @param site
   * @throws SiteException if the save fails.
   */
  void save(SiteBean site) throws SiteException;

  /**
   * get a site bean using the Id
   * @param string
   * @return
   */
  SiteBean getSiteById(String string);

  /**
   * get a list of members, indexed by uuid, and presented in an order (probably using a LinkedHashMap). The object is a map of properties for each membership record.
   * @param path the path of the site.
   * @param collectionOptions the options for paging, sorting and filtering.
   * @return a map of members meta data.
   */
  Map<String, Object> getMemberList(String path, CollectionOptions collectionOptions);

  /**
   * @param groupDefFile
   * @return
   */
  String locateSite(String groupDefFile);
}
