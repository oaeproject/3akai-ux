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
package org.sakaiproject.kernel;

import com.google.inject.Inject;

import org.sakaiproject.kernel.api.Provider;
import org.sakaiproject.kernel.user.jcr.JcrAuthenticationResolverProvider;
import org.sakaiproject.kernel.user.jcr.JcrUserResolverProvider;

import java.util.ArrayList;
import java.util.List;

/**
 * This provides all the integration providers, they register themselves with
 * the relevant register on startup.
 */
public class IntegrationProviderListProvider implements
    com.google.inject.Provider<List<Provider<String>>> {

  private List<Provider<String>> list = new ArrayList<Provider<String>>();

  /**
   *
   */
  @Inject
  public IntegrationProviderListProvider(
      JcrAuthenticationResolverProvider authenticationResolverProvider,
      JcrUserResolverProvider jcrUserResolverProvider) {
    list.add(authenticationResolverProvider);
    list.add(jcrUserResolverProvider);
  }

  /**
   * {@inheritDoc}
   *
   * @see com.google.inject.Provider#get()
   */
  public List<Provider<String>> get() {
    return list;
  }

}
