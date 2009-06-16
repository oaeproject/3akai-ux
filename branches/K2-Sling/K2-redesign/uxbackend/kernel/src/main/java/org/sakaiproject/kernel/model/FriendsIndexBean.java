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

import static javax.persistence.GenerationType.IDENTITY;

import org.sakaiproject.kernel.api.user.UserProfile;

import java.util.Map;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

/**
 * A JPA bean for the friends index.
 */
@Entity
@Table(name = "friends")
@NamedQueries(value = {
    @NamedQuery(name = FriendsIndexBean.FINDBY_FRIENDUUID, query = "select s from FriendsIndexBean s where s.friendUuid = :friendUuid"),
    @NamedQuery(name = FriendsIndexBean.FINDBY_UUID, query = "select s from FriendsIndexBean s where s.uuid = :uuid") })
public class FriendsIndexBean {

  public static final String PARAM_FRIENDUUID = "friendUuid";
  public static final String FINDBY_FRIENDUUID = "FriendsIndex.FindByFriendUuid";
  public static final String PARAM_UUID = "uuid";
  public static final String FINDBY_UUID = "SubjectPermission.FindByUuid";
  public static final String FINDBY_UUID_WITH_SORT = "select s from FriendsIndexBean s where s.uuid = :uuid ";
  public static final String FRIENDS_STATUS_FIELD = "s.friendStatus";
  public static final String PARAM_FRIENDSTATUS = "friendStatus";

  @SuppressWarnings("unused")
  @Id
  @GeneratedValue(strategy = IDENTITY)
  @Column(name = "oid")
  private long objectId;

  /**
   * The UUID of the owner of this friend connection
   */
  @Column(name = "uuid")
  private String uuid;
  /**
   * The UUID of the friend
   */
  @Column(name = "friendUuid")
  private String friendUuid;
  /**
   * The first name of the user.
   */
  @Column(name = "firstName")
  private String firstName;

  /**
   * The last name of the user.
   */
  @Column(name = "lastName")
  private String lastName;

  @Column(name = "friendStatus")
  private String friendStatus;

  @Column(name = "lastUpdate")
  private long lastUpdate;

  public FriendsIndexBean() {
  }
  /**
   *
   */
  public FriendsIndexBean(FriendBean friendBean, UserProfile userProfile) {
    copy(friendBean,userProfile);
  }

  /**
   * @return the uuid
   */
  public String getUuid() {
    return uuid;
  }

  /**
   * @return the firstName
   */
  public String getFirstName() {
    return firstName;
  }
  /**
   * @return the lastName
   */
  public String getLastName() {
    return lastName;
  }
  /**
   * @return the friendUuid
   */
  public String getFriendUuid() {
    return friendUuid;
  }

  /**
   * @return the friendStatus
   */
  public String getFriendStatus() {
    return friendStatus;
  }

  /**
   * @param friendStatus the friendStatus to set
   */
  public void setFriendStatus(String friendStatus) {
    this.friendStatus = friendStatus;
  }
  /**
   * @return
   */
  public long getLastUpdate() {
    return lastUpdate;
  }
  /**
   * @param lastUpdate2
   */
  public void setLastUpdate(long lastUpdate) {
    this.lastUpdate = lastUpdate;

  }
  /**
   * @param friendBean
   */
  public void copy(FriendBean friendBean,UserProfile userProfile) {
    Map<String,Object> p = userProfile.getProperties();
    this.firstName = String.valueOf(p.get("firstName"));
    this.lastName = String.valueOf(p.get("lastName"));
    this.friendStatus = friendBean.getStatus();
    this.friendUuid = friendBean.getFriendUuid();
    this.uuid = friendBean.getPersonUuid();
    this.lastUpdate = friendBean.getLastUpdate();
  }

}
