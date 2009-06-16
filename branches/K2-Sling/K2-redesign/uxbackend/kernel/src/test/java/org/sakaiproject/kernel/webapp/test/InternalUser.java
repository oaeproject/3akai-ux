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
package org.sakaiproject.kernel.webapp.test;

import org.sakaiproject.kernel.api.user.User;

/**
 * 
 */
public class InternalUser implements User {
	
  /**
   * 
   */
  private static final long serialVersionUID = -4752743234664087359L;
  private String id;

  /**
   * @param string
   */
  public InternalUser(String id) {
    this.id = id;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.User#getEid()
   */
  public String getEid() {
    return id;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.User#getUuid()
   */
  public String getUuid() {
    return id;
  }

}
