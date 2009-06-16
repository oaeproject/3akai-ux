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
package org.sakaiproject.sdata.tool.test;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Test;
import org.sakaiproject.sdata.tool.api.ResourceDefinition;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.util.UserResourceDefinitionFactory;

import javax.servlet.http.HttpServletRequest;

/**
 * 
 */
public class UserResourceDefinitionFactoryTest {

  private static final String[] users = { null, "", "test", "~test" };

  private String[] basePaths = { "/", "/sakai", "/sakai/", null, "" };

  private String[] testPaths = { "sdfsdfsdf", "sdfsdf/", "/",
      "/sdfsdf/sdfsdf/sdfsdf/sdfssdf/12321",
      "sdfsdfs/sdfsd/sdfsdf/sdfsdf/sdf/", "" };

  @Test
  public void testCreation() {
    HttpServletRequest request = createMock(HttpServletRequest.class);

    for (String basePath : basePaths) {
      UserResourceDefinitionFactory rdf = new UserResourceDefinitionFactory(
          basePath);

      for (String testPath : testPaths) {
        for (String user : users) {
          reset(request);

          expect(request.getPathInfo()).andReturn(testPath).anyTimes();
          expect(request.getParameter((String) anyObject())).andReturn(null)
              .anyTimes();
          expect(request.getMethod()).andReturn("GET").anyTimes();
          expect(request.getRemoteUser()).andReturn(user).anyTimes();

          replay(request);
          try {
            ResourceDefinition rd = rdf.getSpec(request);
            String rp = rd.getRepositoryPath();
            
            System.err.println("Got Path "+rp);

            assertTrue("Repository Paths must not be null ", rp != null);
            assertTrue("Repository Paths must be absolute ", rp.startsWith("/"));
            assertTrue("Repository Paths must not end in /, except when root ",
                rp.equals("/") || !rp.endsWith("/"));
            assertTrue(
                "Repository Paths must not have white space at either end ", rp
                    .length() == rp.trim().length());
            assertTrue("Repository Paths must no have // ",
                rp.indexOf("//") < 0);
            rp = rd.convertToExternalPath(testPath);
            
            assertTrue("External Paths must not be null ", rp != null); //
            assertTrue(
                "External Paths must not end in /, except // when // root", rp
                    .equals("/")
                    || !rp.endsWith("/"));
            assertTrue(
                "External Paths must not have white space at either end ", rp
                    .length() == rp.trim().length());
            assertTrue("External Patsh must no have // ", rp.indexOf("//") < 0);
            rp = rd.convertToAbsoluteRepositoryPath("extra");
            assertTrue("Extra Repository Paths must not be null ", rp != null);
            assertTrue("Extra Repository Paths must be absolute ", rp
                .startsWith("/"));
            assertTrue(
                "Extra Repository Paths must not end in /, except when root ",
                rp.equals("/") || !rp.endsWith("/"));
            assertTrue(
                "Extra Repository Paths must not have white space at either end ",
                rp.length() == rp.trim().length());
            assertTrue("Extra Repository Patsh must no have // ", rp
                .indexOf("//") < 0);
          } catch (SDataException sde) {
            if (user != null && user.trim().length() != 0) {
              fail("Problem with dispatcher " + sde.getMessage());
            }
          }
          verify(request);
        }

      }
    }
  }

}
