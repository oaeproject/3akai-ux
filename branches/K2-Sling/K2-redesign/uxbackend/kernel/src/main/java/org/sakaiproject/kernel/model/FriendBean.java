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

package org.sakaiproject.kernel.model;

import com.google.common.collect.Maps;

import java.util.HashMap;
import java.util.Map;

/**
 *
 */
public class FriendBean {
  private String friendUuid;
  private String personUuid;
  private long lastUpdate;
  private FriendStatus status ;
  private transient Map<String, Object> profile;
  private Map<String,String> properties;

  /**
   *
   */
  public FriendBean() {
    this.lastUpdate = System.currentTimeMillis();
    this.status = FriendStatus.INVITED;
    this.properties = Maps.newHashMap();
    this.profile = Maps.newHashMap();
  }
  /**
   * @param friendStatus
   *
   */
  public FriendBean(String personUuid, String friendUuid, FriendStatus friendStatus) {
    this.personUuid = personUuid;
    this.friendUuid = friendUuid;
    this.lastUpdate = System.currentTimeMillis();
    this.status = friendStatus;
    this.properties = Maps.newHashMap();
    this.profile = Maps.newHashMap();
  }

  /**
   * @return the friendUuid
   */
  public String getFriendUuid() {
    return friendUuid;
  }
  /**
   * @param friendUuid the friendUuid to set
   */
  public void setFriendUuid(String friendUuid) {
    this.friendUuid = friendUuid;
  }
  /**
   * @return the personUuid
   */
  public String getPersonUuid() {
    return personUuid;
  }
  /**
   * @param personUuid the personUuid to set
   */
  public void setPersonUuid(String personUuid) {
    this.personUuid = personUuid;
  }
  /**
   * @return the lastUpdate
   */
  public long getLastUpdate() {
    return lastUpdate;
  }
  /**
   * @param lastUpdate the lastUpdate to set
   */
  public void setLastUpdate(long lastUpdate) {
    this.lastUpdate = lastUpdate;
  }
  /**
   * @return the status
   */
  public String getStatus() {
    return status.toString();
  }

  /**
   * @param status the status to set
   */
  public void setStatus(String status) {
    this.status = FriendStatus.valueOf(status);
  }

  /**
   * @param properties the properties to set
   */
  public void setProperties(Map<String, String> properties) {
    this.properties = Maps.newHashMap(properties);
  }

  /**
   * @return the properties
   */
  public Map<String, String> getProperties() {
    return Maps.newHashMap(properties);
  }


  /**
   * @return
   */
  public boolean isInState(FriendStatus friendStatus) {
    return (status == friendStatus);
  }
  /**
   * @param accepted
   */
  public void updateStatus(FriendStatus newStatus) {
    lastUpdate = System.currentTimeMillis();
    status = newStatus;
  }

  /**
   * @return the profile
   */
  public Map<String, Object> getProfile() {
    return Maps.newHashMap(profile);
  }

  /**
   * @param hashMap the profile to set
   */
  public void setProfile(HashMap<String, Object> hashMap) {
    this.profile = Maps.newHashMap(hashMap);
  }
}
