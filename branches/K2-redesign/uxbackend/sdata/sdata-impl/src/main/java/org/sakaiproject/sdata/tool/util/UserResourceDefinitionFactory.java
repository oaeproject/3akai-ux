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
import com.google.inject.name.Named;

import org.sakaiproject.kernel.util.PathUtils;
import org.sakaiproject.sdata.tool.JCRUserStorageHandler;
import org.sakaiproject.sdata.tool.api.ResourceDefinition;
import org.sakaiproject.sdata.tool.api.ResourceDefinitionFactory;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.api.SecurityAssertion;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <p>
 * A UserResourceDefinitionFactory generates ResourceDefinition based on the
 * logged in User. The Resource path is a structured path that ensures that
 * there will not be too many users in one directory. Currently we use a path
 * that is 2 deep, Each level containing a maximum of 256 entries, giving 65K
 * directories in which to store the user preferences. We use the first 4
 * characters of a base16 encoded SHA-1 of the username to generate the path to
 * the users folder, and then append a path normalized folder of the username.
 * </p>
 * <p>
 * Taking this approach ensures that we dont have problems with too many users
 * in each directory which would adversly effect performance.
 * </p>
 * 
 * @author ieb
 */
public class UserResourceDefinitionFactory implements ResourceDefinitionFactory {

  private String basePath;

  private SecurityAssertion nullSecurityAssertion = new NullSecurityAssertion();

  /**
   * TODO Javadoc
   * 
   * @param basePath
   */
  @Inject
  public UserResourceDefinitionFactory(@Named(JCRUserStorageHandler.BASE_REPOSITORY_PATH) String basePath) {
    this.basePath = basePath;
  }

  public void destroy() {

  }

  /**
   * TODO Javadoc
   * 
   * @param path
   * @return
   * @throws SDataException
   */
  public ResourceDefinition getSpec(HttpServletRequest request)
      throws SDataException {

    String path = request.getPathInfo();

    if (path.endsWith("/")) {
      path = path.substring(0, path.length() - 1);
    }

    String user = request.getRemoteUser();
    if (user == null || user.trim().length() == 0) {
      throw new SDataException(HttpServletResponse.SC_UNAUTHORIZED,
          "User must be logged in to use preference service ");
    }

    System.err.println("Getting Prefix for "+user);
    String pathPrefix = PathUtils.getUserPrefix(user);
    System.err.println("Prefix was "+pathPrefix);

    path = pathPrefix + path;

    String v = request.getParameter("v"); // version
    String f = request.getParameter("f"); // function
    String d = request.getParameter("d"); // function
    int depth = 1;
    if (d != null && d.trim().length() > 0) {
      depth = Integer.parseInt(d);
    }

    return new ResourceDefinitionImpl(request.getMethod(), f, depth, basePath,
        path, v, nullSecurityAssertion);
  }

}
