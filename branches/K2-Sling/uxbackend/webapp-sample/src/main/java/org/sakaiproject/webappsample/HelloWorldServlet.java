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

package org.sakaiproject.webappsample;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.componentsample.api.HelloWorldService;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelConfigurationException;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ServiceSpec;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 */
public class HelloWorldServlet extends HttpServlet {

  /**
   *
   */
  private static final long serialVersionUID = 2383631675063579262L;
  /**
   *
   */
  private static final Log LOG = LogFactory.getLog(HelloWorldServlet.class);

  /**
   * Write a hello response.
   *
   * @param req
   *          the request
   * @param resp
   *          the response
   * @throws ServletException
   *           if there is a servlet releted exception
   * @throws IOException
   *           if there is a problem writing
   */
  @Override
  protected void doGet(final HttpServletRequest req,
      final HttpServletResponse resp) throws ServletException, IOException {

    KernelManager km = new KernelManager();
    try {
      Kernel kernel = km.getKernel();
      LOG.info("Got kernel as " + kernel);

      ServiceManager serviceManager = kernel.getServiceManager();
      HelloWorldService helloWorldService = serviceManager
          .getService(new ServiceSpec(HelloWorldService.class));
      resp.setContentType("text/plain");
      PrintWriter w = resp.getWriter();
      w.print("This is the Hello World Servlet saying ");
      w.print(helloWorldService.getGreeting());
      w.print(" from the HelloWorldService ");
    } catch (KernelConfigurationException e) {
      throw new ServletException(e);
    }
  }
}
