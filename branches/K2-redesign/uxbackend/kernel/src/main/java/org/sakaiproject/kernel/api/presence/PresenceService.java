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
package org.sakaiproject.kernel.api.presence;

import java.util.List;
import java.util.Map;

/**
 * Manages the presence of a user, and allows users to see who amongst their connections are online.
 */
public interface PresenceService {


  /**
   * keep presence for this user alive.
   * @param uuid the user id.
   * @param location the location from which the user is pinging.
   */
  void ping(String uuid, String location);

  /**
   * Update the presence status of the user.
   * @param presence the presence status
   */
  /**
   * Update the presence status of the user.
   * @param uuid the user id of the user.
   * @param status the presence status
   */
  void setStatus(String uuid, String status);
  
  /**
   * Update the chat status of the user.
   * @param uuid the user id of the user.
   * @param status the presence status
   */
  void setChatStatus(String userId, String status);

  /**
   * @param uuid the user id.
   * @return the status for the user.
   */
  String getStatus(String uuid);

  /**
   * @param connections a list of connections.
   * @return a map of userid to online status.
   */
  Map<String, String> online(List<String> connections);
  /**
   * @param location the location where the users might be online.
   * @return a map of userid to online status.
   */
  Map<String, String> online(String location);

}
