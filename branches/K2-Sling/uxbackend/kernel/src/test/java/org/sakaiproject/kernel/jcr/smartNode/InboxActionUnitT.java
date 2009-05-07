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

import net.sf.json.JSONArray;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.util.JcrUtils;
import org.sakaiproject.kernel.util.ResourceLoader;

import java.io.InputStream;

import javax.jcr.Node;
import javax.jcr.query.Query;

public class InboxActionUnitT extends SmartNodeHandlerBaseT {

  private static final Log LOG = LogFactory.getLog(InboxActionUnitT.class);

  private static final String TEST_MSG1 = "res://org/sakaiproject/kernel/test/samplemessages/msg1";
  private static final String TEST_MSG2 = "res://org/sakaiproject/kernel/test/samplemessages/msg2";
  private static final String PREFIX = "/somepath/msgs/";
  private static final String[] MSG_PATHS1 = { "2008/11/msg1.json",
      "2008/11/msg2.json", "2008/12/msg1.json", "2009/01/msg1.json",
      "2009/01/msg2.json" };
  private static final String[] MSG_PATHS2 = { "2008/12/msg2.json",
      "2009/01/msg3.json" };
  private static final String INBOX_LABEL = "inbox";

  private Node inboxNode = null;

  protected XpathSmartNodeHandler xpathHandler;
  protected SqlSmartNodeHandler sqlHandler;

  @BeforeClass
  public static void beforeThisClass() throws Exception {
    SmartNodeHandlerBaseT.beforeClass();

    // make a couple of directories with messages in them
    LOG.info("Creating test messages.");
    for (String path : MSG_PATHS1) {
      InputStream in = ResourceLoader.openResource(TEST_MSG1,
          InboxActionUnitT.class.getClassLoader());
      Node n = nodeFactory.setInputStream(PREFIX + path, in,
          RestProvider.CONTENT_TYPE);
      JcrUtils.addNodeLabel(jcrService, n, INBOX_LABEL);
      in.close();
    }

    for (String path : MSG_PATHS2) {
      InputStream in = ResourceLoader.openResource(TEST_MSG2,
          InboxActionUnitT.class.getClassLoader());
      Node n = nodeFactory.setInputStream(PREFIX + path, in,
          RestProvider.CONTENT_TYPE);
      JcrUtils.addNodeLabel(jcrService, n, INBOX_LABEL);
      in.close();
    }
  }

  @AfterClass
  public static void afterClass() throws Exception {
    SmartNodeHandlerBaseT.afterClass();
  }

  @Override
  @Before
  public void setUp() throws Exception {
    super.setUp();

    // make a smart node that condenses the directories into a single inbox
    inboxNode = nodeFactory.createFolder(PREFIX + "inbox");
    session.save();

    xpathHandler = new XpathSmartNodeHandler(registryService, jcrService);
    sqlHandler = new SqlSmartNodeHandler(registryService, jcrService);
  }

  @Override
  @After
  public void tearDown() throws Exception {
    super.tearDown();

    inboxNode.remove();
    session.save();
  }

  @Test
  public void inboxByXpath() throws Exception {
    String query = "/" + PREFIX + "/element(*, " + JCRConstants.NT_FILE + ")[@"
        + JCRConstants.JCR_LABELS + "='" + INBOX_LABEL + "']";
    JcrUtils.makeSmartNode(inboxNode, Query.XPATH, query);
    session.save();

    xpathHandler.handle(request, response, inboxNode, inboxNode, query);

    String json = outputStream.toString();
    System.err.println("Results: " + json);

    JSONArray jsonArray = JSONArray.fromObject(json);

    // get a count of the items in inbox and verify it
    Assert.assertEquals(7, jsonArray.size());

    // get the items in inbox and verify them
  }

  @Test
  public void inboxBySql() throws Exception {
    String query = "select * from " + JCRConstants.NT_BASE + " where "
        + JCRConstants.JCR_PATH + " like '" + PREFIX + "%' and "
        + JCRConstants.JCR_LABELS + " = '" + INBOX_LABEL + "'";
    JcrUtils.makeSmartNode(inboxNode, Query.XPATH, query);
    session.save();

    sqlHandler.handle(request, response, inboxNode, inboxNode, query);

    String json = outputStream.toString();
    System.err.println("Results: " + json);

    JSONArray jsonArray = JSONArray.fromObject(json);

    // get a count of the items in inbox and verify it
    Assert.assertEquals(7, jsonArray.size());
  }

  @Ignore
  // count is not available in JCR
  public void inboxCount() throws Exception {
    String statement = "select count() from nt:file where jcr:path like "
        + prefix + "%";
    sqlHandler.handle(request, response, inboxNode, inboxNode, statement);
  }
}
