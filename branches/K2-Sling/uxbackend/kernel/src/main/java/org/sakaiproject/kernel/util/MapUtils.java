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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;

import org.apache.commons.lang.StringUtils;

import java.util.Map;

/**
 * A utility class containing static methods for manipulating maps. Uses Google
 * collections internally.cd
 * cd
 */
public class MapUtils {
  /**
   * Converts a name value string delimited with = and ; into an immutable map.
   *
   * @param values
   *          the contents of the map
   * @return an immutable map.
   */
  public static Map<String, String> convertToImmutableMap(String values) {
    Map<String, String> m = Maps.newHashMap();
    String[] templates = StringUtils.split(values, ';');
    if (templates != null) {
      for (String template : templates) {
        String[] nv = StringUtils.split(template, "=", 2);
        m.put(nv[0].trim(), nv[1].trim());
      }
    }
    return ImmutableMap.copyOf(m);
  }

}
