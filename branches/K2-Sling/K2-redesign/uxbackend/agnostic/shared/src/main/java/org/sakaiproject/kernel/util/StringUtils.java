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

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 *
 */
public class StringUtils {

  private static final char[] TOHEX = "0123456789abcdef".toCharArray();
  public static final String UTF8 = "UTF8";

  public static String sha1Hash(String tohash)
      throws UnsupportedEncodingException, NoSuchAlgorithmException {
    byte[] b = tohash.getBytes("UTF-8");
    MessageDigest sha1 = MessageDigest.getInstance("SHA");
    b = sha1.digest(b);
    return byteToHex(b);
  }

  public static String byteToHex(byte[] base) {
    char[] c = new char[base.length * 2];
    int i = 0;

    for (byte b : base) {
      int j = b;
      j = j + 128;
      c[i++] = TOHEX[j / 0x10];
      c[i++] = TOHEX[j % 0x10];
    }
    return new String(c);
  }

  /**
   * @param owners
   * @param owner
   * @return
   */
  public static String[] addString(String[] a, String v) {
    for (String o : a) {
      if (v.equals(o)) {
        return a;
      }
    }
    String[] na = new String[a.length + 1];
    for (int i = 0; i < a.length; i++) {
      na[i] = a[i];
    }
    na[na.length - 1] = v;
    return na;
  }

  /**
   * Removes a <code>String</code> from a <code>String</code> array.
   *
   * @param a
   *          Array to search and remove from if String found
   * @param v
   *          String to search for.
   * @return
   */
  public static String[] removeString(String[] a, String v) {
    int i = 0;
    for (String o : a) {
      if (!v.equals(o)) {
        i++;
      }
    }
    if (i == a.length) {
      return a;
    }
    String[] na = new String[i];
    i = 0;
    for (String o : a) {
      if (!v.equals(o)) {
        na[i++] = o;
      }
    }
    return na;
  }

  /**
   * Convenience method for calling join with a variable length argument rather
   * than an array.
   *
   * @param elements
   *          the elements to build the string from
   * @param i
   *          the starting index.
   * @param c
   *          the separator character
   * @return a joined string starting with the separator.
   */
  public static String join(char c, String... elements) {
    return org.apache.commons.lang.StringUtils.join(elements, c);
  }

  /**
   * @param query
   * @return
   */
  public static String escapeJCRSQL(String query) {
    StringBuilder sb = new StringBuilder();
    char[] ca = query.toCharArray();
    for (char c : ca) {
      switch (c) {
      case '\'':
        sb.append("''");
        break;
      case '\"':
        sb.append("\\\"");
        break;
      default:
        sb.append(c);
        break;
      }
    }
    return sb.toString();
  }
}
