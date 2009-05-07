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
package org.sakaiproject.kernel.api.userenv;

import org.sakaiproject.kernel.api.UpdateFailedException;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.user.User;

import java.util.Locale;

/**
 * The UserEnvironmentResolverService resolves {@link UserEnvironment} based on
 * {@link Session} objects.
 */
public interface UserEnvironmentResolverService {



  /**
   * Get a {@link UserEnvironment} objects based on the supplied session.
   *
   * @param currentSession
   *          the supplied session.
   * @return the UserEnvironment object.
   */
  UserEnvironment resolve(Session currentSession);

  /**
   * Resolve a User Environment for an arbritary user, probably not this user.
   *
   * @param user
   *          the User that identifies the User environment
   * @return the User Environment, or null if none is found.
   */
  UserEnvironment resolve(User user);

  /**
   * Resolve a User Environment for an arbritary user, probably not this user. This method avoids requiring a session.
   *
   * @param user
   *          the User that identifies the User environment
   * @return the User Environment, or null if none is found.
   */
  UserEnvironment resolve(String userId);



  /**
   * Remove the userEnvironment bound to the sessionId from any caches.
   *
   * @param sessionId
   */
  void expire(String sessionId);

  /**
   * Get the implementations concept of path for the userEnvironment storage
   * space.
   *
   * @param userId
   *          the UUID of ther user
   * @return the absolute path of the user environment storage space.
   */
  String getUserEnvironmentBasePath(String userId);

  /**
   * Get the locale for the request, session settings take precedence, followed
   * by persisted preference followed by the browser, then the system.
   *
   * @param browserLocale
   *          the locale of the request
   * @param session
   *          the session associated with the request
   * @return the computed Locale
   */
  Locale getUserLocale(Locale browserLocale, Session session);


  /**
   * Saves a user environment after modifying it.
   * @param userEnvironment
   * @throws UpdateFailedException if the update failed.
   */
  void save (UserEnvironment userEnvironment) throws UpdateFailedException;

  /**
   * @param u
   * @param externalId
   * @param password
   * @param userType
   */
  UserEnvironment create(User u, String externalId, String password, String userType);

  /**
   * Remove a membership form the user
   * @param userId
   * @param siteId
   * @param membershipType
   */
  void removeMembership(String userId, String siteId, String membershipType);

  /**
   * Add membership to the user.
   * @param userId
   * @param siteId
   * @param membershipType
   */
  void addMembership(String userId, String siteId, String membershipType);

}
