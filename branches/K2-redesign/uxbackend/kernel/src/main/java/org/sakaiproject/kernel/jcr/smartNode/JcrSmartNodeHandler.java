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

import net.sf.json.JSONArray;

import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.util.JCRNodeMap;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.query.Query;
import javax.jcr.query.QueryManager;
import javax.jcr.query.QueryResult;

/**
 *
 */
public abstract class JcrSmartNodeHandler extends AbstractSmartNodeHandler {
  private JCRService jcrService;

  public JcrSmartNodeHandler(JCRService jcrService) {
    this.jcrService = jcrService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.SmartNodeHandler#handle(javax.jcr.Node)
   */
  protected NodeIterator performQuery(String language, String statement)
      throws RepositoryException {
    // handle statement by calling the JCR query manager.
    QueryManager qm = jcrService.getQueryManager();
    Query query = qm.createQuery(statement, language);
    QueryResult result = query.execute();
    NodeIterator nodes = result.getNodes();
    return nodes;
  }

  protected long performCount(String language, String statement) {
    long retval = -1;
    try {
      NodeIterator nodes = performQuery(language, statement);
      retval = nodes.getSize();
    } catch (RepositoryException e) {
      // use default value above
    }
    return retval;
  }

  protected JSONArray transform(NodeIterator nodes) throws RepositoryException {
    JSONArray jsonArray = new JSONArray();
    while (nodes.hasNext()) {
      Node n = nodes.nextNode();
      JCRNodeMap nodeMap = new JCRNodeMap(n, 1);
      jsonArray.add(nodeMap);
    }
    return jsonArray;
  }
}
