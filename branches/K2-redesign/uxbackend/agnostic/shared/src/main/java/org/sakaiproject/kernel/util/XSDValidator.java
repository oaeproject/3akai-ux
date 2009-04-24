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
package org.sakaiproject.kernel.util;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.xml.sax.SAXException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

import javax.xml.parsers.SAXParserFactory;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;

/**
 * Validator utility for testing.
 */
public class XSDValidator {
  /**
   * The schema langiage being used.
   */
  private static final String W3C_XML_SCHEMA = "http://www.w3.org/2001/XMLSchema";
  protected static final Log LOG = LogFactory.getLog(XSDValidator.class);

  /**
   * Validate a xml string against a supplied schema.
   *
   * @param xml the xml presented as a string
   * @param schema an input stream containing the xsd
   * @return a list of errors or a 0 lenght string if none.
   */
  public static String validate(String xml, InputStream schema) {
    try {
      return validate(new ByteArrayInputStream(xml.getBytes("UTF-8")), schema);
    } catch (UnsupportedEncodingException e) {
      return e.getMessage();
    }
  }

  /**
   * Validate a xml input stream against a supplied schema.
   * @param xml a stream containing the xml
   * @param schema a stream containing the schema
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
      validator.validate(new StreamSource(xml));
    } catch (IOException e) {
      errors.append(e.getMessage()).append("\n");
    } catch (SAXException e) {
      errors.append(e.getMessage()).append("\n");
    }
    return errors.toString();
  }
}
