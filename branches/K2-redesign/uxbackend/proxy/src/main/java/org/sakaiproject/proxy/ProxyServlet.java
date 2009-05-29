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

package org.sakaiproject.proxy;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;

/**
 *
 */
public class ProxyServlet extends HttpServlet {

	/**
	   *
	   */
	private static final long serialVersionUID = 2383631675063579262L;

	/**
     * To set a referer limitation, add an init parameter to the Servlet
     * reference in your web.xml, setting the
     * parameter name limitReferer to the url prefix 
     * being allowed for referals using this Servlet.
     */
    String limitReferer = null;

    public void init( ServletConfig servletConfig ) throws ServletException {
        super.init(servletConfig);
        
        limitReferer = getServletConfig().getInitParameter("limitReferer");
    }
    
	
	@Override
	public void doPost(final HttpServletRequest req,
			final HttpServletResponse resp) throws ServletException, IOException {

		System.out.println("posted");
		System.out.flush();
		if (limitReferer != null && limitReferer.trim().length() > 0) {
			String referer = req.getHeader("Referer");
			String localName = req.getLocalName();
			if (!referer.startsWith(limitReferer)) {
				final String msg = new StringBuilder().append(
						"Blocked request for referer ").append(referer).append(
						", localName->").append(localName).append(
						". The referer acceptance is limited to ").append(
						limitReferer).toString();
				
				PrintWriter out = resp.getWriter();
				out.println(msg);
				out.close();
				return;
			}
		}

		URL url = null;
		String user = null, password = null, method = "GET", post = null;
		int timeout = 0;

		Set entrySet = req.getParameterMap().entrySet();
		
		

		System.out.println("parameters.");
		System.out.flush();
		
		Map<String, String> headers = new HashMap<String, String>();
		for (Object anEntrySet : entrySet) {
			Map.Entry header = (Map.Entry) anEntrySet;
			String key = (String) header.getKey();
			String value = ((String[]) header.getValue())[0];
			if ("user".equals(key)) {
				user = value;
			} else if ("password".equals(key)) {
				password = value;
			} else if ("timeout".equals(key)) {
				timeout = Integer.parseInt(value);
			} else if ("method".equals(key)) {
				method = value;
			} else if ("post".equals(key)) {
				post = URLDecoder.decode(value);
			} else if ("url".equals(key)) {
				url = new URL(value);
			} else {
				headers.put(key, value);
			}
		}

		System.out.println("post : " + post);
		System.out.println("method : " + method);
		System.out.println("url : " + url);
		System.out.flush();

		if (url != null) {

			System.out.println("starturl stuff");
			System.out.flush();
			String digest = null;
			if (user != null && password != null) {
				digest = "Basic "
						+ new String(Base64
								.encodeBase64((user + ":" + password)
										.getBytes()));
			}

			boolean foundRedirect = false;
			do {

				HttpURLConnection urlConnection = (HttpURLConnection) url
						.openConnection();
				if (digest != null) {
					urlConnection.setRequestProperty("Authorization", digest);
				}
				urlConnection.setDoOutput(true);
				urlConnection.setDoInput(true);
				urlConnection.setUseCaches(false);
				urlConnection.setInstanceFollowRedirects(false);
				urlConnection.setRequestMethod(method);
				if (timeout > 0) {
					urlConnection.setConnectTimeout(timeout);
				}

				// set headers
				Set headersSet = headers.entrySet();
				for (Object aHeadersSet : headersSet) {
					Map.Entry header = (Map.Entry) aHeadersSet;
					urlConnection.setRequestProperty((String) header.getKey(),
							(String) header.getValue());
				}

				// send post
				if (post != null) {
					OutputStreamWriter outRemote = new OutputStreamWriter(
							urlConnection.getOutputStream());
					outRemote.write(post);
					outRemote.flush();
				}

				// get content type
				String contentType = urlConnection.getContentType();
				if (contentType != null) {
					resp.setContentType(contentType);
				}

				// get reponse code
				int responseCode = urlConnection.getResponseCode();

				if (responseCode == 302) {
					// follow redirects
					String location = urlConnection.getHeaderField("Location");
					url = new URL(location);
					foundRedirect = true;
				} else {
					resp.setStatus(responseCode);
					BufferedInputStream in;
					if (responseCode == 200 || responseCode == 201) {
						in = new BufferedInputStream(urlConnection
								.getInputStream());
					} else {
						in = new BufferedInputStream(urlConnection
								.getErrorStream());
					}

					// send output to client
					BufferedOutputStream out = new BufferedOutputStream(resp
							.getOutputStream());
					int c;
					while ((c = in.read()) >= 0) {
						out.write(c);
					}
					out.flush();
				}
			} while (foundRedirect);

		} else {
			/*
			if (LOG.isEnabledFor(Level.ERROR)) {
				LOG.error("[doPost]: Given url was null.");
			}
			*/
		}
	}	
}