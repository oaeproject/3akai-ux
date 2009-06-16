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

import org.sakaiproject.kernel.api.Provider;
import org.sakaiproject.kernel.model.SiteBean;

/**
 * Membership handlers provide custom join and unjoin capabilities.
 */
public interface MembershipHandler extends Provider<String> {

  public static final String MEMBERSHIP_HANDLER_REGISTRY = "membership.handler";

  /**
   * Add a member to the site
   *
   * @param siteBean
   *          the site to add the member to
   * @param uuid
   *          the userid of the user
   */
  void addMembership(SiteBean siteBean, String uuid);

  /**
   * Remove a member from a membership type in the site
   *
   * @param siteBean
   *          the site
   * @param uuid
   *          the users uuid
   * @param membershipType
   *          the expected membership type.
   */
  void removeMembership(SiteBean siteBean, String uuid, String membershipType);

  /**
   * Remove a set of members from a site.
   *
   * @param siteBean
   *          the site
   * @param userIds
   *          a list of user ids.
   * @param membershipType
   *          a list of corresponding membership types.
   */
  void removeMembership(SiteBean siteBean, String[] userIds, String[] membershipType);

  /**
   * Add a set of members to the site
   *
   * @param siteBean
   *          the site
   * @param userIds
   *          a list of user ids
   * @param membershipType
   *          a list of corresponding membership types.
   */
  void addMembership(SiteBean siteBean, String[] userIds, String[] membershipType);

}
