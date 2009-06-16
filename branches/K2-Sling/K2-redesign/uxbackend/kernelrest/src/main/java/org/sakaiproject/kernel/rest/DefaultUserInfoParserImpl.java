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
package org.sakaiproject.kernel.rest;

import java.util.HashMap;
import java.util.Map;


import net.sf.json.JSONObject;

import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserProfile;
import org.sakaiproject.kernel.api.user.UserResolverService;

import com.google.common.collect.ImmutableMap;
import com.google.inject.Inject;

public class DefaultUserInfoParserImpl implements DefaultUserInfoParser {

  private UserResolverService userResolverService;
  private UserFactoryService userFactoryService;
  private ProfileResolverService profileResolverService;
  private BeanConverter beanConverter;
  
  @Inject
  public DefaultUserInfoParserImpl(UserFactoryService userFactoryService,
      UserResolverService userResolverService, BeanConverter beanConverter,
      ProfileResolverService profileResolverService) {
    this.userResolverService = userResolverService;
    this.userFactoryService = userFactoryService;
    this.profileResolverService = profileResolverService;
    this.beanConverter = beanConverter;
  }

  /**
   * 
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.rest.DefaultUserInfoParser#getJSONForUser(java.lang.String)
   */
  public JSONObject getJSONForUser(String userId) {
    JSONObject o = new JSONObject();

      // Preferences
      User user = userResolverService.resolveWithUUID(userId);
      if (user == null) {
        o = JSONObject.fromObject(ImmutableMap.of("statusCode", "404",
            "userId", userId));
      } else {
        Map<String, Object> mapUser = new HashMap<String, Object>();
        mapUser.put("statusCode", "200");
        mapUser.put("restricted", "true");
        mapUser.put("userStoragePrefix", userFactoryService
            .getUserPathPrefix(userId));

        // Profile
        mapUser.put("profile", getJSONforUserProfile(userId));
        mapUser.put("uuid", user.getUuid());

        o = JSONObject.fromObject(mapUser);
      }
    return o;
  }

  /**
   * 
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.rest.DefaultUserInfoParser#getJSONforUserProfile(java.lang.String)
   */
  public JSONObject getJSONforUserProfile(String userid) {
     UserProfile userprofile = profileResolverService.resolve(userid);
     return JSONObject.fromObject(beanConverter.convertToString(userprofile.getProperties()));
  }

}
