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

package org.sakaiproject.sdata.tool;

import com.google.inject.Inject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.sdata.tool.api.Handler;

import java.io.IOException;
import java.util.Map;

import javax.jcr.RepositoryException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Dumps the contents of a JCR node
 * 
 * @author ieb
 */
public class JCRDumper implements Handler {

  /**
   * 
   */
  private static final long serialVersionUID = 1318034804063535506L;
  private static final Log LOG = LogFactory.getLog(JCRDumper.class);
  private static final RestDescription DESCRIPTION = new RestDescription();
  static {
    DESCRIPTION.setTitle("JCR Dump");
    DESCRIPTION.setBackUrl("../?doc=1");
    DESCRIPTION.setShortDescription("Dumps the content of a JCR Node");
    DESCRIPTION.addURLTemplate("GET /sys/*",
        "Outputs the conent of the JCR Node in System view, "
            + "see JCR-170 Spec for a description of System view");
    DESCRIPTION.addURLTemplate("GET /*",
        "Outputs the conent of the JCR Node in Document view, "
            + "see JCR-170 Spec for a description of Document view");
  }
  private transient JCRService jcrService;

  /**
   * 
   */
  @Inject
  public JCRDumper(JCRService jcrService) {
    this.jcrService = jcrService;
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest,
   * javax.servlet.http.HttpServletResponse)
   */
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String path = request.getPathInfo();
    if (path == null || path.length() == 0) {
      path = "/";
    }

    response.setContentType("text/xml");
    try {
      if (path.startsWith("/sys")) {
        path = path.substring("/sys".length());
        jcrService.getSession().exportSystemView(path,
            response.getOutputStream(), true, false);
      } else {
        jcrService.getSession().exportDocumentView(path,
            response.getOutputStream(), true, false);

      }
    } catch (RepositoryException e) {
      LOG.error("Failed", e);
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#doDelete(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doDelete(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#doHead(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doHead(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#doPost(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#doPut(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doPut(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.sakaiproject.sdata.tool.api.Handler#setHandlerHeaders(javax.servlet
   * .http.HttpServletResponse)
   */
  public void setHandlerHeaders(HttpServletRequest request,
      HttpServletResponse response) {
    response.setHeader("x-sdata-handler", this.getClass().getName());
    response.setHeader("x-sdata-url", request.getPathInfo());
  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#sendError(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse,
   * java.lang.Throwable)
   */
  public void sendError(HttpServletRequest request,
      HttpServletResponse response, Throwable ex) throws IOException {
  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#sendMap(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse, java.util.Map)
   */
  public void sendMap(HttpServletRequest request, HttpServletResponse response,
      Map<String, Object> contetMap) throws IOException {
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.sdata.tool.api.Handler#getKey()
   */
  public String getKey() {
    return "dump";
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.sdata.tool.api.Handler#getDescription()
   */
  public RestDescription getDescription() {
    return DESCRIPTION;
  }

}
