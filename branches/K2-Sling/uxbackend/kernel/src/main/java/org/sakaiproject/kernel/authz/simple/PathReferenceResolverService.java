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
package org.sakaiproject.kernel.authz.simple;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.authz.AccessControlStatement;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.authz.ReferencedObject;

import java.util.Map;

/**
 * A Path Resolver looks at the first element of the path, and attempts to look
 * it up a resolver in a map. If there is no match, the default resolver is
 * used.
 */
public class PathReferenceResolverService implements ReferenceResolverService {

  public static final String DEFAULT_RESOLVER = "resolvers.default";
  private Map<String, ReferenceResolverService> resolvers;
  private ReferenceResolverService defaultResolver;

  /**
   *
   */
  @Inject
  public PathReferenceResolverService(
      @Named(DEFAULT_RESOLVER) ReferenceResolverService defaultResolver,
      Map<String, ReferenceResolverService> resolvers) {
    this.resolvers = resolvers;
    this.defaultResolver = defaultResolver;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferenceResolverService#resolve(java.lang.String)
   */
  public ReferencedObject resolve(String resourceReference) {
    // Make sure we're getting a String from the resolver, Java won't check that
    // the type matches the definition
    String[] locator = StringUtils.split(resourceReference, "/", 1);
    if (locator != null && locator.length > 0 && locator[0] != null) {
      ReferenceResolverService resolver = resolvers.get(locator[0]);
      if (resolver != null) {
        return resolver.resolve(resourceReference);
      }
    }
    return defaultResolver.resolve(resourceReference);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.ReferenceResolverService#newAccessControlStatement(java.lang.String)
   */
  public AccessControlStatement newAccessControlStatement(String acs) {
    return defaultResolver.newAccessControlStatement(acs);
  }

}
