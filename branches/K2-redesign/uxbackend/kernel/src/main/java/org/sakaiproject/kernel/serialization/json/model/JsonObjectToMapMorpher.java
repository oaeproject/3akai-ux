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
package org.sakaiproject.kernel.serialization.json.model;

import net.sf.ezmorph.Morpher;
import net.sf.ezmorph.ObjectMorpher;
import net.sf.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

/**
 * A morpher that converts objects into maps
 */
public class JsonObjectToMapMorpher implements Morpher, ObjectMorpher {

  /**
   * @return the class that the morper will morph to
   */
  public Class<?> morphsTo() {
    return Map.class;
  }

  /**
   * @param clazz the class being checked
   * @return true if this morpher supports the class
   */
  @SuppressWarnings("unchecked")
  public boolean supports(Class clazz) {
    return (JSONObject.class.equals(clazz));
  }

  /**
   * @param the bean to be morphed
   * @return the morphed bean (a map)
   */
  public Object morph(Object bean) {
    Map<Object, Object> result = new HashMap<Object, Object>();
    JSONObject jsonObject = (JSONObject) bean;
    for (Object entry : jsonObject.entrySet()) {
      result.put(((Entry<?,?>)entry).getKey(), ((Entry<?,?>)entry).getValue());
    }
    return result;
  }

}
