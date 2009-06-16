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

package org.sakaiproject.kernel.social;

import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.name.Named;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.social.FriendsResolverService;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.model.FriendsBean;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

import javax.jcr.RepositoryException;

/**
 *
 */
public class FriendsResolverServiceImpl implements FriendsResolverService {

  private static final Log LOG = LogFactory.getLog(FriendsResolverService.class);
  private String privatePathBase;
  private JCRNodeFactoryService jcrNodeFactoryService;
  private UserFactoryService userFactoryService;
  private BeanConverter beanConverter;
  private Injector injector;

  @Inject
  public FriendsResolverServiceImpl(JCRNodeFactoryService jcrNodeFactoryService,
      UserFactoryService userFactoryService,
      ProfileResolverService profileResolverService, Injector injector,
      BeanConverter beanConverter,
      @Named(KernelConstants.PRIVATE_PATH_BASE) String privatePathBase) {
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.beanConverter = beanConverter;
    this.privatePathBase = privatePathBase;
    this.userFactoryService = userFactoryService;
    this.injector = injector;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.social.FriendsResolverService#resolve(java.lang.String)
   */
  public FriendsBean resolve(String uuid) {
    String userPath = userFactoryService.getUserPathPrefix(uuid);
    userPath = privatePathBase + userPath + KernelConstants.FRIENDS_FILE;
    InputStream in = null;
    try {
      in = jcrNodeFactoryService.getInputStream(userPath);
      String json = IOUtils.readFully(in, StringUtils.UTF8);
      FriendsBean fb = beanConverter.convertToObject(json, FriendsBean.class);
      System.err.println("Loaded friends bean as " + fb);
      return fb;
    } catch (JCRNodeFactoryServiceException ex) {
      FriendsBean fb = injector.getInstance(FriendsBean.class);
      fb.setUuid(uuid);
      System.err.println("create new friends bean as " + fb);
      return fb;
    } catch (RepositoryException e) {
      LOG.error(e.getMessage(), e);
    } catch (UnsupportedEncodingException e) {
      LOG.error(e.getMessage(), e);
    } catch (IOException e) {
      LOG.error(e.getMessage(), e);
    } finally {
      try {
        if (in != null) {
          in.close();
        }
      } catch (Exception ex) {
      }
    }
    return null;
  }

}
