/*
 * Licensed to the Sakai Foundation (SF) under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership. The SF licenses this file to you
 * under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the
 * License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under the License.
 */
package org.sakaiproject.kernel.util;

import static junit.framework.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.locking.Lock;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.test.KernelIntegrationBase;

import java.util.Random;

import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.Session;
import javax.jcr.Value;

/**
 *
 */
public class JcrUtilsT {
  protected static final Log LOG = LogFactory.getLog(JcrUtilsT.class);
  private static JCRNodeFactoryService nodeFactory;
  private static boolean shutdown;

  private static final String randomFile1 = "/userenv/test/random1.file";

  private static JCRService jcrService;
  private int running;
  private int failed;
  protected int locked;
  protected static CacheManagerService cacheManagerService;

  @BeforeClass
  public static void beforeThisClass() throws Exception {
    shutdown = KernelIntegrationBase.beforeClass();

    KernelManager km = new KernelManager();
    Kernel kernel = km.getKernel();
    nodeFactory = kernel.getService(JCRNodeFactoryService.class);

    jcrService = kernel.getService(JCRService.class);

    cacheManagerService = kernel.getService(CacheManagerService.class);

  }

  @Before
  public void setUp() throws Exception {
    Session session = jcrService.loginSystem();
    nodeFactory.createFile(randomFile1, "text/plain");
    session.save();
    jcrService.logout();
  }

  @After
  public void tearDown() throws Exception {
    jcrService.logout();
    Session session = jcrService.loginSystem();
    Node node = nodeFactory.getNode(randomFile1);
    node.remove();
    session.save();
    jcrService.logout();
  }

  @AfterClass
  public static void afterClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  @Test
  public void addLabel() throws Exception {
    Session session = jcrService.loginSystem();
    Node node = nodeFactory.getNode(randomFile1);
    jcrService.lock(node);
    JcrUtils.addNodeLabel(jcrService, node, "test label");
    session.save();

    assertTrue(node.hasProperty(JCRConstants.JCR_LABELS));
    Property prop = node.getProperty(JCRConstants.JCR_LABELS);
    Value[] values = prop.getValues();
    assertEquals(1, values.length);
    assertEquals("test label", values[0].getString());
  }

  @Test
  public void addMultipleLabels() throws Exception {
    Session session = jcrService.loginSystem();
    Node node = nodeFactory.getNode(randomFile1);
    JcrUtils.addNodeLabel(jcrService, node, "test label");
    JcrUtils.addNodeLabel(jcrService, node, "another test label");
    session.save();

    assertTrue(node.hasProperty(JCRConstants.JCR_LABELS));
    Property prop = node.getProperty(JCRConstants.JCR_LABELS);
    Value[] values = prop.getValues();
    assertEquals(2, values.length);
    assertEquals("test label", values[0].getString());
    assertEquals("another test label", values[1].getString());
  }

  @Test
  public void removeLabel() throws Exception {
    Session session = jcrService.loginSystem();
    Node node = nodeFactory.getNode(randomFile1);
    JcrUtils.addNodeLabel(jcrService, node, "test label");
    JcrUtils.addNodeLabel(jcrService, node, "another test label");
    session.save();

    assertTrue(node.hasProperty(JCRConstants.JCR_LABELS));

    JcrUtils.removeNodeLabel(jcrService, node, "test label");
    session.save();

    assertTrue(node.hasProperty(JCRConstants.JCR_LABELS));
    Property prop = node.getProperty(JCRConstants.JCR_LABELS);
    Value[] values = prop.getValues();
    assertEquals(1, values.length);
    assertEquals("another test label", values[0].getString());
  }

  @Test
  public void removeLabels() throws Exception {
    Session session = jcrService.loginSystem();
    Node node = nodeFactory.getNode(randomFile1);
    JcrUtils.addNodeLabel(jcrService, node, "test label");
    JcrUtils.addNodeLabel(jcrService, node, "another test label");
    JcrUtils.addNodeLabel(jcrService, node, "yet another test label");
    session.save();

    assertTrue(node.hasProperty(JCRConstants.JCR_LABELS));

    JcrUtils.removeNodeLabel(jcrService, node, "test label");
    session.save();

    assertTrue(node.hasProperty(JCRConstants.JCR_LABELS));
    Property prop = node.getProperty(JCRConstants.JCR_LABELS);
    Value[] values = prop.getValues();
    assertEquals(2, values.length);
    assertEquals("another test label", values[0].getString());
    assertEquals("yet another test label", values[1].getString());

    JcrUtils.removeNodeLabel(jcrService, node, "yet another test label");
    session.save();

    assertTrue(node.hasProperty(JCRConstants.JCR_LABELS));
    prop = node.getProperty(JCRConstants.JCR_LABELS);
    values = prop.getValues();
    assertEquals(1, values.length);
    assertEquals("another test label", values[0].getString());
  }

  @Test
  public void removeLastLabel() throws Exception {
    Session session = jcrService.loginSystem();
    Node node = nodeFactory.getNode(randomFile1);
    JcrUtils.addNodeLabel(jcrService, node, "test label");
    session.save();

    assertTrue(node.hasProperty(JCRConstants.JCR_LABELS));

    JcrUtils.removeNodeLabel(jcrService, node, "test label");
    session.save();

    assertTrue(node.hasProperty(JCRConstants.JCR_LABELS));
    Property prop = node.getProperty(JCRConstants.JCR_LABELS);
    Value[] values = prop.getValues();
    assertEquals(0, values.length);
  }

  @Test
  public void multiThreadTest() throws Exception {
    Session session = jcrService.loginSystem();
    nodeFactory.createFile(randomFile1 + "xyz1", "text/plain");
    session.save();
    jcrService.logout();


    Thread[] threads = new Thread[10];
    running = 0;
    failed = 0;
    for (int i = 0; i < threads.length; i++) {
      threads[i] = new Thread(new Runnable() {

        public void run() {
          running++;
          Random random = new Random();
          try {
            for (int j = 0; j < 10; j++) {
              try {
                Session session = jcrService.loginSystem();
                Node node = (Node) session.getItem(randomFile1);
                Lock lock = jcrService.lock(node);
                LOG.info("Locked +++++++++++++++++++++++++++++"+lock.getLocked());
                locked++;
                assertEquals(1, locked);
                try {
                  node.getProperty("sakaijcr:test").remove();
                } catch (Exception e) {

                }
                LOG.info("Unlocking ---------------------------"+lock.getLocked());
                locked--;
                assertEquals(0, locked);
                session.save(); // save performs an unlock
                Thread.sleep(100);
                lock = jcrService.lock(node);
                LOG.info("Locked +++++++++++++++++++++++++++++++2"+lock.getLocked());
                locked++;
                assertEquals(1, locked);
                node.setProperty("sakaijcr:test", "new value" + random.nextLong());
                LOG.info("Unlocking -----------------------------2"+lock.getLocked());
                locked--;
                assertEquals(0, locked);
                session.save(); // save performs an unlock
              } catch (Exception e) {
                failed++;
                e.printStackTrace();
              } finally {
                try {
                  jcrService.logout();
                } catch (Exception e) {
                  e.printStackTrace();
                }
                cacheManagerService.unbind(CacheScope.REQUEST);
              }
            }
          } catch (Throwable t) {
            failed++;
            t.printStackTrace();
          } finally {
            System.err.println("Exiting " + Thread.currentThread());
            running--;
          }
        }
      });
    }
    for (Thread thread : threads) {
      thread.start();
      Thread.sleep(100);
    }

    while (running > 0) {
      Thread.sleep(100);
    }
    assertEquals(0, failed);
  }

}
