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
import org.sakaiproject.sdata.tool.util.NullSecurityAssertion;
import org.sakaiproject.sdata.tool.util.ResourceDefinitionFactoryImpl;

import javax.servlet.http.HttpServletRequest;

/**
 * @author ieb
 */
public class ResourceDefinitionFactoryTest {

  private String[] basePaths = { "/", "/sakai", "/sakai/", null, "" };

  private String[] testPaths = { "/f/sdfsdfsdf", "/f/sdfsdf/", "/f/",
      "/f/sdfsdf/sdfsdf/sdfsdf/sdfssdf/12321",
      "/f/sdfsdfs/sdfsd/sdfsdf/sdfsdf/sdf/", "/f" };

  /**
	 * 
	 */
  @Test
  public void testCreation() {
    HttpServletRequest request = createMock(HttpServletRequest.class);

    for (String basePath : basePaths) {
      ResourceDefinitionFactoryImpl rdf = new ResourceDefinitionFactoryImpl(
          basePath, new NullSecurityAssertion());
      
      for (String testPath : testPaths) {
        reset(request);
        expect(request.getPathInfo()).andReturn(testPath).anyTimes();
        expect(request.getParameter((String) anyObject())).andReturn(null)
            .anyTimes();
        expect(request.getMethod()).andReturn("GET").anyTimes();
        replay(request);
        try {
          ResourceDefinition rd = rdf.getSpec(request);
          String rp = rd.getRepositoryPath();

          assertTrue("Repository Paths must not be null ", rp != null);
          assertTrue("Repository Paths must be absolute ", rp.startsWith("/"));
          assertTrue("Repository Paths must not end in /, except when root ",
              rp.equals("/") || !rp.endsWith("/"));
          assertTrue(
              "Repository Paths must not have white space at either end ", rp
                  .length() == rp.trim().length());
          assertTrue("Repository Paths must no have // ", rp.indexOf("//") < 0);
          String[] elements = rp.split("/");
          if (elements.length != 0) {
            @SuppressWarnings("unused")
            char c = elements[elements.length - 1].charAt(0);
          }
          rp = rd.convertToExternalPath(testPath);
          assertTrue("External Paths must not be null ", rp != null);
          // assertTrue("External Paths must not end in /, except when
          // root ",rp.equals("/") || !rp.endsWith("/"));
          assertTrue("External Paths must not have white space at either end ",
              rp.length() == rp.trim().length());
          assertTrue("External Patsh must no have // ", rp.indexOf("//") < 0);
          rp = rd.convertToAbsoluteRepositoryPath("extra");
          assertTrue("Extra Repository Paths must not be null ", rp != null);
          assertTrue("Extra Repository Paths must be absolute ", rp
              .startsWith("/"));
          assertTrue(
              "Extra Repository Paths must not end in /, except when root ", rp
                  .equals("/")
                  || !rp.endsWith("/"));
          assertTrue(
              "Extra Repository Paths must not have white space at either end ",
              rp.length() == rp.trim().length());
          assertTrue("Extra Repository Patsh must no have // ", rp
              .indexOf("//") < 0);
        } catch (SDataException sde) {
          fail("Problem with dispatcher " + sde.getMessage());
        }
        verify(request);

      }
    }

  }
}
