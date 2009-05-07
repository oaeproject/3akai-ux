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
package org.sakaiproject.kernel.serialization.json;

import java.util.Collection;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.util.PropertyFilter;

/**
 * A property filter that rejects null values.
 */
public class NullPropertyFilter implements PropertyFilter {

  /**
   * Filter the output of a property, if it should be emitted return false.
   * @param source The object containing the value
   * @param name the name of the key in the output structure
   * @param value the value of the object
   * @return true if the property should be filtered, false if not.
   */
  public boolean apply(Object source, String name, Object value) {
    if (value == null) {
      return true;
    }
    if (value instanceof JSONArray) {
      JSONArray array = (JSONArray) value;
      if (array.size() == 0) {
        return true;
      }
    }
    if (value instanceof JSONObject) {
      JSONObject object = (JSONObject) value;
      if (object.isNullObject() || object.isEmpty()) {
        return true;
      }
    }
    if (value instanceof Collection) {
      Collection<?> collection = (Collection<?>) value;
      if (collection.size() == 0) {
        return true;
      }
    }
    if (value instanceof Object[]) {
      Object[] oarray = (Object[]) value;
      if (oarray.length == 0) {
        return true;
      }
    }
    return false;
  }

}