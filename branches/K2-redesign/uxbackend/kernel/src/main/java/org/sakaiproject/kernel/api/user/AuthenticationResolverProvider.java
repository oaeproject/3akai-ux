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
package org.sakaiproject.kernel.api.user;

import org.sakaiproject.kernel.api.Provider;

import java.security.Principal;

/**
 *
 */
public interface AuthenticationResolverProvider extends Provider<String> {

  /**
   * @param principal
   *          the principal being authenticated
   * @return an authentication object if authentication was possible (must NOT
   *         return null).
   * @throws SecurityException
   *           if the authentication failed.
   */
  Authentication authenticate(Principal principal) throws SecurityException;

}
