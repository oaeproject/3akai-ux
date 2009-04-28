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

package org.sakaiproject.kernel.rest.search;

import com.google.common.collect.Lists;
import com.google.inject.Inject;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.JCRNodeMap;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import javax.jcr.LoginException;
import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.query.InvalidQueryException;
import javax.jcr.query.Query;
import javax.jcr.query.QueryManager;
import javax.jcr.query.QueryResult;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 */
public class RestSearchProvider implements RestProvider, Initialisable {

  private static final Log LOG = LogFactory.getLog(RestSearchProvider.class);
  private static final RestDescription DESC = new RestDescription();
  private static final String KEY = "search";
  private static final String QUERY = "q";
  private static final String NRESUTS_PER_PAGE = "n";
  private static final String PAGE = "p";
  private static final String SORT = "s";
  private static final String PATH = "path";
  private static final String SQL = "sql";
  private static final String MIMETYPE = "mimetype";

  static {
    DESC.setTitle("Search");
    DESC.setBackUrl("../__describe__");
    DESC.setShortDescription("Provides search functionality into the JCR.");
    DESC.addSection(1, "Introduction",
        "This service allows search using the JCR search implemetation.");
    DESC
        .addSection(
            2,
            "Search ",
            "Performs a search operation, and returns  "
                + HttpServletResponse.SC_OK
                + " on sucess, the content of the response is of the form.... TDOD DOC ");
    DESC.addURLTemplate("/rest/" + KEY, "Accepts GET to perform the search");
    DESC.addParameter(QUERY, "The query string");
    DESC.addParameter(NRESUTS_PER_PAGE, "the number of results per page");
    DESC.addParameter(PAGE, "the page, 0 = the first page ");
    DESC
        .addParameter(
            PATH,
            "an absolute path into the JCR eg '/_private', this path must be a "
                + "whole element and cant be partial. eg '/_priv' will select a path "
                + "starting '/_priv/' and not '/_priv*' ");
    DESC.addParameter(MIMETYPE, "limit the search to a single mime type");

    DESC.addParameter(SORT,
        "an array of fields to sort by eg sakai:firstName sakai:lastName ");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_OK),
        "The search was completed OK and the result set is returned ");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_FORBIDDEN),
        "If permission to search was denied ");
    DESC.addResponse(String
        .valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
        " Any other error");

  }

  private JCRService jcrService;
  private BeanConverter beanConverter;
  private Registry<String, RestProvider>  registry;

  /**
   *
   */
  @Inject
  public RestSearchProvider(RegistryService registryService,
      JCRService jcrService,
      BeanConverter beanConverter) {
    registry = registryService
        .getRegistry(RestProvider.REST_REGISTRY);
    registry.add(this);
    System.err
        .println("ADDED "
            + this
            + " to registry ===================================================================================================================================================================================================================================================");
    this.jcrService = jcrService;
    this.beanConverter = beanConverter;
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
   * @see org.sakaiproject.kernel.webapp.Initialisable#init()
   */
  public void init() {
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
      Map<String, Object> map = doSearch(request, response);
      if (map != null) {
        String responseBody = beanConverter.convertToString(map);
        response.setContentType(RestProvider.CONTENT_TYPE);
        response.getOutputStream().print(responseBody);
      }
    } catch (SecurityException ex) {
      throw ex;
    } catch (RestServiceFaultException ex) {
      throw ex;
    } catch (Exception ex) {
      ex.printStackTrace();
      throw new RestServiceFaultException(ex.getMessage(), ex);
    }
  }

  /**
   * @param request
   * @param response
   * @return
   * @throws RepositoryException
   * @throws LoginException
   * @throws IOException
   * @throws UnsupportedEncodingException
   */
  private Map<String, Object> doSearch(HttpServletRequest request,
      HttpServletResponse response) throws RestServiceFaultException,
      LoginException, RepositoryException, UnsupportedEncodingException,
      IOException {
    Session session = jcrService.getSession();
    String query = request.getParameter(QUERY);
    String queryType = request.getParameter("queryType");
    String nresults = request.getParameter(NRESUTS_PER_PAGE);
    String page = request.getParameter(PAGE);
    String sql = request.getParameter(SQL);
    String[] sort = request.getParameterValues(SORT);
    String path = request.getParameter(PATH);
    String mimeTypeSearch = request.getParameter(MIMETYPE);

    if (StringUtils.isEmpty(query)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          "No Query");
    }
    String nodeType = "nt:base";
    int nr = 50;
    if (!StringUtils.isEmpty(nresults)) {
      nr = Integer.parseInt(nresults);
    }
    int np = 0;
    if (!StringUtils.isEmpty(page)) {
      np = Integer.parseInt(page);
    }

    int start = np * nr;
    int end = (np + 1) * nr;

    // escape the query
    QueryManager queryManager = session.getWorkspace().getQueryManager();

    Query q = null;
    String escapedQuery = org.sakaiproject.kernel.util.StringUtils
        .escapeJCRSQL(query);
    StringBuilder sb = new StringBuilder();
    sb.append("SELECT * FROM ").append(nodeType).append(" WHERE ");
    if (!StringUtils.isEmpty(path)) {
      path = path.trim();
      if (!(path.charAt(0) == '/')) {
        path = "/" + path;
      }
      if (!(path.charAt(path.length() - 1) == '/')) {
        path = path + "/";
      }
      path = path + "%";
      path = org.sakaiproject.kernel.util.StringUtils.escapeJCRSQL(path);
      sb.append("jcr:path LIKE '").append(path).append("' AND ");
    }
    if (!StringUtils.isEmpty(mimeTypeSearch)) {
      mimeTypeSearch = mimeTypeSearch.trim();
      mimeTypeSearch = org.sakaiproject.kernel.util.StringUtils
          .escapeJCRSQL(mimeTypeSearch);
      sb.append("jcr:mimeType = '").append(mimeTypeSearch).append("' AND ");
    }
    sb.append("CONTAINS(.,'").append(escapedQuery).append("' )");
    if (sort != null && sort.length > 0) {
      sb.append(" ORDER BY ").append(sort[0]);
      if (sort.length > 1) {
        for (int i = 1; i < sort.length; i++) {
          sb.append(",").append(sort[i]);
        }
      }

    }
    String sqlQuery = sb.toString();
    if (!StringUtils.isEmpty(sql)) {
      sqlQuery = sql;
    }

    try {
      q = queryManager.createQuery(sqlQuery, (queryType != null && queryType.equals("xpath") ? Query.XPATH : Query.SQL));

    } catch (InvalidQueryException ex) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          "Invalid query presented to content system: " + sqlQuery + " "
              + ex.getMessage(), ex);
    }
    long startMs = System.currentTimeMillis();

    QueryResult result = q.execute();
    NodeIterator ni = result.getNodes();
    long endMs = System.currentTimeMillis();
    LOG.info("Executed " + sqlQuery + " in " + (endMs - startMs)
        + " ms " + ni.getSize() + " hits");
    Map<String, Object> results = new HashMap<String, Object>();
    List<Map<String, Object>> resultList = Lists.newArrayList();
    long size = ni.getSize();
    long startPos = 0;
    long endPos = 0;
    try {
      System.err.println("Skipping " + start + " going to " + end);
      ni.skip(start);
      startPos = ni.getPosition();
      endPos = startPos;


      for (int i = start; (i < end) && (ni.hasNext()); i++) {
        Node n = ni.nextNode();

        Node parentNode = n;
        if ( !n.isNodeType(JCRConstants.NT_FILE) && !n.isNodeType(JCRConstants.NT_FOLDER) ) {
          parentNode = n.getParent();
        }
        Map<String, Object> itemResponse = new HashMap<String, Object>();
        itemResponse.put("path", parentNode.getPath());
        itemResponse.put("nodeproperties", new JCRNodeMap(parentNode, 1));
        if (JCRConstants.NT_FILE.equals(parentNode.getPrimaryNodeType()
            .getName())) {
          String mimeType = "application/octet-stream";
          String encoding = "UTF-8";
          if (n.hasProperty(JCRConstants.JCR_MIMETYPE)) {
            Property mimeTypeProperty = n
                .getProperty(JCRConstants.JCR_MIMETYPE);
            if (mimeTypeProperty != null) {
              mimeType = mimeTypeProperty.getString();
            }
          }
          if (n.hasProperty(JCRConstants.JCR_ENCODING)) {
            Property contentEncoding = n.getProperty(JCRConstants.JCR_ENCODING);
            if (contentEncoding != null) {
              encoding = contentEncoding.getString();
            }
          }
          if (mimeType != null && mimeType.startsWith("text")
              && n.hasProperty(JCRConstants.JCR_DATA)) {
            Property p = n.getProperty(JCRConstants.JCR_DATA);
            if (p.getLength() < 10240) {
              InputStream in = null;
              try {
                in = p.getStream();
                itemResponse.put("content", IOUtils.readFully(in, encoding));
              } finally {
                try {
                  in.close();
                } catch (Exception ex) {
                }
              }
            }
          }
        }
        resultList.add(itemResponse);
        endPos = ni.getPosition();
      }

    } catch (NoSuchElementException ex) {
      // went over the end.
    }
    results.put("page", np);
    results.put("pageSize", nr);
    results.put("size", size);
    results.put("start", startPos);
    results.put("end", endPos);
    results.put("results", resultList);
    return results;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestProvider#getDescription()
   */
  public RestDescription getDescription() {
    return DESC;
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
