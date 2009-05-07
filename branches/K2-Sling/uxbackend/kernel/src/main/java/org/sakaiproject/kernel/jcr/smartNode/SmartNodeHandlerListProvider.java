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
package org.sakaiproject.kernel.jcr.smartNode;

import com.google.inject.Inject;
import com.google.inject.Provider;

import org.sakaiproject.kernel.api.jcr.SmartNodeHandler;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class SmartNodeHandlerListProvider implements
    Provider<List<SmartNodeHandler>> {

  private ArrayList<SmartNodeHandler> handlers;

  /**
   *
   */
  @Inject
  public SmartNodeHandlerListProvider(XpathSmartNodeHandler xpathHandler,
      SqlSmartNodeHandler sqlHandler,
      JpaSmartNodeHandler jpaHandler,
      NamedJpaSmartNodeHandler namedJpaHandler,
      SiteSmartNodeHandler siteSmartNodeHandler) {
    handlers = new ArrayList<SmartNodeHandler>();
    handlers.add(xpathHandler);
    handlers.add(sqlHandler);
    handlers.add(jpaHandler);
    handlers.add(namedJpaHandler);
    handlers.add(siteSmartNodeHandler);
  }

  /**
   * {@inheritDoc}
   *
   * @see com.google.inject.Provider#get()
   */
  public List<SmartNodeHandler> get() {
    return handlers;
  }

}
