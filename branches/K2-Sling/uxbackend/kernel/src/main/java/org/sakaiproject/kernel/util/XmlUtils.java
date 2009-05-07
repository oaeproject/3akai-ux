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
 */package org.sakaiproject.kernel.util;

import org.w3c.dom.Element;
import org.w3c.dom.ls.LSInput;
import org.w3c.dom.ls.LSResourceResolver;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;

/**
 * Some of this code comes from Apache Axis. Header has been left as is, some
 * modifications have been made.
 *
 * Abstract class for XML String encoders.
 *
 * The new encoding mechanism fixes the following bugs/issues:
 * http://nagoya.apache.org/bugzilla/show_bug.cgi?id=15133
 * http://nagoya.apache.org/bugzilla/show_bug.cgi?id=15494
 * http://nagoya.apache.org/bugzilla/show_bug.cgi?id=19327
 *
 * @author <a href="mailto:jens@void.fm">Jens Schumann</a>
 * @author <a href="mailto:dims@yahoo.com">Davanum Srinivas</a>
 *
 */
public class XmlUtils {
  /**
   * The schema language being used.
   */
  private static final String W3C_XML_SCHEMA = "http://www.w3.org/2001/XMLSchema";

  protected static final String AMP = "&amp;";
  protected static final String QUOTE = "&quot;";
  protected static final String LESS = "&lt;";
  protected static final String GREATER = "&gt;";
  protected static final String LF = "\n";
  protected static final String CR = "\r";
  protected static final String TAB = "\t";

  /**
   * Encode a string
   *
   * @param xmlString
   *          string to be encoded
   * @return encoded string
   */
  public static String encode(String xmlString) {
    if (xmlString == null) {
      return "";
    }
    char[] characters = xmlString.toCharArray();
    StringBuilder out = null;
    char character;

    for (int i = 0; i < characters.length; i++) {
      character = characters[i];
      switch (character) {
      // we don't care about single quotes since axis will
      // use double quotes anyway
      case '&':
        if (out == null) {
          out = getInitialByteArray(xmlString, i);
        }
        out.append(AMP);
        break;
      case '"':
        if (out == null) {
          out = getInitialByteArray(xmlString, i);
        }
        out.append(QUOTE);
        break;
      case '<':
        if (out == null) {
          out = getInitialByteArray(xmlString, i);
        }
        out.append(LESS);
        break;
      case '>':
        if (out == null) {
          out = getInitialByteArray(xmlString, i);
        }
        out.append(GREATER);
        break;
      case '\n':
        if (out == null) {
          out = getInitialByteArray(xmlString, i);
        }
        out.append(LF);
        break;
      case '\r':
        if (out == null) {
          out = getInitialByteArray(xmlString, i);
        }
        out.append(CR);
        break;
      case '\t':
        if (out == null) {
          out = getInitialByteArray(xmlString, i);
        }
        out.append(TAB);
        break;
      default:
        if (character < 0x20) {
          throw new IllegalArgumentException("Invalid XML Character "
              + Integer.toHexString(character) + " in " + xmlString);
        } else {
          if (out != null) {
            out.append(character);
          }
        }
        break;
      }
    }
    if (out == null) {
      return xmlString;
    }
    return out.toString();
  }

  protected static StringBuilder getInitialByteArray(String aXmlString, int pos) {
    return new StringBuilder(aXmlString.substring(0, pos));
  }

  /**
   * Validate a xml input stream against a supplied schema.
   *
   * @param xml
   *          a stream containing the xml
   * @param schema
   *          a stream containing the schema
   * @return a list of errors or warnings, a 0 lenght string if none.
   */
  public static String validate(InputStream xml, InputStream schema) {

    SAXParserFactory factory = SAXParserFactory.newInstance();
    factory.setNamespaceAware(true);
    factory.setValidating(true);
    final StringBuilder errors = new StringBuilder();
    try {
      SchemaFactory schemaFactory = SchemaFactory.newInstance(W3C_XML_SCHEMA);
      Schema s = schemaFactory.newSchema(new StreamSource(schema));

      Validator validator = s.newValidator();
      final LSResourceResolver lsr = validator.getResourceResolver();
      validator.setResourceResolver(new LSResourceResolver() {

        public LSInput resolveResource(String arg0, String arg1, String arg2,
            String arg3, String arg4) {
          return lsr.resolveResource(arg0, arg1, arg2, arg3, arg4);
        }

      });

      validator.validate(new StreamSource(xml));
    } catch (IOException e) {
      errors.append(e.getMessage()).append("\n");
    } catch (SAXException e) {
      errors.append(e.getMessage()).append("\n");
    }

    return errors.toString();
  }

  /**
   * Fetch a builder from the pool, creating a new one only if necessary.
   */
  private static DocumentBuilder getBuilder()
      throws ParserConfigurationException {
    DocumentBuilderFactory builderFactory = DocumentBuilderFactory
        .newInstance();
    return builderFactory.newDocumentBuilder();
  }

  /**
   * Attempts to parse the input xml into a single element.
   *
   * @param xml
   * @return The document object
   * @throws Exception
   *           if a parse error occured.
   */
  public static Element parse(String xml) throws Exception {
    DocumentBuilder builder = getBuilder();
    InputSource is = new InputSource(new StringReader(xml.trim()));
    Element element = builder.parse(is).getDocumentElement();
    return element;
  }
}
