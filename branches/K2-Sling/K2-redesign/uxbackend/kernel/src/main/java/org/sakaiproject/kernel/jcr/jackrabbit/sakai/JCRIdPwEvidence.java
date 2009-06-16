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
package org.sakaiproject.kernel.jcr.jackrabbit.sakai;

import org.sakaiproject.kernel.api.user.IdPwPrincipal;

/**
 *
 */
public class JCRIdPwEvidence implements IdPwPrincipal {



  private String password;
  private String id;

  /**
   * @param id
   * @param password
   */
  public JCRIdPwEvidence(String id, String password) {
    if ( id == null || id.trim().length() == 0 || password == null ||password.trim().length() == 0 ) {
      throw new SecurityException("Username and/or password cannot be empty");
    }
    this.id = id;
    this.password = password;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.IdPrincipal#getIdentifier()
   */
  public String getIdentifier() {
    return id;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.user.IdPwPrincipal#getPassword()
   */
  public String getPassword() {
    return password;
  }

  /**
   * {@inheritDoc}
   * @see java.security.Principal#getName()
   */
  public String getName() {
    return JCRIdPwEvidence.class.getName();
  }

}
