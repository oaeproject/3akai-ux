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
package org.sakaiproject.kernel.rest.me.test;

import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.easymock.Capture;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.rest.me.RestMeProvider;
import org.sakaiproject.kernel.rest.test.BaseRestUT;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;

import javax.jcr.RepositoryException;
import javax.servlet.ServletException;

/**
 * 
 */
public class RestMeProviderTest extends BaseRestUT {

  private RestMeProvider rmp;

  @Test
  public void testAnonGet() throws ServletException, IOException,
      RepositoryException, JCRNodeFactoryServiceException {
    setupServices();
    newSession();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("user1", baos);

    // expect(request.getParameter("friendUuid")).andReturn(null);
    // expect(request.getParameter("message")).andReturn(null);
    Locale locale = new Locale("en", "US");
    expect(request.getLocale()).andReturn(locale).anyTimes();
    expect(session.getAttribute("sakai.locale.")).andReturn(null).anyTimes();

    expect(userEnvironmentResolverService.getUserLocale(locale, sakaiSession))
        .andReturn(locale).anyTimes();

    UserEnvironment userEnvironment = createMock(UserEnvironment.class);

    expect(userEnvironmentResolverService.resolve(user)).andReturn(
        userEnvironment).anyTimes();
    expect(userEnvironment.getUser()).andReturn(user).anyTimes();

    Capture<Map<String, Object>> responseMap = new Capture<Map<String, Object>>();
    expect(beanConverter.convertToString(capture(responseMap))).andReturn("OK")
        .atLeastOnce();

    userEnvironment.setProtected(true);
    expectLastCall();
    userEnvironment.setProtected(false);
    expectLastCall();

    expect(userFactoryService.getUserPathPrefix("user1")).andReturn(
        "somepath1/").anyTimes();
    expect(userFactoryService.getUserProfilePath("user1")).andReturn(
        "somepath2/").anyTimes();
    expect(jcrNodeFactoryService.getInputStream("somepath1/")).andReturn(null)
        .anyTimes();
    expect(jcrNodeFactoryService.getInputStream("somepath2/")).andReturn(null)
        .anyTimes();

    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall().atLeastOnce();

    replayMocks(userEnvironment);

    createProvider();

    rmp.dispatch(new String[] { "me" }, request, response);
    String responseString = new String(baos.toByteArray(), "UTF-8");

    System.err.println("Response Wasxxxx " + responseString);
    assertTrue(responseString.indexOf("uuid") < 0);

    verifyMocks(userEnvironment);

  }

  /**
   * 
   */
  private void createProvider() {
    rmp = new RestMeProvider(registryService, sessionManagerService,
        jcrNodeFactoryService, userResolverService, defaultUserInfoParser,
        userFactoryService, beanConverter, userEnvironmentResolverService);
  }

  @Test
  public void testAnonGetOther() throws ServletException, IOException {
    setupServices();
    newSession();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("user1", baos);

    expect(request.getLocale()).andReturn(new Locale("en", "US")).anyTimes();
    expect(session.getAttribute("sakai.locale.")).andReturn(null).anyTimes();

    expect(userResolverService.resolveWithUUID("garbage")).andReturn(null)
        .anyTimes();
    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall().atLeastOnce();
    Capture<Map<String, String>> responseMap = new Capture<Map<String, String>>();
    String testResponse = "{\"tested\":\"true\"}";
    expect(beanConverter.convertToString(capture(responseMap))).andReturn(
        testResponse);

    replayMocks();
    createProvider();

    rmp.dispatch(new String[] { "me", "garbage" }, request, response);

    String responseString = new String(baos.toByteArray(), "UTF-8");
    System.err.println("Response Testing garbage " + responseString);
    Map<String, String> rm = responseMap.getValue();
    assertEquals("404", rm.get("statusCode"));
    assertEquals("garbage", rm.get("userId"));

    verifyMocks();
  }

  @Test
  public void testUserNoEnv() throws ServletException, IOException,
      RepositoryException, JCRNodeFactoryServiceException {
    setupServices();
    newSession();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    setupAnyTimes("user1", baos);

    Locale locale = new Locale("en", "US");
    expect(request.getLocale()).andReturn(locale).anyTimes();
    expect(session.getAttribute("sakai.locale.")).andReturn(null).anyTimes();

    expect(userEnvironmentResolverService.getUserLocale(locale, sakaiSession))
        .andReturn(locale).anyTimes();

    expect(userEnvironmentResolverService.resolve(user)).andReturn(null)
        .anyTimes();
    response.setContentType(RestProvider.CONTENT_TYPE);
    expectLastCall().atLeastOnce();

    Capture<Map<String, Object>> responseMap = new Capture<Map<String, Object>>();
    expect(beanConverter.convertToString(capture(responseMap))).andReturn("OK")
        .atLeastOnce();

    expect(userFactoryService.getUserPathPrefix("user1")).andReturn(
        "somepath1/").atLeastOnce();
    expect(userFactoryService.getUserProfilePath("user1")).andReturn(
        "somepath2/").atLeastOnce();
    expect(jcrNodeFactoryService.getInputStream("somepath2/")).andReturn(null)
        .atLeastOnce();

    replayMocks();
    createProvider();

    rmp.dispatch(new String[] { "me" }, request, response);

    String responseString = new String(baos.toByteArray(), "UTF-8");
    System.err.println("Response Was " + responseString);

    verifyMocks();
  }

}
