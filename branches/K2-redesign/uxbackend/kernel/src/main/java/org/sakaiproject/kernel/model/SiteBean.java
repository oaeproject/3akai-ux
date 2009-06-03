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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import edu.emory.mathcs.backport.java.util.Arrays;

import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.site.SiteException;
import org.sakaiproject.kernel.api.site.SiteService;

import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

/**
 * Bean for holding information about a Site.
 */
public class SiteBean extends GroupBean {

  private String id;
  private String status;
  private String access;
  private String type;
  private String joiningMembership;
  private String membershipHandler;
  private String language;
  private transient String sitePath;
  private transient SiteService siteService;
  private JSONObject template;

  /**
   * Get the ID of this site.
   *
   * @return
   */
  public String getId() {
    return id;
  }

  /**
   * Set the ID for this site.
   *
   * @param id
   */
  public void setId(String id) {
    this.id = id;
  }

  /**
   * Get the type of this site.
   *
   * @return
   */
  public String getType() {
    return type;
  }

  /**
   * Set the type for this site.
   *
   * @param type
   */
  public void setType(String type) {
    this.type = type;
  }
  /**
   * Get the status for this site.
   * 
   * @return
   */
  public String getStatus() {
	  return status;
  }

  /**
   * Set the status for this site.
   * @param status
   */
	public void setStatus(String status) {
		this.status = status;
	}
	/**
	 * Get the access for this site.
	 * @return
	 */
	public String getAccess() {
		return access;
	}
	
	/**
	 * Set the access for this site.
	 * @param access
	 */
	public void setAccess(String access) {
		this.access = access;
	}
	
	/**
	 * Set the language for this site.
	 * @param access
	 */
	public void setLanguage(String language) {
		this.language = language;
	}

/**
   * {@inheritDoc}
   *
   * @see java.lang.Object#toString()
   */
  @Override
  public String toString() {
    return getName() + ":" + getId() + ":" + getDescription() + ":" + getType() + ":"
        + Arrays.toString(getSubjectTokens());
  }

  /**
   * The location of the site that this bean refers to.
   * @param sitePath
   */
  public String location(String sitePath) {
    this.sitePath = sitePath;
    return sitePath;
  }

  /**
   * @param siteServiceImpl
   */
  public void service(SiteService siteService) {
    this.siteService = siteService;
  }

  /**
   * @return
   */
  public String getLocation() {
    return sitePath;
  }

  public void save() throws SiteException {
    siteService.save(this);
  }

  /**
   * @param roles
   */
  public void addRoles(String[] roles) {
    if (roles != null && roles.length > 0) {
      RoleBean[] rb = getRoles();

      // convert to a set list
      Map<String, Set<String>> permissions = Maps.newHashMap();
      for (RoleBean roleBean : rb) {
        Set<String> rolePerms = permissions.get(roleBean.getName());
        if (rolePerms == null) {
          rolePerms = Sets.newHashSet();
          permissions.put(roleBean.getName(), rolePerms);
        }
        rolePerms.addAll(Lists.immutableList(roleBean.getPermissions()));
      }

      // update the roles.
      for (String role : roles) {
        String[] rolePermission = StringUtils.split(role, ":", 2);
        Set<String> rolePerms = permissions.get(rolePermission[0]);
        if (rolePerms == null) {
          rolePerms = Sets.newHashSet();
          permissions.put(rolePermission[0], rolePerms);
        }
        rolePerms.add(rolePermission[1]);
      }
      // convert back
      rb = new RoleBean[permissions.size()];
      int i = 0;
      for (Entry<String, Set<String>> roleBeanSpec : permissions.entrySet()) {
        rb[i++] = new RoleBean(roleBeanSpec.getKey(), roleBeanSpec.getValue().toArray(
            new String[0]));
      }

      setRoles(rb);
    }

  }

  /**
   * @param roles
   */
  public void removeRoles(String[] roles) {
    if (roles != null && roles.length > 0) {
      RoleBean[] rb = getRoles();

      // convert to a set list
      Map<String, Set<String>> permissions = Maps.newHashMap();
      for (RoleBean roleBean : rb) {
        Set<String> rolePerms = permissions.get(roleBean.getName());
        if (rolePerms == null) {
          rolePerms = Sets.newHashSet();
          permissions.put(roleBean.getName(), rolePerms);
        }
        rolePerms.addAll(Lists.immutableList(roleBean.getPermissions()));
      }

      // update the roles.
      for (String role : roles) {
        String[] rolePermission = StringUtils.split(role, ":", 2);
        Set<String> rolePerms = permissions.get(rolePermission[0]);
        if (rolePerms != null) {
          rolePerms.remove(rolePermission[1]);
          if (rolePerms.size() == 0) {
            permissions.remove(rolePermission[0]);
          }
        }
      }
      // convert back
      rb = new RoleBean[permissions.size()];
      int i = 0;
      for (Entry<String, Set<String>> roleBeanSpec : permissions.entrySet()) {
        rb[i++] = new RoleBean(roleBeanSpec.getKey(), roleBeanSpec.getValue().toArray(
            new String[0]));
      }

      setRoles(rb);
    }

  }

  /**
   * @return the joiningMembership
   */
  public String getJoiningMembership() {
    return joiningMembership;
  }

  /**
   * @param joiningMembership
   *          the joiningMembership to set
   */
  public void setJoiningMembership(String joiningMembership) {
    this.joiningMembership = joiningMembership;
  }

  /**
   * @return the membershipHandler
   */
  public String getMembershipHandler() {
    return membershipHandler;
  }
  
  /**
   * @return the membershipHandler
   */
  public String getLanguage() {
    return language;
  }

  /**
   * @param membershipHandler
   *          the membershipHandler to set
   */
  public void setMembershipHandler(String membershipHandler) {
    this.membershipHandler = membershipHandler;
  }

  public void setTemplate(JSONObject templateObject) {
    this.template = templateObject;
  }
  
  public JSONObject getTemplate(){
	  return this.template;
  }
}
