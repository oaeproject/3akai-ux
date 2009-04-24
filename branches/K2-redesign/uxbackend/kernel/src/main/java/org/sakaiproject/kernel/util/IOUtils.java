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


import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;


/**
 *
 */
public class IOUtils {

  /**
   * Read an input stream fully, and then close the input stream reliably.
   *
   * @param inputStream
   *          the input stream from which to read
   * @param encoding
   *          the encoding to use when converting from byte to char
   * @return a string containing the contents of the input stream with the
   *         requested conversion. If the input stream was null, a null string is returned.
   * @throws IOException
   *           if there was an IOException
   * @throws UnsupportedEncodingException
   *           if the encoding requested is not supported.
   */
  public static String readFully(InputStream inputStream, String encoding)
      throws UnsupportedEncodingException, IOException {
    if (inputStream != null) {
      StringBuilder sb = new StringBuilder();
      try {
        byte[] b = new byte[4096];
        for (int i = inputStream.read(b); i > 0; i = inputStream.read(b)) {
          sb.append(new String(b, 0, i, encoding));
        }
      } finally {
        try {
          inputStream.close();
        } catch (Exception ex) {
        }
      }
      return sb.toString();
    }
    return null;
  }

  /**
   * @param in
   * @param outputStream
   * @throws IOException
   */
  public static void stream(InputStream from, OutputStream to) throws IOException {
    byte[] b = new byte[4096];
    for(int i = from.read(b, 0, 4096); i >= 0; i = from.read(b, 0, 4096)) {
      if ( i == 0 ) {
        Thread.yield();
      } else {
        to.write(b,0,i);
      }
    }
  }

}
