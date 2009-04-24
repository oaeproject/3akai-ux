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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.Map.Entry;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 * Some utility functions to simpilfy handling SF json-lib objects.
 */
public class JsonLibConverterUtils {
  /**
   * The Logger.
   */
  protected static final Log LOG = LogFactory.getLog(JsonLibConverterUtils.class);

  /**
   * Dumps a JSON Object out to the log at info level.
   *
   * @param jsonObject
   *                The object to dump
   * @param indent
   *                the indent to be used per object nesting.
   */
  public static final void dumpJsonObject(JSONObject jsonObject, String indent) {
    for (Object o : jsonObject.entrySet()) {
      Entry<?, ?> entry = (Entry<?, ?>) o;
      Object key = entry.getKey();
      Object value = entry.getValue();
      if (value instanceof JSONObject) {
        LOG.info(indent + key + ":JSONObject");
        dumpJsonObject((JSONObject) value, indent + "  ");
      } else if (value instanceof JSONArray) {
        LOG.info(indent + key + ":JSONArray " + ((JSONArray) value).size());
        dumpJsonArray((JSONArray) value, indent + "  ");
      } else {
        if (value == null) {
          LOG.info(indent + key + ":null:na");
        } else {
          LOG.info(indent + key + ":" + value + ":" + value.getClass());
        }
      }
    }
  }

  /**
   * Dump a json object to the log.
   * @param array a json array to dump
   * @param indent the indent for each level of nesting
   */
  public static void dumpJsonArray(JSONArray array, String indent) {
    for (Object value : array) {
      if (value instanceof JSONObject) {
        LOG.info(indent + ":JSONObject");
        dumpJsonObject((JSONObject) value, indent + "  ");
      } else if (value instanceof JSONArray) {
        LOG.info(indent + ":JSONArray " + ((JSONArray) value).size());
        dumpJsonArray((JSONArray) value, indent + "  ");
      } else {
        LOG.info(indent + ":" + value + ":" + (value == null ? "na" : value.getClass()));
      }
    }
  }
}
