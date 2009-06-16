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

import java.util.Date;

import org.apache.commons.lang.time.FastDateFormat;

/**
 * Utility methods for working with dates.
 */
public class DateUtils {
	private final static String RFC3339_FMT = "yyyy-MM-dd hh:mm:ssZ";
	private final static String RFC2822_FMT = "EEE, dd MMM yyyy HH:mm:ss Z";
  private final static FastDateFormat rfc3339;
  private final static FastDateFormat rfc2822;

  static {
    rfc3339 = FastDateFormat.getInstance(RFC3339_FMT);
    rfc2822 = FastDateFormat.getInstance(RFC2822_FMT);
  }

  /**
   * Returns an <a href="http://www.ietf.org/rfc/rfc3339.txt">RFC 3339</a>
   * compliant time stamp.
   *
   * @return yyyy-MM-dd hh:mm:ssZ
   * @see java.text.SimpleDateFormat
   */
  public static String rfc3339() {
    Date d = new Date();
    String s = rfc3339.format(d);
    return s;
  }

  /**
   * Returns an <a href="http://www.ietf.org/rfc/rfc2822.txt">RFC 2822</a>
   * compliant time stamp for messages.
   *
   * @return EEE, dd MMM yyyy HH:mm:ss Z
   * @see java.text.SimpleDateFormat
   */
  public static String rfc2822() {
    Date d = new Date();
    String s = rfc2822.format(d);
    return s;
  }
}
