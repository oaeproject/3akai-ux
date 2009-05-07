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

import com.google.inject.Inject;

import org.apache.commons.lang.StringUtils;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

/**
 *
 */
@Entity
@Table(name = "group_membership")
@NamedQueries(value = { @NamedQuery(name = GroupMembershipBean.FINDBY_USER, query = "select g from GroupMembershipBean g where g.userId = :userId") })
public class GroupMembershipBean {
  public static final String FINDBY_USER = "GroupMembership.FindByUser";
  public static final String USER_PARAM = "userId";

  @SuppressWarnings("unused")
  @Id
  @GeneratedValue(strategy = IDENTITY)
  @Column(name = "oid")
  private long objectId;

  @Column(name = "groupId")
  private String groupId;

  @Column(name = "userId")
  private String userId;

  @Column(name = "roleId")
  private String roleId;

  @Inject
  public GroupMembershipBean() {
  }

  public GroupMembershipBean(String userId, String subjectToken) {
    this.userId = userId;
    String[] s = StringUtils.split(subjectToken, ":", 2);
    if (s != null && s.length > 0) {
      groupId = s[0];
      if (s.length > 1) {
        roleId = s[1];
      } else {
        roleId = "";
      }
    } else {
      groupId = "";
      roleId = "";
    }
  }

  /**
   * @return the groupId
   */
  public String getGroupId() {
    return groupId;
  }

  /**
   * @return the userId
   */
  public String getUserId() {
    return userId;
  }

  /**
   * @return the role
   */
  public String getRoleId() {
    return roleId;
  }

  /**
   * @return
   */
  public String getSubjectToken() {
    return groupId + ":" + roleId;
  }
}
