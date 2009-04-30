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
package org.sakaiproject.kernel.rest.chatstatus;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import javax.jcr.RepositoryException;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;

import com.google.inject.Inject;

@Path("/chatstatus")
public class ChatStatusProvider implements Documentable,
		JaxRsSingletonProvider, Initialisable {

	private static final String OK = "{\"response\", \"OK\"}";
	private static final String ERROR = "{\"response\", \"ERROR\"}";
	private BeanConverter beanConverter;
	private JCRNodeFactoryService jcrNodeFactoryService;
	private SessionManagerService sessionManagerService;
	private UserFactoryService userFactoryService;
	private Registry<String, JaxRsSingletonProvider> jaxRsSingletonRegistry;

	private static final RestDescription REST_DOCS = new RestDescription();
	static {
		REST_DOCS.setTitle("Chatstatus Service");
		REST_DOCS.setShortDescription("The Chatstatus rest service");
		REST_DOCS
				.addURLTemplate("/ping/<location>",
						"Ping presence for the current user, optionally setting the location");
		REST_DOCS.addURLTemplate("/friends",
				"Get an online status and profileinformation for my friends");
		REST_DOCS.addURLTemplate("/status/<location>",
				"Get the online status at a location");
		REST_DOCS.addURLTemplate("/status", "POST, set my status");
	}

	/**
	   *
	   */
	@Inject
	public ChatStatusProvider(BeanConverter beanConverter,
			JCRNodeFactoryService jcrNodeFactoryService,
			SessionManagerService sessionManagerService,
			UserFactoryService userFactoryService,
			RegistryService registryService) {
		this.beanConverter = beanConverter;
		this.sessionManagerService = sessionManagerService;
		this.jcrNodeFactoryService = jcrNodeFactoryService;
		this.userFactoryService = userFactoryService;
		jaxRsSingletonRegistry = registryService
				.getRegistry(JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY);

		jaxRsSingletonRegistry.add(this);
	}

	@GET
	@Path("/get")
	@Produces(MediaType.TEXT_PLAIN)
	public String getStatus()
			throws JCRNodeFactoryServiceException, RepositoryException, IOException {
		// Get the user's id
		String userId = sessionManagerService.getCurrentUserId();
		if (!StringUtils.isEmpty(userId) && !"anon".equals(userId)) {
			InputStream inputStream = null;
			String profilePath = "";
			String content = "";
			JSONObject o = null;
			try {
				// Get the profile path of a user
				profilePath = userFactoryService.getUserProfilePath(userId);
				if (!StringUtils.isEmpty(profilePath)) {
					inputStream = 
						jcrNodeFactoryService.getInputStream(profilePath);
				} else {
					return generateResponse(
						"ERROR", 
						"message",
						"Could not get the profile path for the user."
					);
				}

				content = IOUtils.readFully(inputStream, "UTF-8");
				o = JSONObject.fromObject(content);
				return o.getString("chatstatus");
			// The JSONExeption occurs when there is no chatstatus found
			} catch (JSONException e) {
				o.put("chatstatus", "online");
				saveChatStatus(o, profilePath);
				e.printStackTrace();
				return "online";
			} catch (Exception e) {
				e.printStackTrace();
			} finally{
				if(!inputStream.equals(null)){
					inputStream.close();
				}
			}
		} else {
			return generateResponse("ERROR", "message",
					"User is anonymous or not logged in.");
		}
		return ERROR;
	}
	
	@POST
	@Path("/set")
	@Produces(MediaType.TEXT_PLAIN)
	public String setstatus(@FormParam("chatstatus") String chatstatus) throws IOException {
		// Get the user's id
		String userId = sessionManagerService.getCurrentUserId();
		if (!StringUtils.isEmpty(userId) && !"anon".equals(userId)) {
			InputStream inputStream = null;
			String profilePath = "";
			String content = "";
			JSONObject o = null;
			try {
				// Get the profile path of a user
				profilePath = userFactoryService.getUserProfilePath(userId);
				if (!StringUtils.isEmpty(profilePath)) {
					inputStream = 
						jcrNodeFactoryService.getInputStream(profilePath);
				} else {
					return generateResponse(
						"ERROR", 
						"message",
						"Could not get the profile path for the user."
					);
				}

				content = IOUtils.readFully(inputStream, "UTF-8");
				o = JSONObject.fromObject(content);
				o.put("chatstatus", chatstatus);
				saveChatStatus(o, profilePath);
				return OK;
			} catch (Exception e) {
				e.printStackTrace();
			} finally{
				if(!inputStream.equals(null)){
					inputStream.close();
				}
			}
		} else {
			return generateResponse("ERROR", "message",
					"User is anonymous or not logged in.");
		}
		return ERROR;
	}

	/**
	 * 
	 * @param o
	 * @param profilePath
	 * @throws UnsupportedEncodingException
	 * @throws RepositoryException
	 * @throws JCRNodeFactoryServiceException
	 */
	private void saveChatStatus(JSONObject o, String profilePath)
			throws UnsupportedEncodingException,
			JCRNodeFactoryServiceException, RepositoryException {
		String json = beanConverter.convertToString(o);
		InputStream in = new ByteArrayInputStream(json.getBytes("UTF8"));
		try {
			jcrNodeFactoryService.setInputStream(profilePath, in,
					RestProvider.CONTENT_TYPE);
		} finally {
			try {
				in.close();
			} catch (Exception ex) {
			}
		}
	}

	/**
	 * Generate a JSON response.
	 * 
	 * @param response
	 *            ERROR or OK
	 * @param typeOfResponse
	 *            The name of the extra tag you want to add.
	 * @param parameters
	 *            The object you wish to parse.
	 * @return
	 */
	public String generateResponse(String response, String typeOfResponse,
			Object parameters) {
		Map<String, Object> mapResponse = new HashMap<String, Object>();
		mapResponse.put("response", response);
		mapResponse.put(typeOfResponse, parameters);
		return beanConverter.convertToString(mapResponse);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.rest.Documentable#getRestDocumentation()
	 */
	public RestDescription getRestDocumentation() {
		return REST_DOCS;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider#getJaxRsSingleton()
	 */
	public Documentable getJaxRsSingleton() {
		return this;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.Provider#getKey()
	 */
	public String getKey() {
		return "chatstatus";
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.Provider#getPriority()
	 */
	public int getPriority() {
		return 0;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.webapp.Initialisable#destroy()
	 */
	public void destroy() {
		jaxRsSingletonRegistry.remove(this);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.webapp.Initialisable#init()
	 */
	public void init() {
	}

}
