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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.inject.Guice;
import com.google.inject.Injector;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.configuration.SDataModule;

import java.io.IOException;
import java.util.Map;
import java.util.Random;
import java.util.Map.Entry;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <p>
 * Obviously the former is more compact.
 * </p>
 * <p>
 * When the servlet inits, it will create instances of the classes names in the
 * classname property and then register those against the baseurl property. When
 * processing a request, the path info will be examined and the first element of
 * the path will be used to match a selected handler on baseurl. The handler
 * will then be invoked for the method in question. If no handler is found then
 * a 404 will be sent back to the user.
 * </p>
 * <p>
 * There is an additional url /checkRunning that will respond with some sample
 * random data. This is used for unit testing. The size of the block can be set
 * with a x-testdata-size header in the request. This is limited to 4K maximum.
 * </p>
 *
 * @author ieb
 */
public class ControllerServlet extends HttpServlet {

  /**
	 *
	 */
  private static final long serialVersionUID = -7098194528761855627L;

  private static final Log LOG = LogFactory.getLog(ControllerServlet.class);

  private static final boolean debug = LOG.isDebugEnabled();

  private static final RestDescription DESCRIPTION = new RestDescription();

  static {
    DESCRIPTION.setTitle("SData");
    DESCRIPTION.setBackUrl("");
    DESCRIPTION
        .setShortDescription("Manages content in JCR according rfc2616");
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "SData contains 2 services, the Shared Data Space and the Private Data SPace. " +
            "The Private Data space URLS require that the user is authenticated, and the URL " +
            "space is bound to the account of the authenticated user. The shared space is shared amongst all users." +
            "responses will contain content "
                + "of files within the jcr or a map response (directories). The resource is "
                + "pointed to using the URI/URL requested (the path info part), and the standard "
                + "Http methods do what they are expected to in the http standard. GET gets the "
                + "content of the file, PUT put puts a new file, the content coming from the "
                + "stream of the PUT. DELETE deleted the file. HEAD gets the headers that would "
                + "come from a full GET. ");
    DESCRIPTION
        .addSection(
            2,
            "GET, HEAD, PUT",
            "The content type and content encoding headers are honored "
                + "for GET,HEAD and PUT, but other headers are not honored completely at the moment "
                + "(range-*) etc, ");
    DESCRIPTION
        .addSection(
            2,
            "POST",
            "POST takes multipart uploads of content, the URL pointing to a folder and "
                + "each upload being the name of the file being uploaded to that folder. The "
                + "upload uses a streaming api, and expects that form fields are ordered, such "
                + "that a field starting with mimetype before the upload stream will specify the "
                + "mimetype associated with the stream.");
    DESCRIPTION
        .addParameter(
            "v",
            "(Optional) A standard integer parameter that selects the version of the resource "
                + "that is being acted on.");
    DESCRIPTION
        .addParameter(
            "d",
            "(Optional) A standard integer parameter that controlls the depth of any query.");
    DESCRIPTION
        .addParameter("f",
            "(Optional) A standard string parameter that selects the function being used.");
    DESCRIPTION.addResponse("all codes",
        "All response codes conform to rfc2616");
  }

  /**
   * Dummy handler used for all those requests that cant be matched.
   */
  private Handler nullHandler = new Handler() {

    /**
     *
     */
    private static final long serialVersionUID = -225447966882182992L;
    private Random r = new Random(System.currentTimeMillis());

    /*
     * (non-Javadoc)
     *
     * @seeorg.sakaiproject.sdata.tool.api.Handler#doDelete(javax.servlet.http.
     * HttpServletRequest, javax.servlet.http.HttpServletResponse)
     */
    public void doDelete(HttpServletRequest request,
        HttpServletResponse response) throws ServletException, IOException {
    }

    /*
     * (non-Javadoc)
     *
     * @seeorg.sakaiproject.sdata.tool.api.Handler#doGet(javax.servlet.http.
     * HttpServletRequest, javax.servlet.http.HttpServletResponse)
     */
    public void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
      int size = 1024;
      try {
        size = Integer.parseInt(request.getHeader("x-testdata-size"));
      } catch (Exception ex) {

      }
      size = Math.min(4096, size);
      byte[] b = new byte[size];
      r.nextBytes(b);
      response.setContentType("application/octet-stream");
      response.setContentLength(b.length);
      response.setStatus(HttpServletResponse.SC_OK);
      response.getOutputStream().write(b);
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
      response.setHeader("x-sdata-url", request.getPathInfo());
      response.setHeader("x-sdata-handler", this.getClass().getName());
    }

    public void sendError(HttpServletRequest request,
        HttpServletResponse response, Throwable ex) throws IOException {

    }

    public void sendMap(HttpServletRequest request,
        HttpServletResponse response, Map<String, Object> contetMap)
        throws IOException {

    }

    public String getKey() {
      return null;
    }

    public RestDescription getDescription() {
      return null;
    }

  };

  private SDataConfiguration configuration;

  /**
   * Construct a Controller servlet
   */
  public ControllerServlet() {

  }

  /*
   * (non-Javadoc)
   *
   * @see javax.servlet.GenericServlet#init(javax.servlet.ServletConfig)
   */
  @Override
  public void init(ServletConfig config) throws ServletException {

    KernelManager kernelMgr = new KernelManager();
    Kernel kernel = kernelMgr.getKernel();
    Injector injector = Guice.createInjector(new SDataModule(kernel));
    configuration = injector.getInstance(SDataConfiguration.class);

    Map<String, RestDescription> map = Maps.newLinkedHashMap();
    for (Entry<String, Handler> e : configuration.getHandlerRegister().entrySet()) {
      map.put(e.getKey(), e.getValue().getDescription());
    }
    DESCRIPTION.addSection(2, "Handler",
        "The following handlers are available under this location.");
    for (String s : Lists.sortedCopy(map.keySet())) {
      RestDescription description = map.get(s);
      DESCRIPTION.addSection(3, "URL "+s+"/  "+description.getTitle(), description
          .getShortDescription(), s+"/?doc=1");
    }

  }

  /*
   * (non-Javadoc)
   *
   * @see
   * javax.servlet.http.HttpServlet#doDelete(javax.servlet.http.HttpServletRequest
   * , javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doDelete(HttpServletRequest request,
      HttpServletResponse response) throws ServletException, IOException {
    Handler h = getHandler(request);
    if (h != null) {
      h.setHandlerHeaders(request, response);
      h.doDelete(request, response);
    } else {
      response.reset();
      response.sendError(HttpServletResponse.SC_NOT_FOUND, "No Handler Found");
    }
  }

  /*
   * (non-Javadoc)
   *
   * @see
   * javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest,
   * javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    Handler h = getHandler(request);
    if (h != null) {
      h.setHandlerHeaders(request, response);
      h.doGet(request, response);
    } else {
      if (!describe(request, response)) {
        response.reset();
        response
            .sendError(HttpServletResponse.SC_NOT_FOUND, "No Handler Found");
      }
    }
  }

  /**
   * @param request
   * @param response
   * @return
   * @throws IOException
   */
  private boolean describe(HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    if ("1".equals(request.getParameter("doc"))) {
      String format = request.getParameter("fmt");
      if ("xml".equals(format)) {
        response.setContentType("text/xml");
        response.getWriter().print(DESCRIPTION.toXml());
      } else if ("json".equals(format)) {
        response.setContentType(RestProvider.CONTENT_TYPE);
        response.getWriter().print(DESCRIPTION.toJson());
      } else {
        response.setContentType("text/html");
        response.getWriter().print(DESCRIPTION.toHtml());
      }
      return true;
    }
    return false;
  }

  /*
   * (non-Javadoc)
   *
   * @see
   * javax.servlet.http.HttpServlet#doHead(javax.servlet.http.HttpServletRequest
   * , javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doHead(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    Handler h = getHandler(request);
    if (h != null) {
      h.setHandlerHeaders(request, response);
      h.doHead(request, response);
    } else {
      response.reset();
      response.sendError(HttpServletResponse.SC_NOT_FOUND, "No Handler Found");
    }
  }

  /*
   * (non-Javadoc)
   *
   * @see
   * javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest
   * , javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    Handler h = getHandler(request);
    if (h != null) {
      h.setHandlerHeaders(request, response);
      h.doPost(request, response);
    } else {
      response.reset();
      response.sendError(HttpServletResponse.SC_NOT_FOUND, "No Handler Found");
    }
  }

  /*
   * (non-Javadoc)
   *
   * @see
   * javax.servlet.http.HttpServlet#doPut(javax.servlet.http.HttpServletRequest,
   * javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doPut(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    Handler h = getHandler(request);
    if (h != null) {
      h.setHandlerHeaders(request, response);
      h.doPut(request, response);
    } else {
      response.reset();
      response.sendError(HttpServletResponse.SC_NOT_FOUND, "No Handler Found");
    }
  }

  /**
   * Get the handler mapped to a request path.
   *
   * @param request
   * @return
   */
  public Handler getHandler(HttpServletRequest request) {
    String pathInfo = request.getPathInfo();
    if (debug) {
      LOG.debug("Path is " + pathInfo);
    }
    if ("/checkRunning".equals(pathInfo)) {
      return nullHandler;
    }
    if (pathInfo == null) {
      return null;
    }

    char[] path = pathInfo.trim().toCharArray();
    if (path.length < 1) {
      return null;
    }
    int start = 0;
    if (path[0] == '/') {
      start = 1;
    }
    int end = start;
    for (; end < path.length && path[end] != '/'; end++) {
      ;
    }
    String key = new String(path, start, end - start);

    Handler h = configuration.getHandlerRegister().get(key);
    System.err.println("Key " + key + " matched " + h);
    return h;
  }

  /*
   * (non-Javadoc)
   *
   * @see
   * javax.servlet.http.HttpServlet#service(javax.servlet.http.HttpServletRequest
   * , javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    long start = System.currentTimeMillis();
    super.service(req, resp);
    LOG.info((System.currentTimeMillis() - start) + " ms " + req.getMethod()
        + ":" + req.getRequestURL());
  }

  /**
   * @return the nullHandler
   */
  public Handler getNullHandler() {
    return nullHandler;
  }
}
