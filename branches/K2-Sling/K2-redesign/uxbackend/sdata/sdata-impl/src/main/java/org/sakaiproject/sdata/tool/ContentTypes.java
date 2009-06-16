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
package org.sakaiproject.sdata.tool;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.util.ResourceLoader;

/**
 * @author ieb
 */
public class ContentTypes {

  private static final Log LOG = LogFactory.getLog(ContentTypes.class);

  private static Map<String, String> contentTypes = new HashMap<String, String>();

  static {
    Properties p = new Properties();
    InputStream in = null;
    try {
      in = ResourceLoader.openResource("res://ContentTypes.properties",
          ContentTypes.class.getClassLoader());

      p.load(in);
      in.close();
    } catch (IOException e) {
      LOG.error("Failed to load Content Types ", e);
    }
    for (Object k : p.keySet()) {
      for (String ext : p.getProperty(String.valueOf(k)).split(" ")) {
        contentTypes.put(ext, String.valueOf(k));
      }
    }

  }

  /**
   * Get the content type for a resource based on the suspected content type. If
   * the content type is specified, its is used, if its null, or
   * application/octect-stream then the extension is used to generate a more
   * specific content type. If that is not possible, application/octet-stream is
   * used.
   * 
   * @param name
   *          the name of the resource
   * @param contentType
   *          the suspected content type
   * @return the verified content type of the resource.
   */
  public static String getContentType(String name, String contentType) {
    if (contentType == null || "application/octet-stream".equals(contentType)) {
      if (name == null || name.endsWith(".")) {
        return "application/octet-stream";
      }
      int lastDot = name.lastIndexOf(".");
      String ext = name.substring(lastDot + 1).toLowerCase();
      String ct = contentTypes.get(ext);
      if (ct == null) {
        return "application/octet-stream";
      } else {
        return ct;
      }

    } else {
      return contentType;
    }
  }

}
