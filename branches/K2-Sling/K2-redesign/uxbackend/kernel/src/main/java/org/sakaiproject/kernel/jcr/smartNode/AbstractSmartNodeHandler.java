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
package org.sakaiproject.kernel.jcr.smartNode;

import org.sakaiproject.kernel.api.jcr.SmartNodeHandler;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

/**
 * Base class for common smart node functionality.
 */
public abstract class AbstractSmartNodeHandler implements SmartNodeHandler {
  protected void writeUtf8(HttpServletResponse response, Object obj)
      throws UnsupportedEncodingException, IOException {
    byte[] b = obj.toString().getBytes("UTF-8");
    response.setContentType("text/plain;charset=UTF-8");
    response.setContentLength(b.length);
    ServletOutputStream output = response.getOutputStream();
    output.write(b);
  }

protected static final String COUNT_KEY = "count";
}
