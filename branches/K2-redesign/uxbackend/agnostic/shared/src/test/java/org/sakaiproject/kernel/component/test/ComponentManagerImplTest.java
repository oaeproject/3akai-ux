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
package org.sakaiproject.kernel.component.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentManager;
import org.sakaiproject.kernel.api.ComponentSpecification;
import org.sakaiproject.kernel.component.ComponentManagerImpl;
import org.sakaiproject.kernel.component.KernelImpl;
import org.sakaiproject.kernel.component.ServiceManagerImpl;
import org.sakaiproject.kernel.component.URLComponentSpecificationImpl;
import org.sakaiproject.kernel.component.test.mock.MockComponentSpecificationImpl;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class ComponentManagerImplTest {

  private KernelImpl kernel;
  private static final String BASE = "res://org/sakaiproject/kernel/component/test/componentset";
  private static final Log LOG = LogFactory
      .getLog(ComponentManagerImplTest.class);

  @BeforeClass
  public static void beforeClass() {

    System.setProperty("sakai.kernel.properties", "inline://core.component.locations=\n");    
  }
  
  @AfterClass
  public static void afterClass() {
    System.clearProperty("sakai.kernel.properties");
  
  }
  
  @Before
  public void before() {
    kernel = new KernelImpl();
    kernel.start();
    ServiceManagerImpl serviceManager = new ServiceManagerImpl(kernel);
    serviceManager.start();
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.ComponentManagerImpl#ComponentManagerImpl(org.sakaiproject.kernel.component.KernelImpl)}
   * .
   */
  @Test
  public void testComponentManagerImpl() {
    ComponentManager cm = new ComponentManagerImpl(kernel);
    assertNotNull(cm);
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.ComponentManagerImpl#start()}.
   */
  @Test
  public void testStart() throws Exception {
    // override the defaults

    ComponentManagerImpl cm = new ComponentManagerImpl(kernel);
    cm.start();
    cm.stop();
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.ComponentManagerImpl#stop()}.
   */
  @Test
  public void testStop() throws Exception {
    ComponentManagerImpl cm = new ComponentManagerImpl(kernel);
    cm.start();
    cm.stop();
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.ComponentManagerImpl#startComponent(org.sakaiproject.kernel.api.ComponentSpecification)}
   * .
   */
  @Test
  public void testStartComponent() throws Exception {
    ComponentManagerImpl cm = new ComponentManagerImpl(kernel);
    cm.start();
    ComponentSpecification spec = new MockComponentSpecificationImpl();
    cm.prepareStartComponent(spec);
    cm.startComponent(spec);
    cm.stop();
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.ComponentManagerImpl#stopComponent(org.sakaiproject.kernel.api.ComponentSpecification)}
   * .
   */
  @Test
  public void testStopComponent() throws Exception {
    ComponentManagerImpl cm = new ComponentManagerImpl(kernel);
    cm.start();
    ComponentSpecification spec = new MockComponentSpecificationImpl();
    cm.prepareStartComponent(spec);
    cm.startComponent(spec);
    cm.stopComponent(spec);
    cm.stop();
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.ComponentManagerImpl#startComponent(org.sakaiproject.kernel.api.ComponentSpecification)}
   * .
   */
  @Test
  public void testNormalDependencyAnalysis() throws Exception {
    ComponentManagerImpl cm = new ComponentManagerImpl(kernel);
    cm.start();
    List<ComponentSpecification> cs = new ArrayList<ComponentSpecification>();
    for (int i = 0; i < 5; i++) {
      cs.add(new URLComponentSpecificationImpl(null,BASE + "-good-" + i + ".xml"));
      LOG.info("Loaded Component "+BASE + "-good-" + i + ".xml");
    }
    cm.loadComponents(cs);
    List<ComponentSpecification> startOrder = cm.getStartOrder(cs);
    for (ComponentSpecification spec : startOrder) {
      LOG.info(spec.getDependencyDescription());
    }
    assertEquals(5, startOrder.size());
    cm.stop();
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.component.ComponentManagerImpl#startComponent(org.sakaiproject.kernel.api.ComponentSpecification)}
   * .
   */
  @Test
  public void testMissingDependencyAnalysis() throws Exception {
    ComponentManagerImpl cm = new ComponentManagerImpl(kernel);
    cm.start();
    List<ComponentSpecification> cs = new ArrayList<ComponentSpecification>();
    for (int i = 0; i < 5; i++) {
      cs
          .add(new URLComponentSpecificationImpl(null,BASE + "-missing-" + i
              + ".xml"));
    }
    cm.loadComponents(cs);
    try {
      List<ComponentSpecification> startOrder = cm.getStartOrder(cs);
      for (ComponentSpecification spec : startOrder) {
        LOG.info(spec.getDependencyDescription());
      }
      fail("Should have found a missing dependency ");
    } catch (Exception ex) {
      LOG.info("Sucess Found Missing dependency "+ex.getMessage());
    }
    cm.stop();
  }

  @Test
  public void testCyclicDependencyAnalysis() throws Exception {
    ComponentManagerImpl cm = new ComponentManagerImpl(kernel);
    cm.start();
    List<ComponentSpecification> cs = new ArrayList<ComponentSpecification>();
    for (int i = 0; i < 5; i++) {
      cs.add(new URLComponentSpecificationImpl(null,BASE + "-cyclic-" + i + ".xml"));
    }

    cm.loadComponents(cs);
    try {
      List<ComponentSpecification> startOrder = cm.getStartOrder(cs);
      for (ComponentSpecification spec : startOrder) {
        LOG.info(spec.getDependencyDescription());
      }
      fail("Should have found a cyclic dependency ");
    } catch (Exception ex) {
      LOG.info("Sucess Found cyclic dependency "+ex.getMessage());
    }
    cm.stop();
  }

}
