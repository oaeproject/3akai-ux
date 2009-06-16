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
package org.sakaiproject.sdata.tool.functions;

import org.sakaiproject.sdata.tool.api.SDataException;

import javax.servlet.http.HttpServletResponse;

public class SDataFunctionUtil {
  public static void checkMethod(String method, String methods)
      throws SDataException {
    if (methods != null && methods.indexOf(method) < 0) {
      throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
          "Function is not available for method " + method
              + " only available on " + methods);
    }
  }

}
