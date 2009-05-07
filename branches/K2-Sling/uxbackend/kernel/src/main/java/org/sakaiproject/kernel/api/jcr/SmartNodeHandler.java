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
package org.sakaiproject.kernel.api.jcr;

import org.sakaiproject.kernel.api.Provider;

import java.io.IOException;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Interface for handlers of smart folder actions.
 */
public interface SmartNodeHandler extends Provider<String> {
  String REGISTRY = "smartNode.registry";

  /**
   * Handle a smart node and the query statement assigned to it.
   *
   * @param request
   * @param response
   * @param node
   *          The node requested.
   * @param smartNode
   *          The node which triggered the smart operation. 
   * @param statement
   *          The smart node statement associated to the node. This statement
   *          will not contain the language the statement is written in.
   * @throws RepositoryException
   *           If there's a problem accessing the repository.
   * @throws IOException
   *           If there's a problem writing to the response.
   */
  void handle(HttpServletRequest request, HttpServletResponse response,
      Node node, Node smartNode, String statement) throws RepositoryException, IOException;

  /**
   * Get the count of the results expected from a smart node.
   * 
   * @param request
   * @param response
   * @param node
   *          The node requested.
   * @param statement
   *          The smart node statement associated to the node. This statement
   *          will not contain the language the statement is written in.
   * @throws RepositoryException
   *           If there's a problem accessing the repository.
   * @throws IOException
   *           If there's a problem writing to the response.
   */
  void count(HttpServletRequest request, HttpServletResponse response,
      Node node, String statement) throws RepositoryException, IOException;
}
