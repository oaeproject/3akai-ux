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
import com.google.inject.Provider;

import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.rest.RestAuthenticationProvider;
import org.sakaiproject.kernel.rest.RestLogoutProvider;
import org.sakaiproject.kernel.rest.RestMySitesProvider;
import org.sakaiproject.kernel.rest.RestPatchProvider;
import org.sakaiproject.kernel.rest.RestSiteProvider;
import org.sakaiproject.kernel.rest.RestUserProvider;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class RestProviderListProvider implements Provider<List<RestProvider>> {

  private final List<RestProvider> list = new ArrayList<RestProvider>();
  /**
   *
   */
  @Inject
  public RestProviderListProvider(
      RestAuthenticationProvider restAuthenticationProvider,
       RestSiteProvider restSiteProvider,
       RestLogoutProvider restLogoutProvider,
      RestUserProvider restUserProvider,
      RestMySitesProvider restMySitesProvider,
      RestPatchProvider restPatchProvider) {
    list.add(restAuthenticationProvider);
    list.add(restLogoutProvider);
    list.add(restUserProvider);
    list.add(restMySitesProvider);
    list.add(restPatchProvider);
    list.add(restSiteProvider);
  }

  /**
   * {@inheritDoc}
   * @see com.google.inject.Provider#get()
   */
  public List<RestProvider> get() {
    return list;
  }

}
