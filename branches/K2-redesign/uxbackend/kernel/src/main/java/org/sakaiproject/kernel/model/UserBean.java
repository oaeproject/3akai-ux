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

import org.sakaiproject.kernel.api.user.User;

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
@Table(name = "user_eid")
@NamedQueries(value = {
    @NamedQuery(name = UserBean.FINDBY_UID, query = "select u from UserBean u where u.uid = :uid"),
    @NamedQuery(name = UserBean.FINDBY_EID, query = "select u from UserBean u where u.eid = :eid") })
public class UserBean implements User {
  public static final String FINDBY_EID = "UserBean.FindByEID";
  public static final String FINDBY_UID = "UserBean.FindByUID";
  public static final String EID_PARAM = "eid";
  public static final String UID_PARAM = "uid";

  @SuppressWarnings("unused")
  @Id
  @GeneratedValue(strategy = IDENTITY)
  @Column(name = "oid")
  private long objectId;

  @Column(name = "eid")
  private String eid;

  @Column(name = "uuid")
  private String uid;

  @Inject
  public UserBean() {

  }

  /**
   *
   */
  public UserBean(String uuid, String eid) {
    this.uid = uuid;
    this.eid = eid;
  }

  /**
   *
   */
  private static final long serialVersionUID = -885757026614951115L;

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.User#getEid()
   */
  public String getEid() {
    return eid;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.User#getUuid()
   */
  public String getUuid() {
    return uid;
  }

}
