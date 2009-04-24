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
package org.sakaiproject.webdav;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.jackrabbit.server.SessionProvider;
import org.apache.jackrabbit.webdav.DavLocatorFactory;
import org.apache.jackrabbit.webdav.simple.ResourceConfig;
import org.apache.jackrabbit.webdav.simple.SimpleWebdavServlet;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.jcr.JCRService;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import javax.jcr.LoginException;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This code is based on Apache Sling code (and it should take all credit)
 */
public class SakaiWebDavServlet extends SimpleWebdavServlet {

  /**
   *
   */
  private static final long serialVersionUID = 1L;
  private static final Log LOG = LogFactory.getLog(SakaiWebDavServlet.class);
  private static final String DEFAULT_FILTER = ".DS_Store";
  private transient Repository repository;
  private transient JCRService jcrService;
  private Map<String, String> filterElement = new HashMap<String, String>();

  @Override
  public Repository getRepository() {
    return repository;
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.GenericServlet#init(javax.servlet.ServletConfig)
   */
  @Override
  public void init(ServletConfig config) throws ServletException {
    super.init(config);

    String filter = config.getInitParameter("path-filter");
    if (StringUtils.isEmpty(filter)) {
      filter = DEFAULT_FILTER;
    }
    String[] filters = StringUtils.split(filter, ';');
    if (filters != null) {
      for (String f : filters) {
        f = f.trim();
        filterElement.put(f, f);
      }
    }

    KernelManager km = new KernelManager();
    jcrService = km.getService(JCRService.class);
    repository = jcrService.getRepository();

    // for now, the ResourceConfig is fixed
    final String configPath = "/webdav-resource-config.xml";
    final ResourceConfig rc = new ResourceConfig();
    final URL cfg = getClass().getResource(configPath);
    if (cfg == null) {
      throw new UnavailableException("ResourceConfig source not found:"
          + configPath);
    }

    rc.parse(cfg);
    setResourceConfig(rc);
  }

  @Override
  protected void service(HttpServletRequest request,
      HttpServletResponse response) throws ServletException, IOException {

    final String pinfo = request.getPathInfo();

    String[] elements = StringUtils.split(pinfo, '/');
    if (elements != null) {
      for (String e : elements) {
        if (filterElement.containsKey(e)) {
          response.sendError(HttpServletResponse.SC_FORBIDDEN);
          return;
        }
      }
    }

    if (pinfo == null) {
      String uri = request.getRequestURI();
      uri += "/";
      response.sendRedirect(uri);
    } else {
      super.service(request, response);
    }

  }

  private transient DavLocatorFactory locatorFactory;

  private transient SessionProvider sessionProvider;

  // ---------- SimpleWebdavServlet overwrites -------------------------------

  @Override
  public DavLocatorFactory getLocatorFactory() {
    if (locatorFactory == null) {

      String workspace = jcrService.getDefaultWorkspace();

      // no configuration, try to login and acquire the default name
      if (workspace == null || workspace.length() == 0) {
        Session tmp = null;
        try {
          tmp = jcrService.login();
          workspace = tmp.getWorkspace().getName();
        } catch (Throwable t) {
          LOG.info("Using Fallback workspace ");
          workspace = "default"; // fall back name
        } finally {
          if (tmp != null) {
            try {
              jcrService.logout();
            } catch (LoginException e) {
              LOG.warn("Failed to logout "+e.getMessage());
            } catch (RepositoryException e) {
              LOG.warn("Failed to logout "+e.getMessage());
            }
          }
        }
      }

      locatorFactory = new SakaiLocatorFactory(workspace);
    }
    return locatorFactory;
  }

  @Override
  public synchronized SessionProvider getSessionProvider() {
    if (sessionProvider == null) {
      sessionProvider = new SakaiSessionProvider(jcrService);
    }
    return sessionProvider;
  }

}
