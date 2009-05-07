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
package org.sakaiproject.kernel.jcr.smartNode;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;

import org.easymock.EasyMock;
import org.junit.BeforeClass;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.SakaiJCRCredentials;
import org.sakaiproject.kernel.test.KernelIntegrationBase;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.jcr.Session;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 */
public abstract class SmartNodeHandlerBaseT {
  private static boolean shutdown;
  protected static Session session;
  protected static JCRNodeFactoryService nodeFactory;
  protected static RegistryService registryService;
  protected static JCRService jcrService;

  protected final String prefix = "/userenv/test/";
  protected final String randomFolder = "randomFolder1/";
  protected final String[] randomFiles = new String[] { "random1.file",
      "random2.file", "random3.file" };

  protected ServletOutputStream outputStream;
  protected HttpServletRequest request;
  protected HttpServletResponse response;

  @BeforeClass
  public static void beforeClass() throws Exception {
    shutdown = KernelIntegrationBase.beforeClass();

    KernelManager km = new KernelManager();
    Kernel kernel = km.getKernel();
    nodeFactory = kernel.getService(JCRNodeFactoryService.class);

    jcrService = kernel.getService(JCRService.class);
    registryService = kernel.getService(RegistryService.class);

    // login to the repo with super admin
    SakaiJCRCredentials credentials = new SakaiJCRCredentials();
    session = jcrService.getRepository().login(credentials);
    jcrService.setSession(session);
  }

  public static void afterClass() throws Exception {
    KernelIntegrationBase.afterClass(shutdown);
  }

  public void setUp() throws Exception {
    request = createMock(HttpServletRequest.class);
    response = createMock(HttpServletResponse.class);
    outputStream = new TestServletOutputStream();
    expect(response.getOutputStream()).andReturn(outputStream);
    response.setContentType((String) EasyMock.anyObject());
    expectLastCall();
    response.setContentLength(EasyMock.anyInt());
    expectLastCall();
    replay(request, response);
  }

  public void tearDown() throws Exception {

  }

  static class TestServletOutputStream extends ServletOutputStream {
    private ByteArrayOutputStream outputStream;

    public TestServletOutputStream() {
      outputStream = new ByteArrayOutputStream();
    }

    /**
     * {@inheritDoc}
     *
     * @see java.io.OutputStream#write(int)
     */
    @Override
    public void write(int b) throws IOException {
      outputStream.write(b);
    }

    @Override
    public String toString() {
      String s = "";
      try {
        s = new String(outputStream.toByteArray(), "UTF-8");
      } catch (UnsupportedEncodingException e) {

      }
      return s;
    }
  }
}
