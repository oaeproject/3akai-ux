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
package org.sakaiproject.kernel.rest.search.test;

import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import com.google.common.collect.Maps;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.easymock.Capture;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.rest.search.RestSearchProvider;
import org.sakaiproject.kernel.rest.test.BaseRestUT;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.Property;
import javax.jcr.PropertyIterator;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.Workspace;
import javax.jcr.nodetype.NodeType;
import javax.jcr.query.Query;
import javax.jcr.query.QueryManager;
import javax.jcr.query.QueryResult;
import javax.servlet.ServletException;

/**
 * Unit tests for the RestSiteProvider
 */
public class RestSearchProviderTest extends BaseRestUT {

  /**
   * 
   */
  public static class QueryPattern {

    private Map<String, List<String>> params;
    private String response;

    /**
     * @param of
     * @param string
     */
    public QueryPattern(String[] params, String response) {

      this.params = Maps.newHashMap();
      for (int i = 0; i < params.length; i += 2) {
        List<String> l = this.params.get(params[i]);
        if (l == null) {
          l = new ArrayList<String>();
          this.params.put(params[i], l);
        }
        l.add(params[i + 1]);
      }
      this.response = response;
    }

    /**
     * @param string
     * @return
     */
    public String getParameter(String key) {
      List<String> l = params.get(key);
      if (l == null || l.size() == 0) {
        return null;
      }
      return l.get(0);
    }

    /**
     * @return
     */
    public String getResponse() {
      return response;
    }

    /**
     * @param string
     * @return
     */
    public String[] getParameterValues(String key) {
      List<String> l = params.get(key);
      if (l == null || l.size() == 0) {
        return null;
      }
      return l.toArray(new String[0]);
    }

  }

  private static final QueryPattern[] TESTPATTERN = new QueryPattern[] {
      new QueryPattern(new String[] { "q", "somethingthatwillnerverexist", "n",
          null, "p", null }, "\"size\":0"),
      new QueryPattern(new String[] { "q", "admin", "n", null, "p", null },
          "\"size\":8"),
      new QueryPattern(new String[] { "q", "admin", "n", null, "p", null, "s",
          "sakai:firstName", "s", "sakai:lastName" }, "\"size\":8"),
      new QueryPattern(new String[] { "q", "admin", "n", null, "p", null, "s",
          "sakai:firstName", "s", "sakai:lastName", "path", "/xyz" },
          "\"size\":0"),
      new QueryPattern(new String[] { "q", "admin", "n", null, "p", null, "s",
          "sakai:firstName", "s", "sakai:lastName", "path", "/_private" },
          "\"size\":1"),
      new QueryPattern(new String[] { "q", "admin", "n", null, "p", null, "s",
          "sakai:firstName", "s", "sakai:lastName", "path", "_private" },
          "\"size\":1"),
      new QueryPattern(new String[] { "q", "admin", "n", null, "p", null, "s",
          "sakai:firstName", "s", "sakai:lastName", "path", "_private/" },
          "\"size\":1"),
      new QueryPattern(new String[] { "q", "admin", "n", null, "p", null, "s",
          "sakai:firstName", "s", "sakai:lastName", "path", "/_private/" },
          "\"size\":1"),
      new QueryPattern(new String[] { "q", "admin", "n", null, "p", null, "s",
          "sakai:firstName", "s", "sakai:lastName", "path", "/_private/",
          "mimetype", "text/plain" }, "\"size\":1"),
      new QueryPattern(new String[] { "q", "admin", "n", null, "p", null, "s",
          "sakai:firstName", "s", "sakai:lastName", "path", "/_private/",
          "mimetype", "text/html" }, "\"size\":0")

  };
  @Test
  public void testDummy() {
    //TODO fix the other tests.
  }

