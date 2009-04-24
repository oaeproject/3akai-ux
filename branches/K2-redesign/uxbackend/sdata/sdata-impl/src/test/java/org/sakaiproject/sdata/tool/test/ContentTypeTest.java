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

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.sakaiproject.sdata.tool.ContentTypes;

/**
 * 
 */
public class ContentTypeTest {
  private static final String APP_OCTET = "application/octet-stream";
  private static final String TEXT = "text/plain";

  @Test
  public void testContentType() {
    assertEquals(APP_OCTET, ContentTypes.getContentType(null, null));
    assertEquals(APP_OCTET, ContentTypes.getContentType(null, APP_OCTET));
    assertEquals(APP_OCTET, ContentTypes.getContentType("/sdfsdfl", APP_OCTET));
    assertEquals(APP_OCTET, ContentTypes.getContentType("/sdfsdfl.bin", APP_OCTET));
    assertEquals(TEXT, ContentTypes.getContentType("/sdfsdfl.txt", TEXT));
    assertEquals(TEXT, ContentTypes.getContentType("/sdfsdfl.txt", APP_OCTET));
  }

}
