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

package org.sakaiproject.kernel.component.core;

import com.google.inject.Singleton;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.component.model.JpaOrmAccumulator;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.XMLReaderFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.sax.SAXTransformerFactory;
import javax.xml.transform.sax.TransformerHandler;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathException;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

/**
 * This classloader merges together persistence.xml and orm.xml files into a
 * single file for each so that all entities will exist within the same
 * persistence unit.
 */
@Singleton
public class PersistenceUnitClassLoader extends ClassLoader {
  private static final String XML_HEADER = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  private static final String ENTITY_MAPPINGS_START = "<entity-mappings version=\"1.0\" xmlns=\"http://java.sun.com/xml/ns/persistence/orm\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://java.sun.com/xml/ns/persistence/orm orm_1_0.xsd\">\n";
  private static final String ENTITY_MAPPINGS_END = "</entity-mappings>\n";

  private static final Log LOG = LogFactory
      .getLog(PersistenceUnitClassLoader.class);
  private static final boolean debug = LOG.isDebugEnabled();

  public static final String KERNEL_PERSISTENCE_XML = "META-INF/kernel-persistence.xml";
  public static final String PERSISTENCE_XML = "META-INF/persistence.xml";
  public static final String ORM_XML = "META-INF/orm.xml";

  private static final DocumentBuilderFactory DOC_BUILDER_FACTORY = DocumentBuilderFactory
      .newInstance();
  private static final XPathFactory XPATH_FACTORY = XPathFactory.newInstance();
  private static final XPath XPATH = XPATH_FACTORY.newXPath();

  // initialized in static block
  private static final XPathExpression XPATH_PU_NODE;
  private static final XPathExpression XPATH_CLASS_TEXT;
  private static final XPathExpression XPATH_MAPPING_TEXT;

  /**
   * URL to the merged persistence.xml. Populated after the first time it is
   * requested.
   */
  private URL persistenceXMLurl;

  /**
   * URL to the merged orm.xml. Populated after the first time it is requested.
   */
  private URL ormXMLurl;

  /**
   * Map of 1st level child nodes possible in a persistence unit. The nodes are
   * mapped in order of expectation based on the XSD.
   */
  private final static HashMap<String, Integer> tagOrder;

  /**
   * Initializer for static members.
   */
  static {
    try {
      XPATH_PU_NODE = XPATH.compile("//persistence/persistence-unit");
      XPATH_MAPPING_TEXT = XPATH
          .compile("//persistence/persistence-unit/mapping-file/text()");
      XPATH_CLASS_TEXT = XPATH
          .compile("//persistence/persistence-unit/class/text()");
    } catch (XPathExpressionException e) {
      throw new ExceptionInInitializerError(e);
    }

    // initialize the tag order map
    tagOrder = new HashMap<String, Integer>();
    tagOrder.put("description", 0);
    tagOrder.put("provider", 1);
    tagOrder.put("jta-data-source", 2);
    tagOrder.put("non-jta-data-source", 3);
    tagOrder.put("mapping-file", 4);
    tagOrder.put("jar-file", 5);
    tagOrder.put("class", 6);
    tagOrder.put("exclude-unlisted-classes", 7);
    tagOrder.put("properties", 8);
  }

  /**
   * Enumeration of entities that are searched for in the persistence.xml.
   */
  enum EntityType {
    MAPPING("mapping-file"), CLASS("class");

    private final String type;

    private EntityType(String type) {
      this.type = type;
    }

    public String getType() {
      return type;
    }
  }

  /**
   * Constructor.
   *
   * @param parent
   */
  public PersistenceUnitClassLoader(ClassLoader parent) {
    super(parent);
  }

  /**
   * Gets resources from the classloader. This filters for
   * META-INF/{persistence.xml, orm.xml} and merges those files respectively, so
   * it appears there is only one copy of each. This is needed for all
   * persistence units to be grouped together in JPA.
   *
   * {@inheritDoc}
   *
   * @see java.lang.ClassLoader#getResources(java.lang.String)
   */
  @Override
  public Enumeration<URL> getResources(final String name) throws IOException {
    try {
      Enumeration<URL> retEnum = null;
      if (PERSISTENCE_XML.equals(name)) {
        if (persistenceXMLurl == null) {
          String xml = scanPersistenceXml();
          if (xml != null) {
            persistenceXMLurl = constructUrl(xml, PERSISTENCE_XML);
          }
          xml = scanOrmXml();
          if (xml != null) {
            ormXMLurl = constructUrl(xml, ORM_XML);
          }
        }
        retEnum = new UrlEnumeration(persistenceXMLurl);
      }
      // make sure subsequent lookups for orm.xml get the merged copy of the
      // file
      else if (ORM_XML.equals(name)) {
        if (ormXMLurl == null) {
          final String xml = scanOrmXml();
          if (xml != null) {
            ormXMLurl = constructUrl(xml, ORM_XML);
          }
        }
        retEnum = new UrlEnumeration(ormXMLurl);
      } else {
        retEnum = super.getResources(name);
      }
      return retEnum;
    } catch (ParserConfigurationException e) {
      throw new IOException(e.toString());
    } catch (SAXException e) {
      throw new IOException(e.toString());
    } catch (XPathExpressionException e) {
      throw new IOException(e.toString());
    } catch (TransformerException e) {
      throw new IOException(e.toString());
    }
  }

