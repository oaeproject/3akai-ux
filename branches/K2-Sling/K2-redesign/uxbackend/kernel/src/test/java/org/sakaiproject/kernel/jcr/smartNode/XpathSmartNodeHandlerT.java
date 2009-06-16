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

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.util.JcrUtils;

import javax.jcr.Node;
import javax.jcr.query.Query;

/**
 *
 */
public class XpathSmartNodeHandlerT extends SmartNodeHandlerBaseT {
  protected Node baseFolder;
  protected XpathSmartNodeHandler handler;

  @BeforeClass
  public static void beforeClass() throws Exception {
    SmartNodeHandlerBaseT.beforeClass();
  }

  @AfterClass
  public static void afterClass() throws Exception {
    SmartNodeHandlerBaseT.afterClass();
  }

  @Override
  @Before
  public void setUp() throws Exception {
    super.setUp();

    handler = new XpathSmartNodeHandler(registryService, jcrService);

    baseFolder = nodeFactory.createFolder(prefix + randomFolder);
    for (String file : randomFiles) {
      nodeFactory.createFile(prefix + randomFolder + file, "text/plain");
    }

    session.save();
  }

  @Override
  @After
  public void tearDown() throws Exception {
    super.tearDown();

    baseFolder.remove();
    session.save();
  }

  @Test
  public void getAllFilesAtPath() throws Exception {
    String statement = "/" + prefix + randomFolder + "/element(*, "
        + JCRConstants.NT_FILE + ")";
    System.err.println("Statement: " + statement);
    JcrUtils.makeSmartNode(baseFolder, Query.XPATH, statement);
    session.save();

    handler.handle(request, response, baseFolder, baseFolder, statement);

    String json = outputStream.toString();
    System.err.println("Results: " + json);

    JSONArray jsonArray = JSONArray.fromObject(json);
    Assert.assertEquals(3, jsonArray.size());
  }
}
