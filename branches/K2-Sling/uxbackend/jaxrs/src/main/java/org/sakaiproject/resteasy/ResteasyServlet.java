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

package org.sakaiproject.resteasy;

import org.jboss.resteasy.core.ThreadLocalResteasyProviderFactory;
import org.jboss.resteasy.plugins.server.servlet.HttpServletDispatcher;
import org.jboss.resteasy.plugins.server.servlet.ServletSecurityContext;
import org.jboss.resteasy.spi.Registry;
import org.jboss.resteasy.spi.ResteasyProviderFactory;
import org.sakaiproject.kernel.api.rest.Documentable;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.SecurityContext;

/**
 * An extension of {@link HttpServletDispatcher}, the default resteasy servlet. This
 * extension checks for a query parameter "doc". If it exists, the jax-rs resource's
 * getRestDocumentation().toHtml() is returned as the response instead of invoking the
 * resource's intended http method.
 */
public class ResteasyServlet extends HttpServletDispatcher {
  /**
   *
   */
  private static final long serialVersionUID = 1L;
  /**
   * The JSR-311 registry.
   */
  protected Registry registry;
  /**
   * A documentation bean.
   */
  private RootRestEasyDocumentation defaultDocumentation;

  /**
   * {@inheritDoc}
   * @see org.jboss.resteasy.plugins.server.servlet.HttpServletDispatcher#init(javax.servlet.ServletConfig)
   */
  @Override
  public void init(ServletConfig sc) throws ServletException {
    super.init(sc);
    registry = (Registry) sc.getServletContext().getAttribute(Registry.class.getName());
    defaultDocumentation = (RootRestEasyDocumentation) sc.getServletContext()
        .getAttribute(Documentable.class.getName());
  }

  /**
   * {@inheritDoc}
   *
   * @see org.jboss.resteasy.plugins.server.servlet.HttpServletDispatcher#service(javax.servlet.http.HttpServletRequest,
   *      javax.servlet.http.HttpServletResponse)
   */
  @Override
  public void service(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
    if (request.getParameter("doc") != null) {
      try {
        // This is boilerplate to set up the thread for resteasy
        ResteasyProviderFactory defaultInstance = ResteasyProviderFactory.getInstance();
        if (defaultInstance instanceof ThreadLocalResteasyProviderFactory) {
          ThreadLocalResteasyProviderFactory.push(providerFactory);
        }
        try {
          ResteasyProviderFactory.pushContext(HttpServletRequest.class, request);
          ResteasyProviderFactory.pushContext(HttpServletResponse.class, response);
          ResteasyProviderFactory.pushContext(SecurityContext.class,
              new ServletSecurityContext(request));
          // end boilerplate
          String requestPath = request.getRequestURI();
          if (!requestPath.endsWith("/")) {
            response.sendRedirect(request.getRequestURI() + "/?"
                + request.getQueryString());
            return;
          }

          String path = request.getPathInfo();
          Documentable doc = defaultDocumentation.getDocumentable(path);
          if (doc == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
          } else {
            response.setContentType("text/html");
            PrintWriter writer = response.getWriter();
            writer.write(doc.getRestDocumentation().toHtml());
            writer.flush();
          }
          return;
        } finally {
          ResteasyProviderFactory.clearContextData();
        }
      } finally {
        ResteasyProviderFactory defaultInstance = ResteasyProviderFactory.getInstance();
        if (defaultInstance instanceof ThreadLocalResteasyProviderFactory) {
          ThreadLocalResteasyProviderFactory.pop();
        }

      }
    } else {
      // Delegate to the default resteasy servlet to invoke the correct jax-rs resource
      // method
      super.service(request, response);
    }
  }

}
