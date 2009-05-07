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
package org.sakaiproject.kernel.loader.server.jetty.test;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.mortbay.jetty.Connector;
import org.mortbay.jetty.Handler;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.handler.HandlerCollection;
import org.mortbay.jetty.nio.SelectChannelConnector;
import org.mortbay.thread.QueuedThreadPool;
import org.sakaiproject.kernel.loader.server.jetty.KernelLoader;
import org.sakaiproject.kernel.loader.server.jetty.SakaiWebAppContext;

import java.util.HashMap;
import java.util.Map;

/**
 * A skeleton Jetty Server.
 */
public class JettyServer {
  /**
   * 
   */
  public static enum Function {
    DEFAULT(""), KERNEL("k"), GETSERVICE("s"), TESTSOURCESERVICE("t");

    private static Map<String, Function> table = new HashMap<String, Function>();
    static {
      for (Function f : Function.values()) {
        table.put(f.toString(), f);
      }
    }
    private final String name;

    private Function(String name) {
      this.name = name;
    }

    @Override
    public String toString() {
      return name;
    }

    public static Function getValueOf(String value) {
      Function f = DEFAULT;
      if (value != null) {
        f = table.get(value);
        if (f == null) {
          f = DEFAULT;
        }
      }
      return f;
    }
  }

  public static final int JETTY_PORT = 9003;
  public static final String SERVER_URL = "http://localhost:" + JETTY_PORT;  
  public static final String DEPLOYED_URL = "/hello";
  public static final String REQUEST_URL = SERVER_URL + DEPLOYED_URL;
  public static final String RESPONSE = "hello";

  /**
   * The port to run the server on.
   */


  private static final Log LOG = LogFactory.getLog(JettyServer.class);

  private static final String WEBAPP_WAR = "../webapp-test/target/test-webapp-0.1-SNAPSHOT.war";

  /**
   * the jetty server.
   */
  private final Server server;

  /**
   * Create a new Jetty Server.
   * 
   * @throws Exception if the jetty server wont create.
   */
  public JettyServer() throws Exception {
    server = createServer(JETTY_PORT);
  }

  /**
   * Start the jetty server up.
   * 
   * @throws Exception if the jetty server wont start.
   */
  public void start() throws Exception {
    server.start();
  }

  /**
   * Stop the server.
   * 
   * @throws Exception if the server fails to stop.
   */
  public void stop() throws Exception {
    server.stop();
  }

  /**
   * Starts the server for end-to-end tests.
   * 
   * @param port the port to open the server on.
   * @return the server to return.
   * @throws Exception if the server can't be created.
   */
  private Server createServer(final int port) throws Exception {
    
    
    KernelLoader kernelLoader = new KernelLoader();
    
    LOG.info("Starting servlet Context ");

    Server server = new Server();
    server.addLifeCycle(kernelLoader);

    QueuedThreadPool threadPool = new QueuedThreadPool();
    threadPool.setMaxThreads(100);
    server.setThreadPool(threadPool);

    Connector connector = new SelectChannelConnector();
    connector.setPort(JETTY_PORT);
    connector.setMaxIdleTime(30000);
    server.setConnectors(new Connector[] { connector });

    HandlerCollection handlers = new HandlerCollection();
    
    
    server.setHandler(handlers);

    // in a real server, this would be the webapp context class in the xml file
    SakaiWebAppContext wah = new SakaiWebAppContext(this.getClass().getClassLoader());
    wah.setWar(WEBAPP_WAR);
    wah.setContextPath("/");
    
    
    handlers.setHandlers(new Handler[] { wah });
    
    server.setStopAtShutdown(true);
    server.setSendServerVersion(true);

    server.start();
// uncomment to keep the server up    server.join();

    return server;
  }
}