  @Test
  public void testSearch() throws ServletException, IOException,
      RepositoryException, JCRNodeFactoryServiceException, InterruptedException {
    setupServices();

    newSession();
    for (QueryPattern testQuery : TESTPATTERN) {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      setupAnyTimes("admin", baos);
      expect(request.getMethod()).andReturn("POST").anyTimes();

      Session jcrSession = createMock(Session.class);
      Workspace workspace = createMock(Workspace.class);
      QueryManager queryManager = createMock(QueryManager.class);
      Query query = createMock(Query.class);
      Capture<String> queryString = new Capture<String>();
      Capture<String> language = new Capture<String>();
      Capture<String> finalResult = new Capture<String>();
      QueryResult queryResult = createMock(QueryResult.class);
      NodeIterator nodeIterator = createMock(NodeIterator.class);
      Node node = createMock(Node.class);
      Node parentNode = createMock(Node.class);
      NodeType nodeType = createMock(NodeType.class);
      PropertyIterator propertyIterator = createMock(PropertyIterator.class);
      Node contentNode = createMock(Node.class);
      Property propertyValue = createMock(Property.class);

      expect(jcrService.getSession()).andReturn(jcrSession).anyTimes();
      expect(jcrSession.getWorkspace()).andReturn(workspace).anyTimes();
      expect(workspace.getQueryManager()).andReturn(queryManager).anyTimes();
      expect(queryManager.createQuery(capture(queryString), capture(language)))
          .andReturn(query).anyTimes();
      expect(query.execute()).andReturn(queryResult).anyTimes();
      expect(queryResult.getNodes()).andReturn(nodeIterator).anyTimes();
      expect(parentNode.getPrimaryNodeType()).andReturn(nodeType).anyTimes();
      expect(nodeType.getName()).andReturn(JCRConstants.NT_FILE).anyTimes();

      
      expect(request.getParameter("q")).andReturn(testQuery.getParameter("q"));
      expect(request.getParameter("n")).andReturn(testQuery.getParameter("n"));
      expect(request.getParameter("p")).andReturn(testQuery.getParameter("p"));
      expect(request.getParameterValues("s")).andReturn(
          testQuery.getParameterValues("s"));
      expect(request.getParameter("sql")).andReturn(null).anyTimes();
      expect(request.getParameter("path")).andReturn(
          testQuery.getParameter("path"));
      expect(request.getParameter("mimetype")).andReturn(
          testQuery.getParameter("mimetype"));


      expect(nodeIterator.getSize()).andReturn(0L).anyTimes();
      nodeIterator.skip(0L);
      expect(nodeIterator.getPosition()).andReturn(0L);
      for (int i = 0; i < 5; i++) {
        expect(nodeIterator.hasNext()).andReturn(true);
        expect(nodeIterator.nextNode()).andReturn(node);
        expect(node.isNodeType(JCRConstants.NT_FILE)).andReturn(false);
        expect(node.isNodeType(JCRConstants.NT_FOLDER)).andReturn(false);
        expect(node.getParent()).andReturn(parentNode);
        
        expect(parentNode.getPath()).andReturn("path" + i);
        
        expect(parentNode.getMixinNodeTypes()).andReturn(new NodeType[0]);
        expect(parentNode.getProperties()).andReturn(propertyIterator);
        expect(propertyIterator.hasNext()).andReturn(false);
        expect(parentNode.hasNode(JCRConstants.JCR_CONTENT)).andReturn(false);
        expect(parentNode.getName()).andReturn("name" + i);
        
        // get file
        expect(parentNode.getNode(JCRConstants.JCR_CONTENT)).andReturn(
            contentNode);
        expect(contentNode.getProperty(JCRConstants.JCR_LASTMODIFIED))
            .andReturn(propertyValue);
        expect(contentNode.getProperty(JCRConstants.JCR_DATA)).andReturn(
            propertyValue);
        expect(propertyValue.getDate()).andReturn(Calendar.getInstance());
        expect(contentNode.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(propertyValue);
        expect(propertyValue.getString()).andReturn("text/html");
        expect(contentNode.hasProperty(JCRConstants.JCR_ENCODING)).andReturn(false);
        expect(propertyValue.getLength()).andReturn(0L);
        expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(false);
        expect(node.hasProperty(JCRConstants.JCR_ENCODING)).andReturn(false);
        expect(nodeIterator.getPosition()).andReturn(1L*i);
         
      }
      expect(nodeIterator.hasNext()).andReturn(false);
      
      expect(beanConverter.convertToString(capture(finalResult))).andReturn("result");

      response.setContentType(RestProvider.CONTENT_TYPE);
      expectLastCall();

      replayMocks(jcrSession, workspace, queryManager, query, queryResult,
          nodeIterator, node, parentNode, propertyIterator, nodeType,
          contentNode, propertyValue);

      String[] elements = new String[] { "search" };

      RestSearchProvider rsp = new RestSearchProvider(registryService,
          jcrService, beanConverter);
      rsp.dispatch(elements, request, response);


      assertEquals(Query.SQL, language.getValue());
      verifyMocks(jcrSession, workspace, queryManager, query, queryResult,
          nodeIterator, node, parentNode, propertyIterator, nodeType,
          contentNode, propertyValue);
      resetMocks(jcrSession, workspace, queryManager, query, queryResult,
          nodeIterator, node, parentNode, propertyIterator, nodeType,
          contentNode, propertyValue);
    }
  }

  @Test
  public void testSearchSort() throws ServletException, IOException,
      RepositoryException, JCRNodeFactoryServiceException, InterruptedException {
    setupServices();
    QueryPattern testQuery = new QueryPattern(new String[] { "q", "user", "n",
        null, "p", null, "s", "sakai:firstName", "s", "sakai:lastName", "path",
        "/_private/", "mimetype", "text/plain" }, "\"size\":7");
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    newSession();
    setupAnyTimes("user1", baos);
    expect(request.getMethod()).andReturn("POST").anyTimes();
    Session jcrSession = createMock(Session.class);
    Workspace workspace = createMock(Workspace.class);
    QueryManager queryManager = createMock(QueryManager.class);
    Query query = createMock(Query.class);
    Capture<String> queryString = new Capture<String>();
    Capture<String> language = new Capture<String>();
    Capture<Map<String, Object>> finalResult = new Capture<Map<String, Object>>();
    QueryResult queryResult = createMock(QueryResult.class);
    NodeIterator nodeIterator = createMock(NodeIterator.class);
    Node node = createMock(Node.class);
    Node parentNode = createMock(Node.class);
    NodeType nodeType = createMock(NodeType.class);
    PropertyIterator propertyIterator = createMock(PropertyIterator.class);
    Node contentNode = createMock(Node.class);
    Property propertyValue = createMock(Property.class);

    expect(jcrService.getSession()).andReturn(jcrSession).anyTimes();
    expect(jcrSession.getWorkspace()).andReturn(workspace).anyTimes();
    expect(workspace.getQueryManager()).andReturn(queryManager).anyTimes();
    expect(queryManager.createQuery(capture(queryString), capture(language)))
        .andReturn(query).anyTimes();
    expect(query.execute()).andReturn(queryResult).anyTimes();
    expect(queryResult.getNodes()).andReturn(nodeIterator).anyTimes();
    expect(parentNode.getPrimaryNodeType()).andReturn(nodeType).anyTimes();
    expect(nodeType.getName()).andReturn(JCRConstants.NT_FILE).anyTimes();

    expect(request.getParameter("q")).andReturn(testQuery.getParameter("q"));
    expect(request.getParameter("n")).andReturn(testQuery.getParameter("n"));
    expect(request.getParameter("p")).andReturn(testQuery.getParameter("p"));
    expect(request.getParameterValues("s")).andReturn(
        testQuery.getParameterValues("s"));
    expect(request.getParameter("sql")).andReturn(null).anyTimes();
    expect(request.getParameter("path")).andReturn(
        testQuery.getParameter("path"));
    expect(request.getParameter("mimetype")).andReturn(
        testQuery.getParameter("mimetype"));

    
    
    expect(nodeIterator.getSize()).andReturn(7L).anyTimes();
    nodeIterator.skip(0L);
    expect(nodeIterator.getPosition()).andReturn(0L);
    for (int i = 0; i < 7; i++) {
      expect(nodeIterator.hasNext()).andReturn(true);
      expect(nodeIterator.nextNode()).andReturn(node);
      expect(node.isNodeType(JCRConstants.NT_FILE)).andReturn(false);
      expect(node.isNodeType(JCRConstants.NT_FOLDER)).andReturn(false);
      expect(node.getParent()).andReturn(parentNode);
      
      expect(parentNode.getPath()).andReturn("path" + i);
      
      expect(parentNode.getMixinNodeTypes()).andReturn(new NodeType[0]);
      expect(parentNode.getProperties()).andReturn(propertyIterator);
      expect(propertyIterator.hasNext()).andReturn(false);
      expect(parentNode.hasNode(JCRConstants.JCR_CONTENT)).andReturn(false);
      expect(parentNode.getName()).andReturn("name" + i);
      
      // get file
      expect(parentNode.getNode(JCRConstants.JCR_CONTENT)).andReturn(
          contentNode);
      expect(contentNode.getProperty(JCRConstants.JCR_LASTMODIFIED))
          .andReturn(propertyValue);
      expect(contentNode.getProperty(JCRConstants.JCR_DATA)).andReturn(
          propertyValue);
      expect(propertyValue.getDate()).andReturn(Calendar.getInstance());
      expect(contentNode.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(propertyValue);
      expect(propertyValue.getString()).andReturn("text/html");
      expect(contentNode.hasProperty(JCRConstants.JCR_ENCODING)).andReturn(false);
      expect(propertyValue.getLength()).andReturn(0L);
      expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(false);
      expect(node.hasProperty(JCRConstants.JCR_ENCODING)).andReturn(false);
      expect(nodeIterator.getPosition()).andReturn(1L*i);
       
    }
    expect(nodeIterator.hasNext()).andReturn(false);
    
    expect(beanConverter.convertToString(capture(finalResult))).andReturn("result");

    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall();

    replayMocks(jcrSession, workspace, queryManager, query, queryResult,
        nodeIterator, node, parentNode, propertyIterator, nodeType,
        contentNode, propertyValue);

    String[] elements = new String[] { "search" };

    RestSearchProvider rsp = new RestSearchProvider(registryService,
        jcrService, beanConverter);
    rsp.dispatch(elements, request, response);


    
    JSONObject jo = JSONObject.fromObject(finalResult.getValue());
    JSONArray results = jo.getJSONArray("results");
    assertNotNull(results);
    assertEquals(7, results.size());
//    String prevFirstName = null;
//    String prevLastName = null;
    for (int i = 0; i < results.size(); i++) {
      JSONObject r = results.getJSONObject(i);
      JSONObject props = r.getJSONObject("nodeproperties");
      System.err.println("Properties are " + props.toString());
      /*props = props.getJSONObject("properties");
      String firstName = props.getString("sakai:firstName");
      String lastName = props.getString("sakai:lastName");
      if (prevFirstName == null) {
        prevFirstName = firstName;
        prevLastName = lastName;
      } else {
        int cmp = prevFirstName.compareTo(firstName);
        int cmp2 = prevLastName.compareTo(lastName);
        if (cmp > 0) {
          fail("FirstName not in order " + prevFirstName + ":" + firstName);
        } else if (cmp == 0) {
          if (cmp2 > 0) {
            fail("LastName not in order " + prevLastName + ":" + lastName);

          }
        } 
      }*/

    }

    verifyMocks(jcrSession, workspace, queryManager, query, queryResult,
        nodeIterator, node, parentNode, propertyIterator, nodeType,
        contentNode, propertyValue);
    resetMocks(jcrSession, workspace, queryManager, query, queryResult,
        nodeIterator, node, parentNode, propertyIterator, nodeType,
        contentNode, propertyValue);
  }

}