  /**
   * Constructs a temporary file that merges together the requested filename as
   * it is found in different artifacts (jars). The URL to the merged file is
   * returned.
   *
   * @param filename
   *          The file to look for in the classloader.
   * @return The merged result of the found filenames.
   * @throws IOException
   */
  private URL constructUrl(final String xml, final String filename)
      throws IOException {
    if (debug)
      LOG.debug(filename + " " + xml);

    // The base directory must be empty since JPA will scan it searching for
    // classes.
    final File file = new File(System.getProperty("java.io.tmpdir") + "/sakai/"
        + filename);
    if ( file.getParentFile().mkdirs() ) {
      if (debug)
        LOG.debug("Created "+file);
    }
    final PrintWriter pw = new PrintWriter(new FileWriter(file));
    pw.print(xml);
    pw.close();
    URL url = null;
    try {
        url = file.toURI().toURL();
    } catch (MalformedURLException e) {
        LOG.error("cannot convert file to URL " + e.toString());
    }
    if (debug)
      LOG.debug("URL: " + url);
    final URL urlout = url;
    return urlout;
  }

  /**
   * Looks through classloader resources to find all instances of the requested
   * filename.
   *
   * @param filter
   *          How to filter (master/others)
   * @return {@link Collection} of instances found.
   * @throws IOException
   */
  private Collection<URL> findXMLs(final String filename) throws IOException {
    final Collection<URL> result = new ArrayList<URL>();

    for (final Enumeration<URL> e = super.getResources(filename); e
        .hasMoreElements();) {
      final URL url = e.nextElement();
      result.add(url);
    }

    return result;
  }

  /**
   * Scans the classloader for files named META-INF/orm.xml and consolidates
   * them.
   *
   * @return A consolidated String representing all orm.xml files found.
   * @throws IOException
   * @throws SAXException
   */
  private String scanOrmXml() throws TransformerConfigurationException,
      IOException, SAXException {
    StringWriter writer = new StringWriter();
    StreamResult result = new StreamResult(writer);

    // SAX2.0 ContentHandler
    SAXTransformerFactory tf = (SAXTransformerFactory) SAXTransformerFactory
        .newInstance();
    TransformerHandler handler = tf.newTransformerHandler();
    Transformer serializer = handler.getTransformer();
    serializer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
    serializer.setOutputProperty(OutputKeys.INDENT, "yes");
    handler.setResult(result);

    JpaOrmAccumulator acc = new JpaOrmAccumulator(handler);

    XMLReader reader = XMLReaderFactory.createXMLReader();
    reader.setContentHandler(acc);

    for (final URL url : findXMLs(ORM_XML)) {
      reader.parse(new InputSource(url.openStream()));
    }

    String writerOut = writer.toString();
    String out = XML_HEADER + ENTITY_MAPPINGS_START
        + writerOut.substring(writerOut.indexOf("<entity "))
        + ENTITY_MAPPINGS_END;

    return out;
  }

  /**
   * Scans the classloader for persistence.xml files, parses the expected XML
   * and merges the results together for a unified view of the various
   * instances. The master copy is taken in entirety and only the class and
   * mapping-file entries are taken from the other copies.Well
   *
   * @param filename
   * @return
   * @throws ParserConfigurationException
   * @throws IOException
   * @throws SAXException
   * @throws XPathException
   */
  private String scanPersistenceXml() throws ParserConfigurationException,
      IOException, SAXException, XPathExpressionException, TransformerException {

    String outxml = null;

    LOG.trace("scanPersistenceXML()");
    final DocumentBuilder builder = DOC_BUILDER_FACTORY.newDocumentBuilder();
    DOC_BUILDER_FACTORY.setNamespaceAware(true);

    final URL masterURL = getResource(KERNEL_PERSISTENCE_XML);
    if (masterURL == null) {
      LOG.error("Can't find " + KERNEL_PERSISTENCE_XML);
    } else {
      if (debug)
        LOG.debug(String.format(">>>> master persistence.xml: %s", masterURL));
      final Document masterDocument = builder.parse(masterURL.toExternalForm());

      // collect the class and mappings together so they can be added to the
      // document in groups rather than strewn about.
      final HashSet<String> mappings = new HashSet<String>();
      final HashSet<String> classes = new HashSet<String>();

      // collect mapping-file and class nodes from non-master persistence.xml's
      for (final URL url : findXMLs(PERSISTENCE_XML)) {
        LOG.debug(String.format(">>>> other persistence.xml: %s", url));
        final Document document = builder.parse(url.toExternalForm());
        // collect the mappings
        accumulateNodeText((NodeList) XPATH_MAPPING_TEXT.evaluate(document,
            XPathConstants.NODESET), mappings);

        // collect the classes
        accumulateNodeText((NodeList) XPATH_CLASS_TEXT.evaluate(document,
            XPathConstants.NODESET), classes);
      }

      // build the final document
      final Node puNode = (Node) XPATH_PU_NODE.evaluate(masterDocument,
          XPathConstants.NODE);
      if (puNode == null) {
        LOG.error("No persistence unit found!");
        LOG.error("PERSISTENCE.XML\n" + readFile(masterURL));
      } else {
        NodeList nodes = puNode.getChildNodes();
        int mappingRank = tagOrder.get(EntityType.MAPPING.getType());
        int classRank = tagOrder.get(EntityType.CLASS.getType());
        boolean mappingsInserted = false;
        boolean classesInserted = false;
        if (nodes.getLength() > 0) {
          for (int i = 0; i < nodes.getLength(); i++) {
            Node node = nodes.item(i);
            if (tagOrder.containsKey(node.getNodeName())) {
              int rank = tagOrder.get(node.getNodeName());
              // insert the mapping-file nodes
              if (!mappingsInserted && rank > mappingRank) {
                insertBefore(mappings, masterDocument, puNode, node,
                    EntityType.MAPPING);
                mappingsInserted = true;
              }
              // insert the mapping-file nodes
              if (!classesInserted && rank > classRank) {
                insertBefore(classes, masterDocument, puNode, node,
                    EntityType.CLASS);
                classesInserted = true;
              }
            }
          }
        } else {
          appendChildren(masterDocument, puNode, nodes, EntityType.MAPPING);
          appendChildren(masterDocument, puNode, nodes, EntityType.CLASS);
        }
      }

      outxml = toString(masterDocument);
    }

    return outxml;
  }

