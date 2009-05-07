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
package org.sakaiproject.kernel.rest.count;

import com.google.inject.Inject;

import net.sf.json.JSONObject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.SmartNodeHandler;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.util.ISO9075;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.IOException;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.query.Query;
import javax.jcr.query.QueryManager;
import javax.jcr.query.QueryResult;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Implements the count service
 *
 */
public class RestCountProvider implements RestProvider, Initialisable {

  private Log LOG = LogFactory.getLog(RestCountProvider.class);

  private static final int PRIORITY = 0;
  private static final String KEY = "count";
  private static final RestDescription DESCRIPTION = new RestDescription();

  private JCRNodeFactoryService jcrNodeFactoryService;

  private Registry<String, RestProvider> registry;
  private RegistryService registryService;
  private JCRService jcrService;

  static {
    DESCRIPTION.setTitle("Count Service");
    DESCRIPTION.setBackUrl("../__describe__");
    DESCRIPTION
        .setShortDescription("The count service provides a count of subnodes for a node.");
    DESCRIPTION
        .addSection(
            1,
            "Introduction",
            "The Count Service, when queried will respond with a count of nodes contained by a given node.");
    DESCRIPTION.addParameter("none", "The service accepts no parameters ");
    DESCRIPTION
        .addHeader("none",
            "The service neither looks for headers nor sets any non standard headers");
    DESCRIPTION
        .addURLTemplate(
            "count",
            "The service is selected by /rest/count and provides the count of subnodes contained by the root node.");
    DESCRIPTION
        .addURLTemplate(
            "count/<path>",
            "The service is selected by /rest/count and provides a count of subnodes for the node at <path>.");
    DESCRIPTION.addResponse("200",
        "The service returns an int representing the number of subnodes.");
  }

  @Inject
  public RestCountProvider(RegistryService registryService,
      JCRNodeFactoryService jcrNodeFactoryService, JCRService jcrService) {
    registry = registryService.getRegistry(RestProvider.REST_REGISTRY);
    registry.add(this);

    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.registryService = registryService;
    this.jcrService = jcrService;
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
      String path = request.getPathInfo().substring(KEY.length() + 1);
      Node n = jcrNodeFactoryService.getNode(path);

      if (n == null) {
        response.reset();
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }

      // String primaryNodeType = n.getPrimaryNodeType().getName();
      if (n.hasProperty(JCRConstants.JCR_SMARTNODE)) {
        handleSmartNode(request, response, n);
      } else { // if (JCRConstants.NT_FOLDER.equals(primaryNodeType)) {
        doDefaultGet(request, response, n);
      }
    } catch (RepositoryException e) {
      throw new RestServiceFaultException(e.getLocalizedMessage(), e);
    } catch (JCRNodeFactoryServiceException e) {
      throw new RestServiceFaultException(e.getLocalizedMessage(), e);
    } catch (IOException e) {
      throw new RestServiceFaultException(e.getLocalizedMessage(), e);
    }
  }

  private void handleSmartNode(HttpServletRequest request,
      HttpServletResponse response, Node n) {
    boolean handled = false;
    try {
      // get the action property from the node
      Property prop = n.getProperty(JCRConstants.JCR_SMARTNODE);
      String action = prop.getString();

      int colonPos = action.indexOf(":");
      String protocol = action.substring(0, colonPos);
      String statement = action.substring(colonPos + 1);

      // get the handler from the registry based on the protocol
      Registry<String, SmartNodeHandler> registry = registryService
          .getRegistry(SmartNodeHandler.REGISTRY);
      SmartNodeHandler handler = registry.getMap().get(protocol);

      // now handle the node
      if (handler != null) {
        handler.count(request, response, n, statement);
        handled = true;
      }
    } catch (RepositoryException e) {
      // Log this then let default handler happen
      throw new RestServiceFaultException(e.getLocalizedMessage(), e);
    } catch (IOException e) {
      throw new RestServiceFaultException(e.getLocalizedMessage(), e);
    }

    // do the default get if not handled
    if (!handled) {
      doDefaultGet(request, response, n);
    }
  }

  private void doDefaultGet(HttpServletRequest request,
      HttpServletResponse response, Node n) {

    try {
      QueryManager queryManager = jcrService.getQueryManager();
      String queryPath = n.getPath();
      queryPath = "/jcr:root" + ISO9075.encodePath(queryPath) + "//element(*,"
          + JCRConstants.NT_BASE + ")";
      Query query = queryManager.createQuery(queryPath, Query.XPATH);

      QueryResult qr = query.execute();
      NodeIterator ni = qr.getNodes();
      Long size = ni.getSize();

      if (LOG.isDebugEnabled()) {
        String nodeList = "Node contained: ";
        while (ni.hasNext()) {
          Node node = ni.nextNode();
          nodeList += node.getName() + " ";
        }
        LOG.debug(nodeList);
      }

      JSONObject jso = new JSONObject();
      jso.accumulate("count", size);

      response.getWriter().print(jso.toString());
      response.flushBuffer();
    } catch (IOException e) {
      throw new RestServiceFaultException(e.getLocalizedMessage(), e);
    } catch (RepositoryException e) {
      throw new RestServiceFaultException(e.getLocalizedMessage(), e);
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestProvider#getDescription()
   */
  public RestDescription getDescription() {
    return DESCRIPTION;
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
    return PRIORITY;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.webapp.Initialisable#destroy()
   */
  public void destroy() {
    registry.remove(this);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.webapp.Initialisable#init()
   */
  public void init() {
  }
}
