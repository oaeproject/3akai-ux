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

import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.name.Named;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;
import net.sf.json.JsonConfig;
import net.sf.json.util.JSONUtils;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.serialization.BeanConverter;

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 * BeanConverter implementation us the net.sf.json-lib json library.
 */
public class BeanJsonLibConverter implements BeanConverter {
  /**
   * The Logger.
   */
  protected static final Log LOG = LogFactory
      .getLog(BeanJsonLibConverter.class);
  /**
   * The Guice injector used to create beans.
   */
  private Injector injector;
  /**
   * Json Config object used by each instance.
   */
  private JsonConfig jsonConfig;
  /**
   * in IDE debug flag.
   */
  private boolean debugMode = false;

  /**
   * Create an BeanConverter with an injector.
   *
   * @param injector
   *          the Guice injector to use for conversion
   * @param jsonConfig
   *          the Json Configuration
   */
  @Inject
  public BeanJsonLibConverter(Injector injector,
      @Named("SakaiKernelJsonConfig") JsonConfig jsonConfig) {
    this.injector = injector;
    this.jsonConfig = jsonConfig;
  }

  public String getContentType() {
    return "application/json";
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
  @SuppressWarnings("unchecked")
  public <T> T convertToObject(String string, final Class<?> rootBeanClass) {

    if ("".equals(string)) {
      string = "{}";
    }
    if (string.startsWith("[")) {
      JSONArray jsonArray = JSONArray.fromObject(string, jsonConfig);
      if (debugMode) {
        JsonLibConverterUtils.dumpJsonArray(jsonArray, " ");
      }

      if (rootBeanClass.isArray()) {
        Class<?> componentType = rootBeanClass.getComponentType();
        Object rootObject = injector.getInstance(componentType);
        List<?> o = JSONArray.toList(jsonArray, rootObject, jsonConfig);
        Object[] result = (Object[]) Array.newInstance(componentType, o.size());
        for (int i = 0; i < o.size(); i++) {
          result[i] = o.get(i);
        }
        return (T) result;

      } else {
        Object rootObject = injector.getInstance(rootBeanClass);
        Object o = JSONArray.toList(jsonArray, rootObject, jsonConfig);

        return (T) o;
      }
    } else {
      JSONObject jsonObject = JSONObject.fromObject(string, jsonConfig);

      if (debugMode) {
        JsonLibConverterUtils.dumpJsonObject(jsonObject, " ");
      }

      Object rootObject = injector.getInstance(rootBeanClass);
      T o = (T) JSONObject.toBean(jsonObject, rootObject, jsonConfig);
      return o;

    }
  }

  @SuppressWarnings("unchecked")
  public Map<String, Object> convertToMap(String json) {
    JSONObject jsonObject = JSONObject.fromObject(json);
    Map<String, Object> finalMap = (Map<String, Object>) JSONObject.toBean(
        jsonObject, HashMap.class);
    convertLists(finalMap);
    return finalMap;
  }

  /**
   * @param finalMap
   */
  @SuppressWarnings("unchecked")
  private void convertLists(Map<String, Object> map) {
    for (Entry<String, Object> e : map.entrySet()) {
      Object o = e.getValue();
      Class<?> clazz = null;
      if (o instanceof Iterable) {

        Iterable<?> c = (Iterable<?>) o;
        for (Object co : c) {
          if (co != null) {
            if (clazz == null) {
              clazz = co.getClass();
            } else if (clazz.isAssignableFrom(co.getClass())) {
              clazz = co.getClass();
            } else {
              clazz = Object.class;
            }
          }
        }
        if ( clazz == null ) {
          clazz = Object.class;
        }
        e.setValue(((Collection) o).toArray((Object[]) Array.newInstance(clazz, 0)));
      } else if (o instanceof Map) {
        convertLists((Map<String, Object>) o);
      }
    }
  }

  /**
   * Convert the pojo to a json string representation.
   *
   * @param pojo
   *          the pojo to convert
   * @return the json string representation of the pojo.
   */
  public String convertToString(Object pojo) {
    if ("".equals(pojo)) {
      return "{}";
    }

    try {
      JSONObject jsonObject = JSONObject.fromObject(pojo, jsonConfig);
      return jsonObject.toString();
    } catch (JSONException jse) {
      Class<?> pojoClass = pojo.getClass();
      if (JSONUtils.isArray(pojoClass)) {
        JSONArray jsonArray = JSONArray.fromObject(pojo);
        String result = jsonArray.toString();
        return result;
      }
      throw jse;
    }
  }

  /**
   * Add a mapping to the json -> pojo conversion map.
   *
   * @param key
   *          the name of the json key to bind to
   * @param class1
   *          the class that should be used to represent that key
   */
  @SuppressWarnings("unchecked")
  public void addMapping(String key, Class<?> class1) {
    jsonConfig.getClassMap().put(key, class1);
  }

  /**
   * reset any mappings.
   */
  public void resetMappings() {
    jsonConfig.getClassMap().clear();
  }

  /**
   * @param debugMode
   *          the debugMode to set
   */
  public void setDebugMode(boolean debugMode) {
    this.debugMode = debugMode;
  }
}
