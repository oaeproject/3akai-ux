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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.util.rest.RestDescription;

import java.io.IOException;
import java.util.Enumeration;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * @author ieb
 */
public class SnoopHandler extends AbstractHandler {

  /**
   * 
   */
  private static final long serialVersionUID = -936439457646310920L;
  private static final Log LOG = LogFactory.getLog(SnoopHandler.class);
  private static final String KEY = "snoop";

  private static final RestDescription DESCRIPTION = new RestDescription();

  static {
    DESCRIPTION.setTitle("Snoop Handler");
    DESCRIPTION.setBackUrl("../?doc=1");
    DESCRIPTION
        .setShortDescription("Dumps the request information ");
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "Dumps the Request information including session and attribute information");
  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#doDelete(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doDelete(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    snoopRequest(request);
  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#doGet(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    if ( describe(request, response, null) ) {
      return;
    }
    snoopRequest(request);
  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#doHead(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doHead(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    snoopRequest(request);
  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#doPost(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    snoopRequest(request);
  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.sdata.tool.api.Handler#doPut(javax.servlet.http.
   * HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doPut(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    snoopRequest(request);
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

  /**
   * @param request
   */
  private void snoopRequest(HttpServletRequest request) {
    StringBuilder sb = new StringBuilder("SData Request :").append(request);
    sb.append("\n\tRequest Path :").append(request.getPathInfo());
    sb.append("\n\tMethod :").append(request.getMethod());
    for (Enumeration<?> hnames = request.getHeaderNames(); hnames
        .hasMoreElements();) {
      String name = (String) hnames.nextElement();
      sb.append("\n\tHeader :").append(name).append("=[").append(
          request.getHeader(name)).append("]");
    }
    for (Enumeration<?> hnames = request.getParameterNames(); hnames
        .hasMoreElements();) {
      String name = (String) hnames.nextElement();
      sb.append("\n\tParameter :").append(name).append("=[").append(
          request.getParameter(name)).append("]");
    }
    if (request.getCookies() != null) {
      for (Cookie c : request.getCookies()) {
        sb.append("\n\tCookie:");
        sb.append("name[").append(c.getName());
        sb.append("]path[").append(c.getPath());
        sb.append("]value[").append(c.getValue());
      }
    }
    sb.append("]");
    for (Enumeration<?> hnames = request.getAttributeNames(); hnames
        .hasMoreElements();) {
      String name = (String) hnames.nextElement();
      sb.append("\n\tAttribute :").append(name).append("=[").append(
          request.getAttribute(name)).append("]");
    }
    HttpSession session = request.getSession();
    sb.append("\n\tUser :").append(request.getRemoteUser());
    if (session != null) {
      sb.append("\n\tSession ID :").append(session.getId());
      for (Enumeration<?> hnames = session.getAttributeNames(); hnames
          .hasMoreElements();) {
        String name = (String) hnames.nextElement();
        sb.append("\n\tSession Attribute :").append(name).append("=[").append(
            session.getAttribute(name)).append("]");
      }

    } else {
      sb.append("\n\tNo Session");
    }

    LOG.info(sb.toString());
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
   * @see org.sakaiproject.sdata.tool.api.Handler#getkey()
   */
  public String getKey() {
    return KEY;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.sdata.tool.api.Handler#getDescription()
   */
  public RestDescription getDescription() {
    return DESCRIPTION;
  }

}
