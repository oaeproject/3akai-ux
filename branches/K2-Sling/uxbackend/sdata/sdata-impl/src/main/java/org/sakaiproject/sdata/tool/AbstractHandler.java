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

package org.sakaiproject.sdata.tool;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.api.HandlerSerialzer;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.api.SDataFunction;

public abstract class AbstractHandler implements Handler {

	/**
   * 
   */
  private static final long serialVersionUID = -8914648460468510102L;
  protected HandlerSerialzer serializer;

  public void sendMap(HttpServletRequest request,
			HttpServletResponse response, Map<String, Object> contetMap)
			throws IOException {
		serializer.sendMap(request, response, contetMap);
	}


  public void sendError(HttpServletRequest request,
			HttpServletResponse response, Throwable ex) throws IOException {
    ex.printStackTrace();
    serializer.sendError(this, request, response, ex);
	}

	public void doDelete(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		sendError(request, response, new SDataException(
				HttpServletResponse.SC_METHOD_NOT_ALLOWED,
				"Method Not Implemented "));
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		sendError(request, response, new SDataException(
				HttpServletResponse.SC_METHOD_NOT_ALLOWED,
				"Method Not Implemented "));
	}

	public void doHead(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		sendError(request, response, new SDataException(
				HttpServletResponse.SC_METHOD_NOT_ALLOWED,
				"Method Not Implemented "));
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		sendError(request, response, new SDataException(
				HttpServletResponse.SC_METHOD_NOT_ALLOWED,
				"Method Not Implemented "));
	}

	public void doPut(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		sendError(request, response, new SDataException(
				HttpServletResponse.SC_METHOD_NOT_ALLOWED,
				"Method Not Implemented "));
	}
	
  public boolean describe(HttpServletRequest request, HttpServletResponse response, SDataFunction m) throws IOException {
    if ( "1".equals(request.getParameter("doc")) ) {
      RestDescription description;
      if ( m == null ) {
        description = getDescription();
      } else {
        description = m.getDescription();
      }
      String format = request.getParameter("fmt");
      if ( "xml".equals(format) ) {
        response.setContentType("text/xml");
        response.getWriter().print(description.toXml());
      } else if ( "json".equals(format) ) {
        response.setContentType(RestProvider.CONTENT_TYPE);
        response.getWriter().print(description.toJson());
      } else {
        response.setContentType("text/html");
        response.getWriter().print(description.toHtml());            
      }
      return true;
    }
    return false;
  }


}
