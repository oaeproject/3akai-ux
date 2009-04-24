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

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionDeniedException;
import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.util.PathSecurityAssertion;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;

/**
 */
public class PathSecurityAssertionTest {



  private static final String BASE_RESOURCE = "/Aresource";


  private static final String BASE_SECURED_PATH = "/somelocation";


  private String[] tests = { 
      "GET,/sfsfdffsd,/sfsfdffsd,m",
      getSpec("GET","/resourceA/1sdfsfd","g"),
      getSpec("GET","/resourceA/","d"),
      getSpec("PUT","/resourceA/3sdfsfd","g"),
      getSpec("PUT","/resourceA/","d"),
      getSpec("POST","/resourceA/4sdfsfd","g"),
      getSpec("POST","/resourceA/","d"),
      getSpec("DELETE","/resourceA/5sdfsfd","g"),
      getSpec("DELETE","/resourceA/","d"),
      getSpec("OPTIONS","/resourceA/6sdfsfd","d"),
      getSpec("OPTIONS","/resourceA/","d"),
      getSpec("BADMETHOD","/resourceA/7sdfsfd","m")
 
  };

  @Test 
  public void testAssertions() throws ServletException {

    AuthzResolverService authzResolverService = createMock(AuthzResolverService.class);
    Map<String,PermissionQuery> locks = new HashMap<String, PermissionQuery>();
    PermissionQuery getPermission = createMock(PermissionQuery.class);
    PermissionQuery putPermission = createMock(PermissionQuery.class);
    PermissionQuery postPermission = createMock(PermissionQuery.class);
    PermissionQuery deletePermission = createMock(PermissionQuery.class);
    PermissionQuery headPermission = createMock(PermissionQuery.class);
    PermissionQuery optionsPermission = createMock(PermissionQuery.class);
    locks.put("GET", getPermission);
    locks.put("PUT", putPermission);
    locks.put("POST", postPermission);
    locks.put("DELETE", deletePermission);
    locks.put("HEAD", headPermission);
    locks.put("OPTIONS", optionsPermission);

    PathSecurityAssertion psa = new PathSecurityAssertion(authzResolverService);
    psa.setBasePath(BASE_SECURED_PATH);
    psa.setBaseResource(BASE_RESOURCE);
    psa.setLocks(locks);

    for (String test : tests) {
      reset(authzResolverService);
      String[] t = test.split(",");
      boolean granted = "g".equals(t[3]);
      boolean denied = "d".equals(t[3]);
      boolean mismatch = "m".equals(t[3]);

      if ( ! mismatch ) {
        authzResolverService.check(t[2], locks.get(t[0]));
        if ( !granted || denied ) {
          expectLastCall().andThrow(new PermissionDeniedException());
        }
      }
      replay(authzResolverService);
      

      try {
        psa.check(t[0], t[1]);
        assertTrue("Checking "+t[0]+":"+t[1]+" to be granted "+granted,granted);
      } catch (PermissionDeniedException pde ) {
        assertTrue(denied);
      } catch (SDataException sde) {
        assertTrue(mismatch);
      }
      verify(authzResolverService);
    }
  }

  /**
   * @param string
   * @param string2
   * @param string3
   * @return
   */
  private String getSpec(String method, String path, String response) {
    return method+","+BASE_SECURED_PATH+path+","+BASE_RESOURCE+path+","+response;
  }

}
