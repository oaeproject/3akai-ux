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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.util.IOUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import javax.jcr.LoginException;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.transaction.HeuristicMixedException;
import javax.transaction.HeuristicRollbackException;
import javax.transaction.NotSupportedException;
import javax.transaction.RollbackException;
import javax.transaction.SystemException;
import javax.transaction.TransactionManager;

/**
 * 
 */
public class RepositoryKernelUnitT extends KernelIntegrationBase {

  private static final Log LOG = LogFactory.getLog(RepositoryKernelUnitT.class);
  private static boolean shutdown;

  @BeforeClass
  public static void beforeThisClass() throws ComponentActivatorException {
    shutdown = KernelIntegrationBase.beforeClass();
  }

  @AfterClass
  public static void afterClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  @Test
  public void testJCRNodeFactory() throws JCRNodeFactoryServiceException,
      LoginException, RepositoryException, IOException, NotSupportedException, SystemException, SecurityException, IllegalStateException, RollbackException, HeuristicMixedException, HeuristicRollbackException {
    KernelManager km = new KernelManager();
    Kernel kernel = km.getKernel();
    JCRNodeFactoryService jcrNodeFactoryService = kernel
        .getService(JCRNodeFactoryService.class);
    TransactionManager transactionManager = kernel.getService(TransactionManager.class);
    JCRService jcrService = kernel.getService(JCRService.class);
    
    LOG.info("===============================STARTING TEST=================================");
    LOG.info("===============================STARTING TEST=================================");
    LOG.info("===============================STARTING TEST=================================");
    LOG.info("===============================STARTING TEST=================================");
    LOG.info("===============================STARTING TEST=================================");
    long start = System.currentTimeMillis();
    transactionManager.begin();
    Session session = jcrService.loginSystem();
    LOG.info("===============================SESSION STARTED=================================");
    LOG.info("===============================SESSION STARTED=================================");
    LOG.info("===============================SESSION STARTED=================================");
    LOG.info("===============================SESSION STARTED=================================");
    
    LOG.info("===============================STARTING TEST=================================");
    LOG.info("===============================STARTING TEST=================================");
    LOG.info("===============================STARTING TEST=================================");
    LOG.info("===============================STARTING TEST=================================");
    LOG.info("===============================STARTING TEST=================================");
    jcrNodeFactoryService.createFile("/test/test.txt",
        RestProvider.CONTENT_TYPE);
    LOG.info("===============================SESSION SAVE OPERAION=================================");
    LOG.info("===============================SESSION SAVE OPERAION=================================");
    LOG.info("===============================SESSION SAVE OPERAION=================================");
    LOG.info("===============================SESSION SAVE OPERAION=================================");
    session.save();
    LOG.info("===============================SAVE COMPLETE=================================");
    LOG.info("===============================SAVE COMPLETE=================================");
    LOG.info("===============================SAVE COMPLETE=================================");
    LOG.info("===============================SAVE COMPLETE=================================");
    LOG.info("===============================STARTING TEST2=================================");
    LOG.info("===============================STARTING TEST2=================================");
    LOG.info("===============================STARTING TEST2=================================");
    LOG.info("===============================STARTING TEST2=================================");
    LOG.info("===============================STARTING TEST2=================================");
    jcrNodeFactoryService.createFile("/test/test2.txt",
        RestProvider.CONTENT_TYPE);
    LOG.info("===============================SESSION SAVE OPERAION2=================================");
    LOG.info("===============================SESSION SAVE OPERAION2=================================");
    LOG.info("===============================SESSION SAVE OPERAION2=================================");
    LOG.info("===============================SESSION SAVE OPERAION2=================================");
    session.save();
    LOG.info("===============================SAVE COMPLETE2=================================");
    LOG.info("===============================SAVE COMPLETE2=================================");
    LOG.info("===============================SAVE COMPLETE2=================================");
    LOG.info("===============================SAVE COMPLETE2=================================");
    transactionManager.commit();
    LOG.info("===============================COMMIT COMPLETE=================================");
    LOG.info("===============================COMMIT COMPLETE=================================");
    LOG.info("===============================COMMIT COMPLETE=================================");
    LOG.info("===============================COMMIT COMPLETE=================================");
    LOG.info("===============================COMMIT COMPLETE=================================");
    long end = System.currentTimeMillis()-start;
    LOG.info("== "+end+" (ms)=============================DONE TEST=================================");
    LOG.info("== "+end+" (ms)=============================DONE TEST=================================");
    LOG.info("== "+end+" (ms)=============================DONE TEST=================================");
    LOG.info("== "+end+" (ms)=============================DONE TEST=================================");
    LOG.info("== "+end+" (ms)=============================DONE TEST=================================");

    jcrNodeFactoryService.createFolder("/test/newfolder");
    session.save();
    ByteArrayInputStream bais = new ByteArrayInputStream("testvalue"
        .getBytes("UTF-8"));
    jcrNodeFactoryService.setInputStream("/test/test.txt", bais,
        RestProvider.CONTENT_TYPE);
    session.save();
    
    
    String result = IOUtils.readFully(jcrNodeFactoryService
        .getInputStream("/test/test.txt"), "UTF-8");
    assertEquals("testvalue", result);
    Node n = jcrNodeFactoryService.getNode("/test/test.txt");
    assertNotNull(n);
    jcrService.logout();
  }

}
