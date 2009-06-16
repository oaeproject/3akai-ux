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

package org.sakaiproject.sdata.tool.json;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.api.HandlerSerialzer;
import org.sakaiproject.sdata.tool.api.SDataException;

/**
 * @author ieb
 *
 */
public class JsonHandlerSerializer implements HandlerSerialzer {

	public void sendError(Handler handler, HttpServletRequest request,
			HttpServletResponse response, Throwable ex) throws IOException {
		if (ex instanceof SDataException)
		{
			SDataException sde = (SDataException) ex;
			response.reset();
			handler.setHandlerHeaders(request, response);
			response.sendError(sde.getCode(), sde.getMessage());
		}
		else
		{
			response.reset();
			handler.setHandlerHeaders(request, response);
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
					"Failed with " + ex.getMessage());
		}
		
	}

	public void sendMap(HttpServletRequest request,
			HttpServletResponse response, Map<String, Object> contetMap)
			throws IOException {
		JSONObject jsonObject = JSONObject.fromObject(contetMap);
		byte[] b = jsonObject.toString().getBytes("UTF-8");
		response.setContentType("text/plain;charset=UTF-8");
		response.setContentLength(b.length);
		response.getOutputStream().write(b);
		
	}



}
