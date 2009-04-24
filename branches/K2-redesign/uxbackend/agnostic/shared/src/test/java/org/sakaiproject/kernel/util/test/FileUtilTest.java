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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.util.FileUtil;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

/**
 * 
 */
public class FileUtilTest {

  private static final Log LOG = LogFactory.getLog(FileUtilTest.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private File baseFile;

  @Before
  public void before() throws IOException {
    baseFile = new File("target/fileutiltest2");
    touchFile(new File(baseFile,"testfile1.txt"));
    touchFile(new File(baseFile,"testfile2.txt"));
    touchFile(new File(baseFile,"testfile1.jar"));
    File c = new File(baseFile,"sub");
    File d = new File(c,"sub");
    File e = new File(d,"sub");
    File x = new File(e,"sub");
    touchFile(new File(x,"testfile1.txt"));
    touchFile(new File(x,"testfile2.txt"));
    touchFile(new File(x,"testfile1.jar"));
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
        LOG.debug("Created directory for "+f);
    }
    FileWriter fw = new FileWriter(f);
    fw.write(String.valueOf(System.currentTimeMillis()));
    fw.close();
  }
  /**
   * Test method for {@link org.sakaiproject.kernel.util.FileUtil#deleteAll(java.io.File)}.
   */
  @Test
  public void testDeleteAll() {
    assertTrue(baseFile.exists());
    FileUtil.deleteAll(baseFile);
    assertFalse(baseFile.exists());
  }

  /**
   * Test method for {@link org.sakaiproject.kernel.util.FileUtil#findAll(java.lang.String, java.lang.String)}.
   */
  @Test
  public void testFindAll() {
    assertTrue(baseFile.exists());
    File[] f = FileUtil.findAll(baseFile.getAbsolutePath(), "jar");
    assertEquals(2,f.length);
  }
  @Test
  public void testFindAllOne() throws IOException {
    File f = new File(baseFile,"test2.single");
    touchFile(f);
    assertTrue(f.exists());
    File[] fr = FileUtil.findAll(f.getAbsolutePath(), "single");
    assertEquals(1,fr.length);
  }

}
