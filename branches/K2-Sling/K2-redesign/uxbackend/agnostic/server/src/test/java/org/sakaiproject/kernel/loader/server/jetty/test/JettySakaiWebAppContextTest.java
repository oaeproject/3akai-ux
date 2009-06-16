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
package org.sakaiproject.kernel.loader.server.jetty.test;

import static org.junit.Assert.*;

import org.junit.Test;
import org.sakaiproject.kernel.loader.common.CommonObjectConfigurationException;
import org.sakaiproject.kernel.loader.server.jetty.SakaiWebAppContext;
import org.sakaiproject.kernel.loader.server.test.DummySharedClassLoaderContainer;

import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;

import javax.management.InstanceAlreadyExistsException;
import javax.management.JMException;
import javax.management.JMRuntimeException;
import javax.management.modelmbean.InvalidTargetObjectTypeException;

/**
 * 
 */
public class JettySakaiWebAppContextTest {

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.loader.server.jetty.SakaiWebAppContext#SakaiWebAppContext(java.lang.ClassLoader)}
   * .
   * 
   * @throws IOException
   * @throws CommonObjectConfigurationException
   * @throws InvalidTargetObjectTypeException
   * @throws JMException
   * @throws JMRuntimeException
   */
  @Test
  public void testSakaiWebAppContext()
      throws CommonObjectConfigurationException, IOException,
      JMRuntimeException, JMException, InvalidTargetObjectTypeException {
    URLClassLoader uc = new URLClassLoader(new URL[0], this.getClass()
        .getClassLoader());
    try {
      @SuppressWarnings("unused")
      DummySharedClassLoaderContainer sharedClassLoader = new DummySharedClassLoaderContainer(
          uc);
    } catch (InstanceAlreadyExistsException iex) {

    }

    SakaiWebAppContext webappContext = new SakaiWebAppContext(this.getClass()
        .getClassLoader());
    ClassLoader cl = webappContext.getClassLoader();
    assertNotNull(cl);
  }

  /**
   * @throws CommonObjectConfigurationException
   * @throws IOException
   * @throws JMRuntimeException
   * @throws JMException
   * @throws InvalidTargetObjectTypeException
   */
  @Test
  public void testSetWar() throws CommonObjectConfigurationException,
      IOException, JMRuntimeException, JMException,
      InvalidTargetObjectTypeException {
    URLClassLoader uc = new URLClassLoader(new URL[0], this.getClass()
        .getClassLoader());
    try {
      @SuppressWarnings("unused")
      DummySharedClassLoaderContainer sharedClassLoader = new DummySharedClassLoaderContainer(
          uc);
    } catch (InstanceAlreadyExistsException iex) {

    }
    SakaiWebAppContext webappContext = new SakaiWebAppContext(this.getClass()
        .getClassLoader());
    webappContext.setWar("../test-webapp/target/test-webapp-1.0-SNAPSHOT.war");

  }

}
