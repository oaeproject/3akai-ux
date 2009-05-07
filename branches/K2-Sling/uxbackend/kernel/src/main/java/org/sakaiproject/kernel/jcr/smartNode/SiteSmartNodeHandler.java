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
package org.sakaiproject.kernel.jcr.smartNode;

import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.SmartNodeHandler;
import org.sakaiproject.kernel.util.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 */
public class SiteSmartNodeHandler implements SmartNodeHandler {

  private static final String KEY = "site";

  private static final String LAST_MODIFIED = "Last-Modified";

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.SmartNodeHandler#count(javax.servlet.http.HttpServletRequest,
   *      javax.servlet.http.HttpServletResponse, javax.jcr.Node, java.lang.String)
   */
  public void count(HttpServletRequest request, HttpServletResponse response, Node node,
      String statement) throws RepositoryException, IOException {

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.jcr.SmartNodeHandler#handle(javax.servlet.http.HttpServletRequest,
   *      javax.servlet.http.HttpServletResponse, javax.jcr.Node, javax.jcr.Node,
   *      java.lang.String)
   */
  public void handle(HttpServletRequest request, HttpServletResponse response, Node node,
      Node smartNode, String statement) throws RepositoryException, IOException {
    // the statement contains the location of the content to deliver.
    Node resource = smartNode.getNode(JCRConstants.JCR_CONTENT);
    Property lastModified = resource.getProperty(JCRConstants.JCR_LASTMODIFIED);
    Property mimeType = resource.getProperty(JCRConstants.JCR_MIMETYPE);
    Property content = resource.getProperty(JCRConstants.JCR_DATA);

    response.setContentType(mimeType.getString());
    if (mimeType.getString().startsWith("text")) {
      if (resource.hasProperty(JCRConstants.JCR_ENCODING)) {
        Property encoding = resource.getProperty(JCRConstants.JCR_ENCODING);
        response.setCharacterEncoding(encoding.getString());
      }
    }
    response.setDateHeader(LAST_MODIFIED, lastModified.getDate().getTimeInMillis());
    setGetCacheControl(response);

    String currentEtag = String.valueOf(lastModified.getDate().getTimeInMillis());
    response.setHeader("ETag", currentEtag);

    long totallength = content.getLength();

    response.setContentLength((int) totallength);

    OutputStream out = response.getOutputStream();

    InputStream in = content.getStream();
    IOUtils.stream(in, out);

  }

  /**
   * @param response
   */
  private void setGetCacheControl(HttpServletResponse response) {
    response.addHeader("Cache-Control", "public");
    response.addHeader("Cache-Control", "max-age=600");
    response.addHeader("Cache-Control", "s-maxage=600");
    response.setDateHeader("Date", System.currentTimeMillis());
    // make it expire in the future
    response.setDateHeader("Expires", System.currentTimeMillis() + 600000);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return KEY;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getPriority()
   */
  public int getPriority() {
    return 0;
  }

}