  /**
   * Accumulates the text of some given nodes into a provided
   * {@link java.util.Set}.
   *
   * @param nodes
   * @param collect
   */
  private void accumulateNodeText(final NodeList nodes, Set<String> collect) {
    for (int i = 0; i < nodes.getLength(); i++) {
      Node node = nodes.item(i);
      collect.add(node.getTextContent());
    }
  }

  /**
   * Insert nodes before a given reference node in a
   * {@link org.w3c.dom.NodeList}.
   *
   * @param mappings
   * @param parentNode
   * @param refChild
   */
  private void insertBefore(final Set<String> texts, final Document doc,
      final Node parentNode, final Node refChild, final EntityType type) {
    for (String text : texts) {
      Node n = doc.createElement(type.getType());
      n.setTextContent(text);
      parentNode.insertBefore(n, refChild);
    }
  }

  /**
   * Append children nodes to a persistence unit.
   *
   * @param masterDocument
   *          The document to create new elements from.
   * @param puNude
   *          The persistence unit node to append to.
   * @param url
   *          Location of the file where these nodes come from. Used in
   *          commenting the file for debugging.
   * @param nodes
   *          The nodes to add.
   * @param entityType
   *          The type of entity (class/mapping-file) being added.
   */
  private void appendChildren(final Document masterDocument, final Node puNode,
      final NodeList nodes, final EntityType entityType) {
    for (int i = 0; i < nodes.getLength(); i++) {
      final String entity = nodes.item(i).getNodeValue();
      if (debug)
        LOG.debug(String.format(">>>>>>>> entity %s: %s", entityType.getType(),
            entity));

      final Node child = masterDocument.createElement(entityType.getType());
      child.appendChild(masterDocument.createTextNode(entity));
      puNode.appendChild(child);
      puNode.appendChild(masterDocument.createTextNode("\n"));
    }
  }

  /**
   * Marshall/serialize a {@link Document} to an XML String.
   *
   * @param doc
   * @return
   * @throws TransformerException
   */
  private String toString(Document doc) throws TransformerException {
    // Serialization through Transform.
    DOMSource domSource = new DOMSource(doc);
    StringWriter out = new StringWriter();
    StreamResult streamResult = new StreamResult(out);
    TransformerFactory tf = TransformerFactory.newInstance();
    Transformer serializer = tf.newTransformer();
    serializer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
    serializer.setOutputProperty(OutputKeys.INDENT, "yes");
    serializer.transform(domSource, streamResult);
    return out.toString();
  }

  /**
   * Enumeration for handling the return from getResources of new temp URLs.
   */
  private static class UrlEnumeration implements Enumeration<URL> {
    private URL url;

    UrlEnumeration(URL url) {
      this.url = url;
    }

    public boolean hasMoreElements() {
      return url != null;
    }

    public URL nextElement() {
      final URL url2 = url;
      url = null;
      return url2;
    }
  }

  private String readFile(URL url) {
    StringBuilder sb = new StringBuilder();
    try {
      BufferedReader br = new BufferedReader(new FileReader(new File(url
          .toURI())));
      while (br.ready()) {
        sb.append(br.readLine()).append("\n");
      }
      br.close();
    } catch (RuntimeException e) {
      // do nothing
    } catch (Exception e) {
      // do nothing
    }
    return sb.toString();
  }
}
