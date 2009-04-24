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
package org.sakaiproject.kernel.jcr.jackrabbit.sakai.test;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.SakaiUserPrincipalImpl;


/**
 * 
 */
public class SakaiUserPrincipalUT {

  @Test
  public void testSakaiUserPrincipal() {
    User user = createMock(User.class);
    User user2 = createMock(User.class);
    User user3 = createMock(User.class);
    
    expect(user.getUuid()).andReturn("uid:ib236").anyTimes();
    expect(user2.getUuid()).andReturn("uid:ib236").anyTimes();
    expect(user3.getUuid()).andReturn("uid:ib236-3").anyTimes();
    
    replay(user,user2,user3);
    SakaiUserPrincipalImpl sakaiPrincipal = new SakaiUserPrincipalImpl(user.getUuid());
    SakaiUserPrincipalImpl sakaiPrincipal2 = new SakaiUserPrincipalImpl(user2.getUuid());
    SakaiUserPrincipalImpl sakaiPrincipal3 = new SakaiUserPrincipalImpl(user3.getUuid());
    assertTrue(sakaiPrincipal.equals(sakaiPrincipal2));
    assertFalse(sakaiPrincipal.equals(sakaiPrincipal3));
    assertEquals("SakaiUserPrincipal", sakaiPrincipal.toString());
    sakaiPrincipal.hashCode();
    assertEquals("uid:ib236", sakaiPrincipal.getName());
    
    verify(user,user2,user3);
  }
}
