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

package org.sakaiproject.sdata.tool.test;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.junit.Test;
import org.sakaiproject.kernel.serialization.json.JsonLibConverterUtils;

/**
 *
 */
public class JsonLibConverterUtilsTest {

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.serialization.json.shindig.social.core.util.JsonLibConverterUtils#dumpJsonObject(net.sf.json.JSONObject, java.lang.String)}.
   */
  @Test
  public void testDumpJsonObject() {
    JSONObject jo = new JSONObject();
    JSONObject jo2 = new JSONObject();
    jo.put("nested", jo2);
    jo.put("array", new JSONArray());
    jo.put("null", null);
    jo.put("nonnull", "Non Null");
    JsonLibConverterUtils.dumpJsonObject(jo, " ");
  }

  /**
   * Test method for
   * {@link org.sakaiproject.kernel.serialization.json.shindig.social.core.util.JsonLibConverterUtils#dumpJsonArray(net.sf.json.JSONArray, java.lang.String)}.
   */
  @Test
  public void testDumpJsonArray() {
    JSONObject jo = new JSONObject();
    JSONObject jo2 = new JSONObject();
    jo.put("nested", jo2);
    jo.put("array", new JSONArray());
    jo.put("null", null);
    jo.put("nonnull", "Non Null");
    JSONArray joa = new JSONArray();
    JsonLibConverterUtils.dumpJsonArray(joa, " ");
    joa.add(jo);
    joa.add(jo);
    joa.add(new JSONArray());
    JsonLibConverterUtils.dumpJsonArray(joa, " ");
  }

}
