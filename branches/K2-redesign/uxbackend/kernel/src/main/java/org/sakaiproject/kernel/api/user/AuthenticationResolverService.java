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

import com.google.inject.Singleton;

import java.security.Principal;

/**
 * <p>
 * AuthenticationManager provides authentication of end-users.
 * </p>
 */
@Singleton
public interface AuthenticationResolverService {



  /**
   * Attempt to authenticate a user by the given evidence. Success produces the
   * authenticated user id. Failure throws an exception.
   *
   * @param principal
   *          The collected evidence to authenticate.
   * @return The authentication information if authenticated.
   * @throws SecurityException
   *           if the evidence is not understood or not valid.
   */
  Authentication authenticate(Principal principal) throws SecurityException;
}
