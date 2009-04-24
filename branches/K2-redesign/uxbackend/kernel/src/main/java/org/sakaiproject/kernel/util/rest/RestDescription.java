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
package org.sakaiproject.kernel.util.rest;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.sakaiproject.kernel.util.XmlUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 *
 */
public class RestDescription {

  private static final String XMLHEADER = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
      + "<restdoc>";
  private static final String XMLFOOTER = "</restdoc>";
  private static final String HTMLFOOTER = "</body></html>";
  private static final String HTMLHEADER1 = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
      + "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n"
      + "<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en-US\" lang=\"en-US\">\n"
      + "<head profile=\"http://www.w3.org/2000/08/w3c-synd/#\"> \n"
      + "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" /> \n"
      + "<style type=\"text/css\">\n"
      + "/**/\n"
      + "body {\n"
      + "  background-color:#FFFFFF;\n"
      + "  font-family: arial, helvetica, sans-serif;\n"
      + "}\n"
      + "h1, h2, h3, h4, h5 {\n"
      + "  border-bottom: thin solid;\n"
      + "}\n"
      + "h1 {\n"
      + "   font-size: 1.5em;\n"
      + "}\n"
      + "h2 {\n"
      + "   font-size: 1.3em;\n"
      + "}\n"
      + "h3 {\n"
      + "   font-size: 1.2em;\n"
      + "   font-style: italic;\n"
      + "}\n"
      + "dt {\n"
      + "   font-weight: bold;\n"
      + "   margin-top: 1em;\n"
      + "   padding-left: 50px;\n"
      + "   padding-top: 5px;\n"
      + "   padding-bottom: 5px;\n"
      + "}\n"
      + "dd {\n"
      + "   background:#CCCCCC none repeat scroll 0 0;\n"
      + "}\n"
      + "/**/\n"
      + "</style>" + "<title> ";
  private static final String HTMLHEADER2 = "</title>" + "</head><body>";
  Map<String, Object> content = new HashMap<String, Object>();
  private String json;
  private String html;
  private String xml;
  private String title;
  private String shortDescription;
  private String backUrl = "../?doc=1";

  
  
  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestDescription#addParameter(java.lang.String,
   *      java.lang.String, java.lang.String)
   */
  public void addParameter(String parameterName, String description) {
    Map<String, String> m = getMap(content, "parameters");
    m.put(parameterName, description);
  }

  /**
   * @param string
   * @return
   */
  @SuppressWarnings("unchecked")
  private <K, V> Map<K, V> getMap(Map<String, Object> source, String name) {
    Map<K, V> m = (Map<K, V>) source.get(name);
    if (m == null) {
      m = Maps.newLinkedHashMap();
      source.put(name, m);
    }
    return m;
  }

  /**
   * @param content2
   * @param string
   * @return
   */
  @SuppressWarnings("unchecked")
  private <T> List<T> getList(Map<String, Object> source, String name) {
    List<T> m = (List<T>) source.get(name);
    if (m == null) {
      m = Lists.newArrayList();
      source.put(name, m);
    }
    return m;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestDescription#addHeader(java.lang.String,
   *      java.lang.String)
   */
  public void addHeader(String header, String description) {
    Map<String, String> m = getMap(content, "headers");
    m.put(header, description);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestDescription#addResponse(String,
   *      java.lang.String)
   */
  public void addResponse(String code, String description) {
    Map<String, String> m = getMap(content, "response");
    m.put(code, description);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestDescription#addSection(int,
   *      java.lang.String, java.lang.String)
   */
  public void addSection(int level, String title, String body) {
    List<Object[]> m = getList(content, "sections");
    m.add(new Object[] { level, title, body });
  }

  /**
   * @param i
   * @param string
   * @param shortDescription2
   * @param string2
   */
  public void addSection(int level, String title, String body, String link) {
    List<Object[]> m = getList(content, "sections");
    m.add(new Object[] { level, title, body, link });
  }
  /**
   * @param level
   * @param title2
   * @param body
   * @param b
   */
  public void addSection(int level, String title, String body, boolean html) {
    List<Object[]> m = getList(content, "sections");
    m.add(new Object[] { level, title, body, null, html });  }


  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestDescription#addURLTemplate(java.lang.String,
   *      java.lang.String)
   */
  public void addURLTemplate(String template, String description) {
    Map<String, String> m = getMap(content, "templates");
    m.put(template, description);
  }

  /**
   * @param title
   *          the title to set
   */
  public void setTitle(String title) {
    this.title = title;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestDescription#toHtml()
   */
  public String toHtml() {
    if (html == null) {
      html = generateHtml();
    }
    return html;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestDescription#toJson()
   */
  public String toJson() {
    if (json == null) {
      json = generateJson();
    }
    return json;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestDescription#toXml()
   */
  public String toXml() {
    if (xml == null) {
      xml = generateXml();
    }
    return xml;
  }

  /**
   * @return
   */
  private String generateJson() {
    StringBuilder sb = new StringBuilder();
    sb.append("{ title : ");
    sb.append(jsonValue(title));
    sb.append(",\n sections : [ ");
    List<Object[]> sections = getList(content, "sections");
    boolean first = true;
    for (Object[] section : sections) {
      if (!first) {
        sb.append(",\n");
      }
      sb.append("{ level : ").append(jsonValue(String.valueOf(section[0])));
      sb.append(",\n title : ").append(jsonValue(String.valueOf(section[1])));
      sb.append(",\n body : ").append(jsonValue(String.valueOf(section[2])))
          .append("}");
      first = false;
    }
    sb.append("] ,\n templates : [ ");
    addMapJsonOutput(sb, content, "templates", "template");
    sb.append("] ,\n parameters : [ ");
    addMapJsonOutput(sb, content, "parameters", "parameter");
    sb.append("] ,\n headers : [ ");
    addMapJsonOutput(sb, content, "headers", "header");
    sb.append("] ,\n responses : [ ");
    addMapJsonOutput(sb, content, "response", "code");
    sb.append("]}");
    return sb.toString();
  }

  /**
   * @param sb
   * @param content2
   * @param string
   * @param string2
   */
  private void addMapJsonOutput(StringBuilder sb, Map<String, Object> content,
      String name, String term) {
    Map<String, String> parameters = getMap(content, name);
    boolean first = true;
    for (Entry<String, String> parameter : parameters.entrySet()) {
      if (!first) {
        sb.append(",\n");
      }
      sb.append("{ ").append(term).append(":").append(
          jsonValue(parameter.getKey())).append(", description: ").append(
          jsonValue(parameter.getValue())).append("}");
      first = false;
    }
  }

  /**
   * @param key
   * @return
   */
  private String jsonValue(String value) {
    StringBuilder sb = new StringBuilder();
    sb.append("\"");
    if (value != null) {
      for (char c : value.toCharArray()) {
        switch (c) {
        case '"':
          sb.append("\\\"");
          break;
        default:
          sb.append(c);
        }
      }

    }
    sb.append("\"");
    return sb.toString();
  }

  /**
   * @return
   */
  private String generateHtml() {
    StringBuilder sb = new StringBuilder();
    sb.append(HTMLHEADER1);
    sb.append(XmlUtils.encode(title));
    sb.append(HTMLHEADER2);
    sb.append("<p><a href=\"").append(backUrl).append("\" >back to all services</a></p>");
    sb.append("<h3>").append(XmlUtils.encode(title)).append("</h3>");
    sb.append("<p>").append(XmlUtils.encode(shortDescription)).append("</p>");
    List<Object[]> sections = getList(content, "sections");
    for (Object[] section : sections) {
      boolean html = false;
      if ( section.length > 4 ) {
        html = (Boolean) section[4];
      }
      int level = ((Integer) section[0]).intValue();
      String title = (String) section[1];
      String body = (String) section[2];
      sb.append("<h").append(level).append(">").append(html?title:XmlUtils.encode(title))
          .append("</h").append(level).append(">");
      sb.append("<p class=\"section").append(level).append("\" >");
      sb.append(html?body:XmlUtils.encode(body));
      sb.append("</p>");
      if (section.length > 3 && section[3] != null) {
        sb.append("<p> <a href=\"").append(section[3]).append(
            "\" >More information</a> </p> ");
      }
    }
    sb.append("<h2>URL Patterns</h2>");
    addMapOutput(sb, content, "templates");
    sb.append("<h2>Parameters</h2>");
    addMapOutput(sb, content, "parameters");
    sb.append("<h2>Headers</h2>");
    addMapOutput(sb, content, "headers");
    sb.append("<h2>Response</h2>");
    addMapOutput(sb, content, "response");
    sb.append(HTMLFOOTER);
    return sb.toString();
  }

  /**
   * @param sb
   * @param content2
   * @param string
   */
  private void addMapOutput(StringBuilder sb, Map<String, Object> content,
      String name) {
    Map<String, String> parameters = getMap(content, name);
    sb.append("<dl class=\"").append(name).append("\"> ");
    for (Entry<String, String> parameter : parameters.entrySet()) {
      sb.append("<dt>").append(XmlUtils.encode(parameter.getKey())).append(
          "</dt>");
      sb.append("<dd>").append(XmlUtils.encode(parameter.getValue())).append(
          "</dd>");
    }
    sb.append("</dl>");
  }

  /**
   * @return
   */
  private String generateXml() {
    StringBuilder sb = new StringBuilder();
    sb.append(XMLHEADER);
    List<Object[]> sections = getList(content, "sections");
    for (Object[] section : sections) {
      int level = ((Integer) section[0]).intValue();
      String title = (String) section[1];
      String body = (String) section[2];
      sb.append("<section level=\"").append(level).append("\" >");
      sb.append("<title>").append(XmlUtils.encode(title)).append("</title>");
      sb.append("<description>").append(XmlUtils.encode(body)).append(
          "</description>");
      sb.append("</section>");
    }
    addMapXmlOutput(sb, content, "templates", "template");
    addMapXmlOutput(sb, content, "parameters", "parameter");
    addMapXmlOutput(sb, content, "headers", "header");
    addMapXmlOutput(sb, content, "response", "statuscode");
    sb.append(XMLFOOTER);
    return sb.toString();
  }

  /**
   * @param sb
   * @param content2
   * @param string
   * @param string2
   */
  private void addMapXmlOutput(StringBuilder sb, Map<String, Object> content,
      String name, String term) {
    Map<String, String> parameters = getMap(content, name);
    sb.append("<").append(name).append(">");
    for (Entry<String, String> parameter : parameters.entrySet()) {
      sb.append("<").append(term).append(">").append(
          XmlUtils.encode(parameter.getKey())).append("</").append(term)
          .append(">");
      sb.append("<description>").append(XmlUtils.encode(parameter.getValue()))
          .append("</description>");
    }
    sb.append("</").append(name).append(">");
  }

  /**
   * @return the title
   */
  public String getTitle() {
    return title;
  }

  /**
   * @return
   */
  public String getShortDescription() {
    return shortDescription;
  }

  /**
   * @param shortDescription
   *          the shortDescription to set
   */
  public void setShortDescription(String shortDescription) {
    this.shortDescription = shortDescription;
  }

  /**
   * @param backUrl the backUrl to set
   */
  public void setBackUrl(String backUrl) {
    this.backUrl = backUrl;
  }


}
