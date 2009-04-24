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

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.SmartNodeHandler;

import java.io.IOException;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.query.Query;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * SQL handler for smart folder actions.
 */
public class SqlSmartNodeHandler extends JcrSmartNodeHandler {
  private static final String KEY = Query.SQL;

  /**
   *
   */
  @Inject
  public SqlSmartNodeHandler(RegistryService registryService,
      JCRService jcrService) {
    super(jcrService);
    Registry<String, SmartNodeHandler> registry = registryService
        .getRegistry(SmartNodeHandler.REGISTRY);
    registry.add(this);
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

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.SmartNodeHandler#handle(javax.servlet.http.HttpServletRequest,
   *      javax.servlet.http.HttpServletResponse, javax.jcr.Node,
   *      java.lang.String)
   */
  public void handle(HttpServletRequest request, HttpServletResponse response,
      Node node, Node smartNode, String statement) throws RepositoryException, IOException {
    NodeIterator nodes = performQuery(Query.SQL, statement);
    JSONArray jsonArray = transform(nodes);
    writeUtf8(response, jsonArray);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.SmartNodeHandler#count(javax.servlet.http.HttpServletRequest,
   *      javax.servlet.http.HttpServletResponse, javax.jcr.Node,
   *      java.lang.String)
   */
  public void count(HttpServletRequest request, HttpServletResponse response,
      Node node, String statement) throws RepositoryException, IOException {
    Long countResult = performCount(Query.SQL, statement);
    JSONObject jso = new JSONObject();
    jso.accumulate(COUNT_KEY, countResult);
    writeUtf8(response, jso);
  }
}
