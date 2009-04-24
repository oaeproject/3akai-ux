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

package org.sakaiproject.kernel.user;

import com.google.common.collect.Maps;

import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserProfile;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletResponse;

/**
 *
 */
public class UserProfileImpl implements UserProfile {

  private BeanConverter beanConverter;
  private JCRNodeFactoryService jcrNodeFactoryService;
  private UserFactoryService userFactoryService;
  private HashMap<String, Object> profileMap;
  private String uuid;

  /**
   * @param uuid
   * @param profileMap2
   * @param userFactoryService
   * @param jcrNodeFactoryService
   * @param beanConverter
   */
  public UserProfileImpl(String uuid, Map<String, Object> profileMap,
      UserFactoryService userFactoryService, JCRNodeFactoryService jcrNodeFactoryService,
      BeanConverter beanConverter) {
    this.uuid = uuid;
    this.profileMap = Maps.newHashMap(profileMap);
    this.userFactoryService = userFactoryService;
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.beanConverter = beanConverter;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserProfile#getProperties()
   */
  public HashMap<String, Object> getProperties() {
    return Maps.newHashMap(profileMap);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserProfile#getUuid()
   */
  public String getUuid() {
    return uuid;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.UserProfile#setProperties(java.util.Map)
   */
  public void setProperties(Map<String, Object> properties) {
    this.profileMap = Maps.newHashMap(properties);
  }

  public void save() throws JCRNodeFactoryServiceException, RepositoryException,
      UnsupportedEncodingException {
    String profile = beanConverter.convertToString(profileMap);
    String userProfilePath = userFactoryService.getUserProfilePath(uuid);

    ByteArrayInputStream bais = null;
    try {
      bais = new ByteArrayInputStream(profile.getBytes("UTF-8"));
      Node profileNode = jcrNodeFactoryService.setInputStream(userProfilePath, bais,
          RestProvider.CONTENT_TYPE);
      if (profileNode.hasNode(JCRConstants.JCR_CONTENT)) {
        Node dataNode = profileNode.getNode(JCRConstants.JCR_CONTENT);
        dataNode.setProperty("sakai:firstName", String.valueOf(profileMap
            .get("firstName")));
        dataNode
            .setProperty("sakai:lastName", String.valueOf(profileMap.get("lastName")));
        dataNode.setProperty("sakai:email", String.valueOf(profileMap.get("email")));
      } else {
        throw new RestServiceFaultException(
            HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
            "The nt:file node does not have a jcr:content child, the is not as per the JSR-170 specification, unable to create users");
      }
    } finally {
      try {
        bais.close();
      } catch (Exception ex) {
        // not interested in this.
      }
    }

  }
}
