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
package org.sakaiproject.kernel.util.test;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.util.FileUtil;
import org.sakaiproject.kernel.util.ResourceLoader;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URI;

/**
 * 
 */
public class ResourceLoaderTest {

  private static final Log LOG = LogFactory.getLog(ResourceLoaderTest.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private File baseFile;

  @Before
  public void before() throws IOException {
    baseFile = new File("target/resourceloadertest");
    touchFile(new File(baseFile, "testfile1.txt"));
  }

  @After
  public void after() {
    FileUtil.deleteAll(baseFile);
  }

  /**
   * @param f
   * @throws IOException
   */
  private void touchFile(File f) throws IOException {
    if ( f.getParentFile().mkdirs() ) {
      if (debug)
        LOG.debug("Created parent "+f);
    }
    FileWriter fw = new FileWriter(f);
    try {
      fw.write(String.valueOf(System.currentTimeMillis()));
    } finally {
      fw.close();
    }
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.util.ResourceLoader#openResource(java.lang.String)}
   * .
   * 
   * @throws IOException
   */
  @Test
  public void testOpenResourceString() throws IOException {

    InputStream in = ResourceLoader
        .openResource("res://org/sakaiproject/kernel/component/test/complexcomponent.xml",this.getClass().getClassLoader());
    assertNotNull(in);
    in.close();
    try {
      in = ResourceLoader.openResource("res://sdfkjsdlkfjsdlfkjsd lkfjsdkl ",this.getClass().getClassLoader());
      fail();
    } catch (IOException e) {
    }
    in.close();
    in = ResourceLoader.openResource("inline://sdfkjsdlkfjsdlfkjsd lkfjsdkl ",this.getClass().getClassLoader());
    assertNotNull(in);
    in.close();

/*
      in = ResourceLoader.openResource("http://www.sakaiproject.org",this.getClass().getClassLoader());
 
    assertNotNull(in);
    in.close();
*/
    File f = new File(baseFile, "testfile1.txt");
    URI uri = f.toURI();
    in = ResourceLoader.openResource(uri.toString(),this.getClass().getClassLoader());
    assertNotNull(in);
    in.close();
    in = ResourceLoader.openResource(uri.toString(), this.getClass().getClassLoader());
    assertNotNull(in);
    in.close();

  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.util.ResourceLoader#openResource(java.lang.String, java.lang.ClassLoader)}
   * .
   * 
   * @throws IOException
   */
  @Test
  public void testOpenResourceStringClassLoader() throws IOException {
    InputStream in = ResourceLoader.openResource(
        "res://org/sakaiproject/kernel/component/test/complexcomponent.xml",
        this.getClass().getClassLoader());
    assertNotNull(in);
    in.close();
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.util.ResourceLoader#readResource(java.lang.String)}
   * .
   * @throws IOException 
   */
  @Test
  public void testReadResourceString() throws IOException {
    String in = ResourceLoader.readResource(
        "res://org/sakaiproject/kernel/component/test/complexcomponent.xml",this.getClass().getClassLoader());
    assertNotNull(in);
    assertTrue(in.length()> 0);
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.util.ResourceLoader#readResource(java.lang.String, java.lang.ClassLoader)}
   * .
   * @throws IOException 
   */
  @Test
  public void testReadResourceStringClassLoader() throws IOException {
    String in = ResourceLoader.readResource(
        "res://org/sakaiproject/kernel/component/test/complexcomponent.xml",
        this.getClass().getClassLoader());
    assertNotNull(in);
    assertTrue(in.length()> 0);
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.util.ResourceLoader#readResource(java.net.URL)}
   * .
   * @throws IOException 
   * @throws MalformedURLException 
   */
  @Test
  public void testReadResourceURL() throws MalformedURLException, IOException {
    /*
    String in = ResourceLoader.readResource(
        new URL("http://www.google.com"));
    assertNotNull(in);
    assertTrue(in.length()> 0);
    */
  }

}
