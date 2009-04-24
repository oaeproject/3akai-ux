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
package org.sakaiproject.kernel.component.model.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.component.KernelImpl;
import org.sakaiproject.kernel.component.core.Maven2ArtifactResolver;
import org.sakaiproject.kernel.component.core.PackageRegistryServiceImpl;
import org.sakaiproject.kernel.component.core.PersistenceUnitClassLoader;
import org.sakaiproject.kernel.component.core.SharedClassLoader;
import org.sakaiproject.kernel.component.core.SharedClassloaderArtifact;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import java.net.URL;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.Enumeration;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

public class PersistenceUnitClassLoaderTest {
  private static final Log LOG = LogFactory
      .getLog(PersistenceUnitClassLoaderTest.class);

  private static SharedClassLoader scl;
  private static PersistenceUnitClassLoader pucl;
  private static KernelImpl kernel;

  private static DocumentBuilderFactory docFactory;
  private static DocumentBuilder builder;

  @BeforeClass
  public static void setUp() throws Exception {
    final PackageRegistryServiceImpl prs = new PackageRegistryServiceImpl();
    final Maven2ArtifactResolver dependencyResolver = new Maven2ArtifactResolver();
    kernel = new KernelImpl();

    scl = AccessController
        .doPrivileged(new PrivilegedAction<SharedClassLoader>() {

          public SharedClassLoader run() {
            return new SharedClassLoader(prs, dependencyResolver,
                new SharedClassloaderArtifact(), kernel);

          }

        });

    pucl = AccessController
        .doPrivileged(new PrivilegedAction<PersistenceUnitClassLoader>() {

          public PersistenceUnitClassLoader run() {
            return new PersistenceUnitClassLoader(scl);
          }

        });

    docFactory = DocumentBuilderFactory.newInstance();
    builder = docFactory.newDocumentBuilder();
  }

  /**
   * Check that the classloader returns more than one instance of
   * persistence.xml when using the non-merging classloader.
   */
  @Test
  public void countUnmergedPersistence() throws Exception {
    // count the number of persistence files found on the classpath
    int count = 0;
    for (Enumeration<URL> pers = scl
        .getResources(PersistenceUnitClassLoader.PERSISTENCE_XML); pers
        .hasMoreElements();) {
      URL orm = pers.nextElement();
      LOG.info("** un-pers:" + count + ": " + orm);
      count++;
    }
    assertTrue(count > 1);
  }

  /**
   * Check that the classloader returns more than one instance of orm.xml when
   * using the non-merging classloader.
   * 
   * @throws Exception
   */
  @Test
  public void countUnmergedOrms() throws Exception {
    // count the number of ORMs found on the classpath
    int count = 0;
    for (Enumeration<URL> orms = scl
        .getResources(PersistenceUnitClassLoader.ORM_XML); orms
        .hasMoreElements();) {
      URL orm = orms.nextElement();
      LOG.info("** un-orm:" + count + ": " + orm);
      count++;
    }
    assertTrue(count > 1);
  }

  /**
   * Check that the classloader returns only one instance of persistence.xml
   * when using the merging classloader.
   * 
   * 
   * @throws Exception
   */
  @Test
  public void countMergedPersistence() throws Exception {
    // count the number of persistence files found on the classpath
    int count = 0;
    for (Enumeration<URL> pers = pucl
        .getResources(PersistenceUnitClassLoader.PERSISTENCE_XML); pers
        .hasMoreElements();) {
      URL orm = pers.nextElement();
      LOG.info("** pers:" + count + ": " + orm);
      count++;
    }
    assertEquals(1, count);
  }

  /**
   * Check that the classloader returns only one instance of orm.xml when using
   * the merging classloader.
   * 
   * @throws Exception
   */
  @Test
  public void countMergedOrm() throws Exception {
    // count the number of ORMs found on the classpath
    int count = 0;
    for (Enumeration<URL> orms = pucl
        .getResources(PersistenceUnitClassLoader.ORM_XML); orms
        .hasMoreElements();) {
      URL orm = orms.nextElement();
      LOG.info("** orm:" + count + ": " + orm);
      count++;
    }
    assertEquals(1, count);
  }

  /**
   * Check that the persistence.xml returned from the merging classloader has
   * some expected elements from non-kernel persistence.xml files.
   * 
   * @throws Exception
   */
  @Test
  public void verifyMergedPersistence() throws Exception {
    Enumeration<URL> urlEnum = pucl
        .getResources(PersistenceUnitClassLoader.PERSISTENCE_XML);
    assertTrue(urlEnum.hasMoreElements());
    URL url = urlEnum.nextElement();
    LOG.info("persistence.xml location: " + url);
    // printFile(url);

    final XPathFactory XPATH_FACTORY = XPathFactory.newInstance();
    final XPath XPATH = XPATH_FACTORY.newXPath();
    final XPathExpression XPATH_CLASS_TEXT = XPATH
        .compile("//persistence/persistence-unit/class/text()");
    final Document doc = builder.parse(url.toExternalForm());
    NodeList nodes = (NodeList) XPATH_CLASS_TEXT.evaluate(doc,
        XPathConstants.NODESET);
    // this should be 2 but will need to change if class nodes are added
    // persistence.xml of kernel
    assertTrue(nodes.getLength() > 2);

    final XPathExpression XPATH_MAPPING_TEXT = XPATH
        .compile("//persistence/persistence-unit/mapping-file/text()");
    nodes = (NodeList) XPATH_MAPPING_TEXT.evaluate(doc, XPathConstants.NODESET);
    // this should be 4 but will need to change if mapping-file nodes are added
    // persistence.xml of kernel
    assertEquals(4, nodes.getLength());
  }

  /**
   * Check that the orm.xml returned from the merging classloader has some
   * expected elements from non-kernel orm.xml files.
   * 
   * @throws Exception
   */
  @Test
  public void verifyMergedOrm() throws Exception {
    Enumeration<URL> urlEnum = pucl
        .getResources(PersistenceUnitClassLoader.ORM_XML);
    assertTrue(urlEnum.hasMoreElements());
    URL url = urlEnum.nextElement();
    LOG.info("orm.xml location: " + url);
    // printFile(url);
    final XPathFactory XPATH_FACTORY = XPathFactory.newInstance();
    final XPath XPATH = XPATH_FACTORY.newXPath();
    final XPathExpression XPATH_ENTITY = XPATH
        .compile("//entity-mappings/entity");
    final Document doc = builder.parse(url.toExternalForm());
    NodeList nodes = (NodeList) XPATH_ENTITY.evaluate(doc,
        XPathConstants.NODESET);
    // this should be 9 but will need to change if any entities are added to the
    // orm.xml files used in this test.
    assertTrue(nodes.getLength() > 1);
  }

  /**
   * Prints out the file located at the provided URL. Used for visually checking
   * the merged xml files.
   * 
   * @param url
   * @throws FileNotFoundException
   * @throws URISyntaxException
   * @throws IOException
   */
  /*
   * private void printFile(URL url) throws FileNotFoundException,
   * URISyntaxException, IOException { BufferedReader br = new BufferedReader(
   * new FileReader(new File(url.toURI()))); StringBuilder sb = new
   * StringBuilder(); while (br.ready()) {
   * sb.append(br.readLine()).append("\n"); } br.close(); LOG.info(sb); }
   */
}
