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

import java.util.Locale;

import org.sakaiproject.kernel.api.Sealable;
import org.sakaiproject.kernel.api.authz.ReferencedObject;
import org.sakaiproject.kernel.api.authz.SubjectStatement;
import org.sakaiproject.kernel.api.authz.UserSubjects;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserInfo;

/**
 * The UserEnvironment is a container for the users environment, this will
 * either contain a pre-loaded set of properties related to the user, or cache
 * lookups for the user. It is mainly used by the authZ service but also acts as
 * a cachable container of user related properties that are not normally placed
 * in session. The object implementations my be cached in an instance cache, but
 * care should be taken to ensure that where something might change it is
 * expired or invalidated from the cache, and where the item is not present it
 * will be re-created. The aim here is not to put these objects into session
 * that will need to be replicated.
 */
public interface UserEnvironment extends Sealable {



  /**
   * Does the UserEnvironment have a match for the subject statement.
   *
   * @param subject
   *          the subject statement
   * @param referencedObject
   *          the object being evaluated
   * @return true is there is a match
   */
  boolean matches(ReferencedObject referencedObject, SubjectStatement subject);

  /**
   * @return true if the UserEnvironment has expired and should not be used.
   */
  boolean hasExpired();

  /**
   * Indicates that the user is a super user and does not have permissions applied, everything is granted.
   * @return
   */
  boolean isSuperUser();

  /**
   * @return
   */
  User getUser();

  /**
   * @return
   */
  UserSubjects getUserSubjects();

  /**
   * @return
   */
  String[] getSubjects();

  /**
   * @return
   */
  String getLocale();
  
  void setLocale(String locale);

  /**
   * @return the UserInfo for this user.
   */
  UserInfo getUserInfo();

  /**
   * Protects the userEnvironment for privacy purposes.
   * @param b
   */
  void setProtected(boolean b);
  
  void setTimezone(String timezone);
  String getTimezone();	

}
