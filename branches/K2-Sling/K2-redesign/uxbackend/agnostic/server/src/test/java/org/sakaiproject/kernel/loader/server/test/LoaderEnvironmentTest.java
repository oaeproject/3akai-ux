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
package org.sakaiproject.kernel.loader.server.test;

import static org.junit.Assert.assertNotNull;

import org.junit.Test;
import org.sakaiproject.kernel.loader.server.LoaderEnvironment;
import org.sakaiproject.kernel.loader.server.SwitchedClassLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Properties;

/**
 *
 */
public class LoaderEnvironmentTest {

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.loader.server.LoaderEnvironment#getLifecyleClass(java.lang.ClassLoader)}
   * .
   *
   * @throws ClassNotFoundException
   */
  @Test
  public void testGetLifecyleClass() throws ClassNotFoundException {
    System.setProperty(LoaderEnvironment.SYS_LIFECYCLE_PROPERTY,
        SwitchedClassLoader.class.getName());
    assertNotNull(LoaderEnvironment.getLifecyleClass(this.getClass()
        .getClassLoader()));
    System.clearProperty(LoaderEnvironment.SYS_LIFECYCLE_PROPERTY);
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.loader.server.LoaderEnvironment#getLifecyleClass(java.lang.ClassLoader)}
   * .
   *
   * @throws ClassNotFoundException
   * @throws IOException
   * @throws NoSuchMethodException
   * @throws SecurityException
   * @throws InvocationTargetException
   * @throws IllegalAccessException
   * @throws IllegalArgumentException
   */
  @Test
  public void testGetLifecyleFromProperties() throws ClassNotFoundException,
      IOException, SecurityException, NoSuchMethodException,
      IllegalArgumentException, IllegalAccessException,
      InvocationTargetException {
    File f = new File("target/test-classes/loader.properties");
    if (f.getParentFile().mkdirs()) {
      Properties p = new Properties();
      p.setProperty(LoaderEnvironment.SYS_LIFECYCLE_PROPERTY,
          SwitchedClassLoader.class.getName());
      FileOutputStream fo = new FileOutputStream(f);
      p.store(fo, "Just for testing");
      fo.close();
      assertNotNull(LoaderEnvironment.getLifecyleClass(this.getClass()
          .getClassLoader()));
      if (!f.delete()) {
        System.err.println("Unable to delete " + f.getAbsolutePath());
      }
    }
  }

}
