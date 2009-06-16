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

import java.io.Serializable;

/**
 * A user object binding EID to UUID. This is a very lightweight object, as its
 * used in the session and on each request. Do not add methods here, add them to
 * the UserInfo object.
 */
public interface User extends Serializable {

  /**
   * @return the internal UUID of the user.
   */
  String getUuid();

  /**
   * @return the external EID associated with the user.
   */
  //String getEid();

}
