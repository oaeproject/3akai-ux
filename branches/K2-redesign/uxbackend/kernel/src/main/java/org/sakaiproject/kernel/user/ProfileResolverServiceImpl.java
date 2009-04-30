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

import org.sakaiproject.kernel.api.presence.PresenceService;

import com.google.inject.Inject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserProfile;
import org.sakaiproject.kernel.util.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.Map;

import javax.jcr.RepositoryException;

/**
 *
 */
public class ProfileResolverServiceImpl implements ProfileResolverService {

  private static final Log LOG = LogFactory
      .getLog(ProfileResolverServiceImpl.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private JCRNodeFactoryService jcrNodeFactoryService;
  private UserFactoryService userFactoryService;
  private BeanConverter beanConverter;
private PresenceService presenceService;


  /**
   *
   */
  @Inject
  public ProfileResolverServiceImpl(
      BeanConverter beanConverter, PresenceService presenceService,
      JCRNodeFactoryService jcrNodeFactoryService,
      UserFactoryService userFactoryService) {
    this.beanConverter = beanConverter;
    this.userFactoryService = userFactoryService;
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.presenceService = presenceService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.ProfileResolverService#create(org.sakaiproject.kernel.api.user.User,
   *      java.lang.String)
   */
  public UserProfile create(String uuid, String userType) {

    InputStream templateInputStream = null;
    try {
      templateInputStream = jcrNodeFactoryService
          .getInputStream(userFactoryService.getUserProfileTempate(userType));
      String template = IOUtils.readFully(templateInputStream, "UTF-8");
      System.err.println("Loading Profile from "
          + userFactoryService.getUserProfileTempate(userType) + " as "
          + template);
      Map<String, Object> profileMap = beanConverter.convertToMap(template);
      profileMap.put("status", presenceService.getStatus(uuid));
      
      return new UserProfileImpl(uuid, profileMap, userFactoryService,
          jcrNodeFactoryService, beanConverter);
    } catch (RepositoryException e) {
      LOG.error(e.getMessage(), e);
    } catch (JCRNodeFactoryServiceException e) {
      LOG.error(e.getMessage(), e);
    } catch (UnsupportedEncodingException e) {
      LOG.error(e.getMessage(), e);
    } catch (IOException e) {
      LOG.error(e.getMessage(), e);
    } finally {
      try {
        templateInputStream.close();
      } catch (Exception ex) {
      }
    }
    return null;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.user.ProfileResolverService#resolve(org.sakaiproject.kernel.api.user.User)
   */
  public UserProfile resolve(String uuid) {

    InputStream profileInputStream = null;
    try {
      profileInputStream = jcrNodeFactoryService

      .getInputStream(userFactoryService.getUserProfilePath(uuid));
      String template = IOUtils.readFully(profileInputStream, "UTF-8");
      Map<String, Object> profileMap = beanConverter.convertToMap(template);
      profileMap.put("status", presenceService.getStatus(uuid));
      
      return new UserProfileImpl(uuid, profileMap, userFactoryService,
          jcrNodeFactoryService, beanConverter);

    } catch (RepositoryException e) {
      LOG.error(e.getMessage(), e);
    } catch (JCRNodeFactoryServiceException e) {
      if (debug)
        LOG.debug(e.getMessage(), e);
    } catch (UnsupportedEncodingException e) {
      LOG.error(e.getMessage(), e);
    } catch (IOException e) {
      LOG.error(e.getMessage(), e);
    } finally {
      try {
        profileInputStream.close();
      } catch (Exception ex) {
      }
    }
    return null;
  }

}
