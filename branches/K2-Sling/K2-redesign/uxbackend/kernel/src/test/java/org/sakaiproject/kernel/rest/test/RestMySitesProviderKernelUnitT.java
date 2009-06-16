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
package org.sakaiproject.kernel.rest.test;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.SakaiJCRCredentials;
import org.sakaiproject.kernel.rest.RestMySitesProvider;
import org.sakaiproject.kernel.test.KernelIntegrationBase;
import org.sakaiproject.kernel.webapp.SakaiServletRequest;
import org.sakaiproject.kernel.webapp.test.InternalUser;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Locale;

import javax.jcr.LoginException;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 *
 */
public class RestMySitesProviderKernelUnitT extends KernelIntegrationBase {

  private static final Log LOG = LogFactory
      .getLog(RestMySitesProviderKernelUnitT.class);

  private static boolean shutdownKernel;

  @BeforeClass
  public static void beforeThisClass() throws Exception {
    shutdownKernel = KernelIntegrationBase.beforeClass();
    KernelIntegrationBase.loadTestUsers();
    KernelIntegrationBase.loadTestSites();
  }

  @AfterClass
  public static void afterClass() {
    KernelIntegrationBase.afterClass(shutdownKernel);
  }

  @Test
  public void testUserWithEnv() throws ServletException, IOException,
      JCRNodeFactoryServiceException, LoginException, RepositoryException {

    KernelManager km = new KernelManager();
    SessionManagerService sessionManagerService = km
        .getService(SessionManagerService.class);
    CacheManagerService cacheManagerService = km
        .getService(CacheManagerService.class);
    UserResolverService userResolverService = km
        .getService(UserResolverService.class);
    AuthzResolverService authzResolverService = km
        .getService(AuthzResolverService.class);
    JCRService jcrService = km.getService(JCRService.class);
    // bypass security
    authzResolverService.setRequestGrant("Populating Test JSON");

    // login to the repo with super admin
    SakaiJCRCredentials credentials = new SakaiJCRCredentials();
    Session jsession = jcrService.getRepository().login(credentials);
    jcrService.setSession(jsession);

    // setup the user environment for the admin user.
    /*
     * for (String userName : USERS) { String prefix =
     * PathUtils.getUserPrefix(userName); String userEnvironmentPath =
     * "/userenv" + prefix + "userenv";
     *
     * LOG.info("Saving "+userEnvironmentPath);
     * jcrNodeFactoryService.createFile(userEnvironmentPath); InputStream in =
     * ResourceLoader.openResource(USERBASE + userName + ".json",
     * RestMySitesProviderTest.class.getClassLoader());
     * jcrNodeFactoryService.setInputStream(userEnvironmentPath, in);
     * jsession.save(); in.close(); }
     */

    LOG.info("Getting RestMySitesProvider using key: "
        + RestMySitesProvider.SITES_ELEMENT);
    RegistryService registryService = km.getService(RegistryService.class);
    Registry<String, RestProvider> registry = registryService
        .getRegistry(RestProvider.REST_REGISTRY);
    RestMySitesProvider rmsp = (RestMySitesProvider) registry.getMap().get(
        RestMySitesProvider.SITES_ELEMENT);
    for (String key : registry.getMap().keySet()) {
      LOG.info(key + "--->" + registry.getMap().get(key));
    }
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    HttpSession session = createMock(HttpSession.class);

    Assert.assertNotNull(rmsp);

    expect(request.getAttribute("_no_session")).andReturn(null).anyTimes();

    expect(request.getSession(true)).andReturn(session).anyTimes();
    expect(request.getAttribute("_uuid")).andReturn(null).anyTimes();
    expect(session.getAttribute("_u")).andReturn(new InternalUser("ib236"))
        .anyTimes();
    expect(session.getAttribute("_uu")).andReturn(null).anyTimes();
    expect(request.getLocale()).andReturn(new Locale("en", "US")).anyTimes();
    expect(session.getAttribute("sakai.locale.")).andReturn(null).anyTimes();
    expect(
        request.getParameter(RestMySitesProvider.INPUT_PARAM_NAME_STARTINDEX))
        .andReturn(null).anyTimes();
    expect(request.getParameter(RestMySitesProvider.INPUT_PARAM_NAME_COUNT))
        .andReturn(null).anyTimes();
    expect(request.getRequestedSessionId()).andReturn("sessionId").anyTimes();

    Cookie c = new Cookie("JSESSIONID", "sessionId");

    expect(request.getCookies()).andReturn(new Cookie[] { c }).anyTimes();
    expect(session.getId()).andReturn("sessionId").anyTimes();
    response.addCookie((Cookie) anyObject());
    expectLastCall().atLeastOnce();
    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall().atLeastOnce();
    final ByteArrayOutputStream baos = new ByteArrayOutputStream();
    expect(response.getOutputStream()).andReturn(new ServletOutputStream() {

      @Override
      public void write(int b) throws IOException {
        baos.write(b);
      }

    });
    expectLastCall().atLeastOnce();
    replay(request, response, session);

    SakaiServletRequest sakaiServletRequest = new SakaiServletRequest(request,
        response, userResolverService, sessionManagerService);
    sessionManagerService.bindRequest(sakaiServletRequest);

    LOG.info("Dispatching to provider... /rest/"
        + RestMySitesProvider.SITES_ELEMENT);
    rmsp.dispatch(new String[] { RestMySitesProvider.SITES_ELEMENT }, request,
        response);

    String responseString = new String(baos.toByteArray(), "UTF-8");
    LOG.info("Response was " + responseString);
// FIXME: My sites works differently at the moment.    assertTrue(responseString.indexOf("\"entry\"") > 0);

    cacheManagerService.unbind(CacheScope.REQUEST);
    verify(request, response, session);

  }

}
