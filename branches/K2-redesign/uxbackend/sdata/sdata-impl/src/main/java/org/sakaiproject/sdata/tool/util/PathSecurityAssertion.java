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

package org.sakaiproject.sdata.tool.util;

import com.google.inject.Inject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.api.SecurityAssertion;

import java.util.Map;

import javax.servlet.http.HttpServletResponse;

/**
 * <p>
 * An implementation of the Security Assertion that uses the http method, the
 * path and the sakai security service for perform the assertion. On check it
 * will throw SDataExceptions indicating forbidden if the path is outside its
 * configured range, or it is denied by the the Sakai security service.
 * </p>
 * <p>
 * 
 * It accepts paths starting with basePath, and then replaces basePath with
 * baseResource before checking for the method with the resulting path and the
 * PermissionQuery associated with the method.
 * </p>
 * 
 * @author ieb
 */
public class PathSecurityAssertion implements SecurityAssertion {

  private static final Log LOG = LogFactory.getLog(PathSecurityAssertion.class);

  /**
   * The base location that is Security Advisor applies to. Only paths that
   * start with this are allowed all others are denied regardless of the method.
   * If the path starts with baseLocation, baseLocation is removed from the path
   * and baseResource is prepended to the patch to generate a full resource
   * location suitable for using with the security service.
   */
  private String basePath;

  /**
   * A map mapping http methods to locks
   */
  private Map<String, PermissionQuery> locks;

  /**
   * this is prepended to the resource path, after normalizing (ie removing
   * baseLocation) and before sending to the Sakai security service.
   */
  private String baseResource;

  /**
   * The AuthzResolverService performs the resolution of security assertions
   * once the path and method have been translated into a permissions query and
   * a resource path.
   */
  private AuthzResolverService authzResolverService;

  /**
   */
  @Inject
  public PathSecurityAssertion(AuthzResolverService authzResolverService) {
    this.authzResolverService = authzResolverService;
  }

  /**
   * @param basePath
   *          the baseUrl to set, this it the stub of the url coming into the
   *          assertion that will be handled by this assertion
   */
  public void setBasePath(String basePath) {
    this.basePath = basePath;
  }

  /**
   * @param baseResource
   *          the baseResource, having remove the base URL from the url coming
   *          in, the base resource is added to generate the path in the
   *          repository on which the assertion is made.
   */
  public void setBaseResource(String baseResource) {
    this.baseResource = baseResource;
  }

  /**
   * @param locks
   *          locks provide a translation between the method being used on the
   *          url GET, POST, PUT etc and the permission that will be required to
   *          pass the assertion. Against each method there is a PermissionQuery
   *          that, if matching should be satisfied for the permission to be
   *          granted.
   */
  public void setLocks(Map<String, PermissionQuery> locks) {
    this.locks = locks;
  }

  /**
   * Performs the security assertion based on the resourceLocation, from the
   * original request and the method begin attempted. Will throw a
   * SDataException with Forbidden if the resource location is outside the
   * configured range, or if permission is denied.
   * 
   * @param method
   *          the http method being used
   * @param urlPath
   *          the path of the url, excluding host, protocol, port and query
   *          string, but including everything else.
   * @see org.sakaiproject.sdata.tool.api.SecurityAssertion#check(java.lang.String,java.lang.String,
   *      java.lang.String)
   */
  public void check(String method, String resourcePath) throws SDataException {

    if (!(basePath.length() == 0)
        && (resourcePath == null || !resourcePath.startsWith(basePath))) {
      LOG.info("Denied " + method + " on [" + resourcePath
          + "] base mismatch [" + basePath + "]");
      throw new SDataException(HttpServletResponse.SC_FORBIDDEN,
          "Access Forbidden");
    }
    String resourceReference = baseResource
        + resourcePath.substring(basePath.length());
    PermissionQuery permissionQuery = getResourceLock(method);

    if ( permissionQuery == null ) {
      throw new SDataException(HttpServletResponse.SC_METHOD_NOT_ALLOWED,"Method "+method+" is not allowed");
    } else {
      authzResolverService.check(resourceReference, permissionQuery);
    }
  }

  /**
   * Convert the HTTP Method into a lock.
   * 
   * @param method
   * @return
   */
  protected PermissionQuery getResourceLock(String method) {
    return locks.get(method);
  }

}
