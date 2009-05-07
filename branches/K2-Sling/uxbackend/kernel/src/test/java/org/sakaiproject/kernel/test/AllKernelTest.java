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
package org.sakaiproject.kernel.test;

import org.junit.AfterClass;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.authz.AclListenerT;
import org.sakaiproject.kernel.friend.FriendResolverServiceT;
import org.sakaiproject.kernel.jcr.smartNode.InboxActionUnitT;
import org.sakaiproject.kernel.jcr.smartNode.XpathSmartNodeHandlerT;
import org.sakaiproject.kernel.messaging.activemq.ActiveMQEmailDeliveryT;
import org.sakaiproject.kernel.rest.test.RestMySitesProviderKernelUnitT;
import org.sakaiproject.kernel.rest.test.RestPatchProviderKernelUnitT;
import org.sakaiproject.kernel.rest.test.RestSiteProviderKernelUnitT;
import org.sakaiproject.kernel.site.SiteServiceT;
import org.sakaiproject.kernel.util.JcrUtilsT;
import org.sakaiproject.kernel.webapp.test.SakaiAuthenticationFilterKernelUnitT;

/**
 *
 */
@RunWith(Suite.class)
@SuiteClasses( { CacheKernelUnitT.class, RepositoryKernelUnitT.class,
    ObservationKernelUnitT.class, AuthZServiceKernelUnitT.class,
    RequestFilterKernelUnitT.class, SakaiAuthenticationFilterKernelUnitT.class,
    SessionManagerServiceKernelUnitT.class, AclListenerT.class,
    SiteServiceT.class, RestSiteProviderKernelUnitT.class,
    RestPatchProviderKernelUnitT.class, RestMySitesProviderKernelUnitT.class,
    ActiveMQEmailDeliveryT.class, JcrUtilsT.class,
    XpathSmartNodeHandlerT.class, InboxActionUnitT.class, FriendResolverServiceT.class })
public class AllKernelTest {
  private static boolean shutdown;
  static {
    try {
      System.err.println("Starting Kernel +++++++++++++++++++++++");
      shutdown = KernelIntegrationBase.beforeClass();
    } catch (ComponentActivatorException e) {
      e.printStackTrace();
    }
  }

  @AfterClass
  public static void afterAllClasses() {
    System.err.println("Performing Shutdown ");
    KernelIntegrationBase.afterClass(shutdown);
  }

}
