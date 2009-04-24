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

import org.sakaiproject.kernel.api.authz.SubjectStatement;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

/**
 * Index bean for create.
 */
@Entity
@Table(name = "aclIndex")
@NamedQueries(value = {
    @NamedQuery(name = AclIndexBean.Queries.FINDBY_KEY, query = "select a from AclIndexBean a where a.key = :"
        + AclIndexBean.QueryParams.FINDBY_KEY_KEY),
    @NamedQuery(name = AclIndexBean.Queries.FINDBY_SUBJECTTYPE, query = "select a from AclIndexBean a where a.subjectType = :"
        + AclIndexBean.QueryParams.FINDBY_SUBJECTTYPE_TYPE),
    @NamedQuery(name = AclIndexBean.Queries.FINDBY_PATH, query = "select a from AclIndexBean a where a.ref = :"
        + AclIndexBean.QueryParams.FINDBY_PATH_PATH)})
public class AclIndexBean {
  public static interface Queries {
    String FINDBY_KEY = "Acl.FindByKey";
    String FINDBY_SUBJECTTYPE = "Acl.FindBySubjectType";
    String FINDBY_PATH = "Acl.FindByPath";
  }

  public static interface QueryParams {
    String FINDBY_KEY_KEY = "key";
    String FINDBY_SUBJECTTYPE_TYPE = "type";
    String FINDBY_PATH_PATH = "path";
  }

  /**
   * The key of this ACS as used for searching.
   */
  private String key;

  /**
   * The subject this ACS constrains.
   */
  private String subjectType;
  private String subjectToken;
  private String permissionToken;

  /**
   * If this ACS grants or denies access.
   */
  private boolean granted;

  /**
   * Reference to JCR path relevant to this bean.
   */
  private String ref;

  @Id
  @Column(name = "STATEMENT_KEY")
  public String getKey() {
    return key;
  }

  public void setKey(String key) {
    this.key = key;
  }

  public String getSubjectType() {
    return subjectType;
  }

  public void setSubjectType(String subjectType) {
    this.subjectType = subjectType;
  }

  public String getSubjectToken() {
    return subjectToken;
  }

  public void setSubjectToken(String subjectToken) {
    this.subjectToken = subjectToken;
  }

  public String getPermissionToken() {
    return permissionToken;
  }

  public void setPermissionToken(String permissionToken) {
    this.permissionToken = permissionToken;
  }

  public boolean isGranted() {
    return granted;
  }

  public void setGranted(boolean granted) {
    this.granted = granted;
  }

  public String getRef() {
    return ref;
  }

  public void setRef(String ref) {
    this.ref = ref;
  }

  public void setSubject(SubjectStatement subject) {
    setSubjectToken(subject.getSubjectToken());
    setSubjectType(subject.getSubjectType().toString());
    setPermissionToken(subject.getPermissionToken());
  }
}
