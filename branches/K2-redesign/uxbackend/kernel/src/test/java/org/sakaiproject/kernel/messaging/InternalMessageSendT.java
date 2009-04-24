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
package org.sakaiproject.kernel.messaging;

import static junit.framework.Assert.assertEquals;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessagingService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.test.KernelIntegrationBase;
import org.sakaiproject.kernel.util.ISO9075;

import javax.jcr.query.Query;
import javax.jcr.query.QueryResult;

/**
 *
 */
public class InternalMessageSendT {
  private static boolean shutdown;
  private static KernelManager km;
  private static MessagingService msgServ;
  private static UserFactoryService userFactory;
  private static JCRService jcr;
  private Message msg;

  @BeforeClass
  public static void beforeClass() throws Exception {
    shutdown = KernelIntegrationBase.beforeClass();

    km = new KernelManager();
    msgServ = km.getService(MessagingService.class);
    userFactory = km.getService(UserFactoryService.class);
    jcr = km.getService(JCRService.class);
    jcr.loginSystem();
  }

  @AfterClass
  public static void afterClass() throws Exception {
    jcr.logout();
    KernelIntegrationBase.afterClass(shutdown);
  }

  @Before
  public void setUp() throws Exception {
    msg = msgServ.createMessage();
  }

  /**
   * Send a simple (1 recipient, text body) message.<br/>
   * Verify the following:<br/>
   * <ol>
   * <li>The message exists in the common store of the recipient and is labeled
   * 'inbox'.</li>
   * <li>The message exists in the common store of the sender and is labeled
   * 'sent'.</li>
   * <li>The message does not exist in the outbox of the sender.</li>
   * </ol>
   * 
   * @throws Exception
   */
  @Test
  public void sendSimpleInternalMessage() throws Exception {
    msg.setFrom("carl");
    msg.addTo("stuart");
    msg.setSubject("unit test message");
    msg.setText("this is a simple message from a unit test.");

    msgServ.send(msg);
    jcr.save();

    // wait for delivery
    Thread.yield();
    Thread.sleep(1000);
    jcr.save();

    String inPath = userFactory.getNewMessagePath(msg.getTo());
    System.err.println("Looking for " + inPath);

    // verify message in common message store for recipient and is labeled
    // 'inbox'.
    // String queryString = "select * from " + JCRConstants.NT_BASE + " where "
    // + JCRConstants.JCR_PATH + " like '" + inPath + "/%' and "
    // + JCRConstants.JCR_LABELS + " = 'inbox'";
    String queryString = "/" + ISO9075.encodePath(inPath) + "//element(*,"
        + JCRConstants.NT_FILE + ")[@" + JCRConstants.JCR_LABELS + "='inbox']";
    System.err.println(queryString);
    Query query = jcr.getQueryManager().createQuery(queryString, Query.XPATH);
    QueryResult results = query.execute();
    assertEquals(1, results.getNodes().getSize());

    // verify message in common message store for sender and is labeled 'sent'
    String senderPath = "/" + userFactory.getMessagesPath(msg.getFrom());
    queryString = ISO9075.encodePath(senderPath) + "//element(*,"
        + JCRConstants.NT_FILE + ")[@" + JCRConstants.JCR_LABELS + "='sent']";
    query = jcr.getQueryManager().createQuery(queryString, Query.XPATH);
    results = query.execute();
    assertEquals(1, results.getNodes().getSize());

    // verify message was removed from outbox
    String outPath = senderPath + "/" + KernelConstants.OUTBOX;
    queryString = ISO9075.encodePath(outPath) + "//element(*,"
        + JCRConstants.NT_FILE + ")";
    query = jcr.getQueryManager().createQuery(queryString, Query.XPATH);
    results = query.execute();
    assertEquals(0, results.getNodes().getSize());
  }
}
