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
package org.sakaiproject.kernel.util.user;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class UserLocale {



  /**
   * @param locale
   * @return
   */
  public static Map<String, Object> localeToMap(Locale l) {
    Map<String, Object> localeMap = new HashMap<String, Object>();
    localeMap.put("country", l.getCountry());
    localeMap.put("displayCountry", l.getDisplayCountry(l));
    localeMap.put("displayLanguage", l.getDisplayLanguage(l));
    localeMap.put("displayName", l.getDisplayName(l));
    localeMap.put("displayVariant", l.getDisplayVariant(l));
    localeMap.put("ISO3Country", l.getISO3Country());
    localeMap.put("ISO3Language", l.getISO3Language());
    localeMap.put("language", l.getLanguage());
    localeMap.put("variant", l.getVariant());
    return localeMap;
  }
  /**
   * @param locale
   * @return
   */
  public static Map<String, Object> localeToMap(Locale l, String timezone) {
    Map<String, Object> localeMap = localeToMap(l);
    System.err.println("LOCALETOMAP: " + timezone);
    localeMap.put("timezone", timezone);
    return localeMap;
  }

}
