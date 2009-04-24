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

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;

/**
 * Abstration of resource loading, that understands file refernece as well as
 * classpath resources.
 */
public class ResourceLoader {

  public static final String INLINE = "inline://";
  public static final String RESOURCE = "res://";
  private static final String FILE = "file:/";
  private static final String REMOTE_FILE = "file://";

  /**
   * Get an input stream for a resource.
   * 
   * @param resource
   *          a URI pointing to the resource, URI's starting res:// mean
   *          resources from the classpath and inline:// means the rest of the
   *          uri is the resource. Anything else is resolved as a file.
   * @param classLoader
   *          the classloader to perform the search in, this must be supplied as
   *          most users of this method will not be in the same classloader as
   *          this class.
   * @return the input stream for the resource. It is the callers responsibility
   *         to close this stream.
   * @throws IOException
   *           if the resource could not be opened.
   */
  public static InputStream openResource(String resource,
      ClassLoader classLoader) throws IOException {
    if (resource.startsWith(RESOURCE)) {
      InputStream in = classLoader.getResourceAsStream(resource.substring(6));
      if (in == null) {
        throw new IOException("Unable to find resource " + resource + " using "
            + classLoader);
      }
      return in;
    } else if (resource.startsWith(INLINE)) {
      return new ByteArrayInputStream(resource.substring(INLINE.length())
          .getBytes("UTF-8"));
    } else if ( resource.startsWith(REMOTE_FILE) ) {
      URL url = new URL(resource);
      return url.openStream();
    } else if (resource.startsWith(FILE)) {
      return new FileInputStream("/"+resource.substring(FILE.length()));
    } else if (resource.startsWith("jar:") || resource.indexOf("://") > 0) {
      URL url = new URL(resource);
      return url.openStream();
    } else {
      return new FileInputStream(resource);
    }
  }

  /**
   * Read a resource into a string.
   * 
   * @param d
   *          the URI for the resource, @see openResource(String resource,
   *          ClassLoader classLoader)
   * @param classLoader
   *          the classLoader to use to load the resource.
   * @return the contents of the resource.
   * @throws IOException
   *           if there was a problem opening the resource.
   */
  public static String readResource(String resource, ClassLoader classLoader)
      throws IOException {
    BufferedReader in = new BufferedReader(new InputStreamReader(openResource(
        resource, classLoader)));
    StringBuilder sb = new StringBuilder();
    try {
      for (String line = in.readLine(); line != null; line = in.readLine()) {
        sb.append(line);
      }
    } finally {
      in.close();
    }
    return sb.toString();
  }

  /**
   * @param nextElement
   * @return
   * @throws IOException
   */
  public static String readResource(URL url) throws IOException {
    BufferedReader in = new BufferedReader(new InputStreamReader(url
        .openStream()));
    StringBuilder sb = new StringBuilder();
    try {
      for (String line = in.readLine(); line != null; line = in.readLine()) {
        sb.append(line);
      }
    } finally {
      in.close();
    }
    return sb.toString();
  }

}
