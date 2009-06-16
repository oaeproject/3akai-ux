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

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

/**
 * Bean to represent indexed portions of a Site.
 */
@Entity
@Table(name = "site")
@NamedQueries(value = {
    @NamedQuery(name = SiteIndexBean.Queries.FINDBY_ID, query = "select s from SiteIndexBean s where s.id = :"
        + SiteIndexBean.QueryParams.FINDBY_ID_ID),
    @NamedQuery(name = SiteIndexBean.Queries.COUNTBY_ID, query = "select count(s) from SiteIndexBean s where s.id = :"
        + SiteIndexBean.QueryParams.COUNTBY_ID_ID),
    @NamedQuery(name = SiteIndexBean.Queries.SORTBY_NAME, query = "select s from SiteIndexBean s order by s.name") })
public class SiteIndexBean {
  public static interface Queries {
    String FINDBY_ID = "Site.FindById";
    String COUNTBY_ID = "Site.CountById";
    String SORTBY_NAME = "Site.SortByName";
  }

  public static interface QueryParams {
    String FINDBY_ID_ID = "id";
    String COUNTBY_ID_ID = "id";
  }

  private String id;
  private String name;
  private String ref;

  @Id
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  /**
   * The path to where the site is stored.
   * @return
   */
  public String getRef() {
    return ref;
  }

  /**
   * The path to where the site is stored 
   * @param ref
   */
  public void setRef(String ref) {
    this.ref = ref;
  }
}
