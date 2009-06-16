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

import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.SmartNodeHandler;

import java.io.IOException;
import java.util.List;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Handler for smart folders whose action is tied to a named JPA query.
 */
public class NamedJpaSmartNodeHandler extends AbstractSmartNodeHandler {
  public static final String KEY = "jpa-named";

  private final EntityManager entityManager;

  /**
   *
   */
  @Inject
  public NamedJpaSmartNodeHandler(RegistryService registryService,
      EntityManager entityManager) {
    Registry<String, SmartNodeHandler> registry = registryService
        .getRegistry(SmartNodeHandler.REGISTRY);
    registry.add(this);
    this.entityManager = entityManager;
  }

 /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.SmartNodeHandler#handle(HttpServletRequest,
   *      HttpServletResponse, Node, String)
   */
  @SuppressWarnings("unchecked")
  public void handle(HttpServletRequest request, HttpServletResponse response,
      Node node, Node smartNode, String statement) throws RepositoryException, IOException {
    javax.persistence.Query jpaQuery = entityManager
        .createNamedQuery(statement);
    List results = jpaQuery.getResultList();
    /** FIXME make results into json */
    writeUtf8(response, results);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.SmartNodeHandler#count(HttpServletRequest,
   *      HttpServletResponse, Node, String)
   */
  @SuppressWarnings("unchecked")
  public void count(HttpServletRequest request, HttpServletResponse response,
      Node node, String statement) throws RepositoryException, IOException {
    javax.persistence.Query jpaQuery = entityManager
        .createNamedQuery(statement);
    List results = jpaQuery.getResultList();
    int size = results.size();
    writeUtf8(response, size);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return KEY;
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
