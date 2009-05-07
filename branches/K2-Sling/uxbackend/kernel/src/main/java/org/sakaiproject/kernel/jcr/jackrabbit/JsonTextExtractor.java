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

package org.sakaiproject.kernel.jcr.jackrabbit;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.jackrabbit.extractor.AbstractTextExtractor;
import org.sakaiproject.kernel.util.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.io.StringReader;
import java.lang.reflect.Array;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 */
public class JsonTextExtractor extends AbstractTextExtractor {

  public JsonTextExtractor() {
    super(new String[] { "text/json" });

  }

  public Reader extractText(InputStream stream, String type, String encoding)
      throws IOException {
    if (encoding == null) {
      encoding = "UTF-8";
    }
    String content = IOUtils.readFully(stream, encoding);
    Map<String, Object> map = convertToObject(content, HashMap.class);
    StringBuilder sb = new StringBuilder();
    mapToString(map, sb);
    return new StringReader(sb.toString());
  }

  /**
   * @param map
   * @param sb
   */
  private void mapToString(Map<String, Object> map, StringBuilder sb) {
    for (java.util.Map.Entry<String, Object> e : map.entrySet()) {
      objectToString(e.getValue(), sb);
    }
  }

  /**
   * @param value
   * @param sb
   */
  @SuppressWarnings("unchecked")
  private void objectToString(Object o, StringBuilder sb) {
    if (o instanceof Map) {
      mapToString((Map<String, Object>) o, sb);
    } else if (o instanceof Iterable) {
      for (Object oe : (Iterable<?>) o) {
        objectToString(oe, sb);
      }
    } else if (o.getClass().isArray()) {
      for (Object oe : (Object[]) o) {
        objectToString(oe, sb);
      }
    } else {
      sb.append(" ").append(String.valueOf(o));
    }
  }

  /**
   * Convert the json string into a pojo based on the supplied root class.
   *
   * @param string
   *          the json string
   * @param rootBeanClass
   *          the root class of the bean
   * @param <T>
   *          The typep of the pojo to be returned
   * @return A pojo of the same type as the rootBeanClass
   */
  @SuppressWarnings( { "unchecked", "deprecation" })
  public <T> T convertToObject(String string, final Class<?> rootBeanClass) {

    if ("".equals(string)) {
      string = "{}";
    }
    if (string.startsWith("[")) {
      JSONArray jsonArray = JSONArray.fromObject(string);

      if (rootBeanClass.isArray()) {
        Class<?> componentType = rootBeanClass.getComponentType();
        List<?> o = JSONArray.toList(jsonArray, componentType);
        Object[] result = (Object[]) Array.newInstance(componentType, o.size());
        for (int i = 0; i < o.size(); i++) {
          result[i] = o.get(i);
        }
        return (T) result;

      } else {
        Object o = JSONArray.toList(jsonArray, rootBeanClass);

        return (T) o;
      }
    } else {
      JSONObject jsonObject = JSONObject.fromObject(string);
      Object o = JSONObject.toBean(jsonObject, rootBeanClass);
      return (T) o;

    }
  }

}
