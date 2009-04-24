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
package org.sakaiproject.sdata.tool.configuration;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.name.Named;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;
import org.sakaiproject.sdata.tool.JCRHandler;
import org.sakaiproject.sdata.tool.api.SecurityAssertion;
import org.sakaiproject.sdata.tool.util.PathSecurityAssertion;

import java.util.HashMap;
import java.util.Map;

/**
 *
 */
public class JCRHandlerSecurityAssertion implements Provider<SecurityAssertion> {

  private SecurityAssertion securityAssertion;

  /**
   * @param baseLocation
   * @param baseReference
   * @param lockDefinition
   *
   */
  @Inject
  public JCRHandlerSecurityAssertion(
      PathSecurityAssertion pathSecurityAssertion,
      @Named(JCRHandler.BASE_REPOSITORY_PATH) String baseResource,
      @Named(JCRHandler.BASE_SECURED_PATH) String baseSecuredPath,
      @Named(JCRHandler.LOCK_DEFINITION) String lockDefinition,
      PermissionQueryService permissionService) {
    this.securityAssertion = pathSecurityAssertion;
    pathSecurityAssertion.setBasePath(baseSecuredPath);
    pathSecurityAssertion.setBaseResource(baseResource);
    Map<String, PermissionQuery> locks = new HashMap<String, PermissionQuery>();
    String[] lockDefs = StringUtils.split(lockDefinition, ';');
    if (lockDefs != null) {
      for (String lockDef : lockDefs) {
        String[] l = StringUtils.split(lockDef, ':');
        // permission query implementations are named.
        locks.put(l[0], permissionService.getPermission(l[1]));
      }
    }
    pathSecurityAssertion.setLocks(locks);
  }

  /**
   * {@inheritDoc}
   *
   * @see com.google.inject.Provider#get()
   */
  public SecurityAssertion get() {
    return securityAssertion;
  }

}
