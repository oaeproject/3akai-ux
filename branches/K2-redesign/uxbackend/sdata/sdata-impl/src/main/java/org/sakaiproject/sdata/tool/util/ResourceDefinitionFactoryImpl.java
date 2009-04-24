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

import org.sakaiproject.sdata.tool.JCRHandler;
import org.sakaiproject.sdata.tool.api.ResourceDefinition;
import org.sakaiproject.sdata.tool.api.ResourceDefinitionFactory;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.api.SecurityAssertion;

import javax.servlet.http.HttpServletRequest;

/**
 * Base Class for a resource definition factory
 * 
 * @author ieb
 */
public class ResourceDefinitionFactoryImpl implements ResourceDefinitionFactory {

  private static final String BASE_URL = "/f";

  private String basePath;

  private SecurityAssertion securityAssertion;

  @Inject
  public ResourceDefinitionFactoryImpl(
      @Named(JCRHandler.BASE_REPOSITORY_PATH) String basePath,
      @Named(JCRHandler.SECURITY_ASSERTION) SecurityAssertion securityAssertion) {
    this.basePath = basePath;
    this.securityAssertion = securityAssertion;
    
  }

  /**
   * /** Get the ResourceDefinition bean based on the request
   * 
   * @param path
   * @return
   * @throws SDataException
   */
  public ResourceDefinition getSpec(final HttpServletRequest request)
      throws SDataException {

    String path = request.getPathInfo();
    path = path.substring(BASE_URL.length());

    if (path.endsWith("/")) {
      path = path.substring(0, path.length() - 1);
    }

    String v = request.getParameter("v"); // version
    String f = request.getParameter("f"); // function
    String d = request.getParameter("d"); // function
    int depth = 1;
    if (d != null && d.trim().length() > 0) {
      depth = Integer.parseInt(d);
    }
    return new ResourceDefinitionImpl(request.getMethod(), f, depth, basePath,
        path, v, securityAssertion);
  }

}
