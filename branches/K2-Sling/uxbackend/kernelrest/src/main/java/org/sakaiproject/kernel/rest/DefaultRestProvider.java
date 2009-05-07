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
package org.sakaiproject.kernel.rest;

import com.google.inject.Inject;

import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 
 */
public class DefaultRestProvider implements RestProvider, Initialisable {

  private Registry<String, RestProvider> registry;

  /**
   * 
   */
  @Inject
  public DefaultRestProvider(RegistryService registryService) {
    registry = registryService.getRegistry(REST_REGISTRY);
    registry.add(this);
  }
  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.webapp.Initialisable#init()
   */
  public void init() {
  }
  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.webapp.Initialisable#destroy()
   */
  public void destroy() {
    registry.remove(this);    
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.rest.RestProvider#dispatch(java.lang.String[],
   *      javax.servlet.http.HttpServletRequest,
   *      javax.servlet.http.HttpServletResponse)
   */
  public void dispatch(String[] elements, HttpServletRequest request,
      HttpServletResponse response) {
    try {
      RestDescription restDescription = getDescription();
      response.setContentType(CONTENT_TYPE);
      response.getWriter().print(restDescription.toJson());
    } catch ( SecurityException ex ) {
      throw ex;
    } catch (RestServiceFaultException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new RestServiceFaultException(ex.getMessage(), ex);
    }
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.rest.RestProvider#getDescription()
   */
  public RestDescription getDescription() {
    RestDescription restDescription = new RestDescription();
    Map<String, RestProvider> providers = registry.getMap();
    restDescription.setShortDescription("All Rest Services in the system");
    restDescription.setTitle("List of rest Services");
    restDescription.setBackUrl("__describe__");
    for (Entry<String, RestProvider> provider : providers.entrySet()) {
      if (!"default".equals(provider.getKey())) {
        RestDescription description = provider.getValue().getDescription();
        String name = description.getTitle();
        restDescription.addSection(2, "Provider " + name, description
            .getShortDescription(), provider.getKey() + "/__describe__");
      }
    }
    return restDescription;
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return "default";
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.Provider#getPriority()
   */
  public int getPriority() {
    return 0;
  }


}
