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

package org.sakaiproject.kernel.rest;

import com.google.inject.Inject;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.PathUtils;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import javax.jcr.AccessDeniedException;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * The rest patch provider provides an ability to modify values in json hash map
 * using name value pairs.
 */
public class RestPatchProvider implements RestProvider {

	/**
   *
   */
	public static class MapParams {
		public String[] names;
		public String[] values;
		public String[] actions;
		public String[] indexes;

		/**
		 * @param request
		 */
		public MapParams(HttpServletRequest request) {
			names = request.getParameterValues(NAME);
			values = request.getParameterValues(VALUE);
			actions = request.getParameterValues(ACTION);
			indexes = request.getParameterValues(INDEX);
			if (names == null || values == null || actions == null
					|| names.length != values.length
					|| names.length != actions.length || names.length == 0) {
				throw new RestServiceFaultException(
						HttpServletResponse.SC_BAD_REQUEST,
						"The "
								+ NAME
								+ " or "
								+ VALUE
								+ " or"
								+ ACTION
								+ " parameters are either not present or they are not of the same size");
			}
			if (indexes != null && indexes.length != names.length) {
				throw new RestServiceFaultException(
						HttpServletResponse.SC_BAD_REQUEST,
						"If some properties are to be indexed, all must be specified, the '"
								+ INDEX
								+ "' array must be the same lenght as the '"
								+ KEY + "' array");
			}
			for (String name : names) {
				if (StringUtils.isEmpty(name)) {
					throw new RestServiceFaultException(
							HttpServletResponse.SC_BAD_REQUEST,
							" The array of " + NAME + " has empty names ");
				}
			}
		}
	}

	private static final RestDescription DESC = new RestDescription();

	private static final String NAME = "k";

	private static final String VALUE = "v";
	private static final String ACTION = "a";
	private static final String INDEX = "i";

	private static final String KEY = "patch";

	private static final String PRIVATE = "p";

	private static final String SHARED = "f";

	private static final String UPDATE_ACTION = "u";

	private static final String REMOVE_ACTION = "r";

	static {
		DESC.setTitle("Patch");
		DESC.setBackUrl("../__describe__");
		DESC.setShortDescription("Patches a json resource name value pairs.");
		DESC
				.addSection(1, "Introduction",
						"This service allows the modification of name value pairs within a resource.");
		DESC.addSection(2, "Patch ",
				"Performs a patch operation, and returns  "
						+ HttpServletResponse.SC_OK
						+ " on sucess, if the resource does not exis a "
						+ HttpServletResponse.SC_NOT_FOUND + " is returned ");
		DESC.addURLTemplate("/rest/" + KEY + "/" + PRIVATE + "/<resource>",
				"Accepts POST to patch the contents of a private file");
		DESC.addURLTemplate("/rest/" + KEY + "/" + SHARED + "/<resource>",
				"Accepts POST to patch the contents of a private file");
		DESC.addSection(2, "POST", "");
		DESC.addParameter(NAME, "multiple value, An array of property names");
		DESC.addParameter(VALUE, "multiple value, An array of property values");
		DESC.addParameter(ACTION, "multiple value, An array of action values "
				+ UPDATE_ACTION + " or " + REMOVE_ACTION + " where "
				+ UPDATE_ACTION + " will add a value that is not present ");
		DESC
				.addParameter(
						INDEX,
						"multiple value, An array of property idex flags, if 1 the corresponding key is indexed, if 0 it is not");
		DESC.addResponse(String.valueOf(HttpServletResponse.SC_OK),
				"If the action completed Ok");
		DESC.addResponse(String.valueOf(HttpServletResponse.SC_FORBIDDEN),
				"If permission to modify the resource is denied");
		DESC.addResponse(String
				.valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
				" Any other error");
	}

	private JCRNodeFactoryService jcrNodeFactoryService;

	private BeanConverter beanConverter;

	private UserFactoryService userFactoryService;

	@Inject
	public RestPatchProvider(RegistryService registryService,
			JCRNodeFactoryService jcrNodeFactoryService,
			BeanConverter beanConverter, UserFactoryService userFactoryService) {
		Registry<String, RestProvider> registry = registryService
				.getRegistry(RestProvider.REST_REGISTRY);
		registry.add(this);
		this.jcrNodeFactoryService = jcrNodeFactoryService;
		this.beanConverter = beanConverter;
		this.userFactoryService = userFactoryService;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.rest.RestProvider#dispatch(java.lang.String[],
	 *      javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse)
	 */
	public void dispatch(String[] elements, HttpServletRequest request,
			HttpServletResponse response) {
		try {
			if (elements.length >= 1) {
				// the URL is the path to the resource.

				Map<String, Object> map = null;
				if (PRIVATE.equals(elements[1])
						&& "POST".equals(request.getMethod())) {
					map = doPatchPrivate(elements, request, response);
				} else if (SHARED.equals(elements[1])
						&& "POST".equals(request.getMethod())) {
					map = doPatchShared(elements, request, response);
				} else {
					throw new RestServiceFaultException(
							HttpServletResponse.SC_METHOD_NOT_ALLOWED);
				}
				if (map != null) {
					String responseBody = beanConverter.convertToString(map);
					response.setContentType(RestProvider.CONTENT_TYPE);
					response.getOutputStream().print(responseBody);
				}
			}
		} catch (AccessDeniedException ex) {
			throw new RestServiceFaultException(
					HttpServletResponse.SC_FORBIDDEN, ex.getMessage(), ex);
		} catch (SecurityException ex) {
			throw ex;
		} catch (RestServiceFaultException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new RestServiceFaultException(ex.getMessage(), ex);
		}
	}

	/**
	 * @param elements
	 * @param request
	 * @param response
	 * @return
	 * @throws JCRNodeFactoryServiceException
	 * @throws RepositoryException
	 * @throws IOException
	 * @throws UnsupportedEncodingException
	 */
	private Map<String, Object> doPatchShared(String[] elements,
			HttpServletRequest request, HttpServletResponse response)
			throws RepositoryException, JCRNodeFactoryServiceException,
			UnsupportedEncodingException, IOException {

		String path = "/" + StringUtils.join(elements, "/", 2, elements.length);
		path = PathUtils.normalizePath(path);
		return saveProperties(path, new MapParams(request));
	}

	/**
	 * @param elements
	 * @param request
	 * @param response
	 * @return
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws RepositoryException
	 * @throws UnsupportedEncodingException
	 */
	private Map<String, Object> doPatchPrivate(String[] elements,
			HttpServletRequest request, HttpServletResponse response)
			throws UnsupportedEncodingException, RepositoryException,
			JCRNodeFactoryServiceException, IOException {

		String user = request.getRemoteUser();

		String path = StringUtils.join(elements, "/", 2, elements.length);
		path = userFactoryService.getUserSharedPrivatePath(user) + path;
		path = PathUtils.normalizePath(path);
		return saveProperties(path, new MapParams(request));
	}

	/**
	 * @param path
	 * @param strings
	 * @param strings2
	 * @param strings3
	 * @throws JCRNodeFactoryServiceException
	 * @throws RepositoryException
	 * @throws IOException
	 * @throws UnsupportedEncodingException
	 */
	private Map<String, Object> saveProperties(String path, MapParams params)
			throws RepositoryException, JCRNodeFactoryServiceException,
			UnsupportedEncodingException, IOException {
		InputStream in = null;

		try {
			Node n = jcrNodeFactoryService.getNode(path);
			Map<String, Object> map = null;
			if (n != null) {
				in = jcrNodeFactoryService.getInputStream(path);
				String content = IOUtils.readFully(in, "UTF-8");
				try {
					in.close();
				} catch (IOException ex) {
				}
				map = beanConverter.convertToMap(content);
			} else {
				map = new HashMap<String, Object>();
			}
			for (int i = 0; i < params.names.length; i++) {
				if (REMOVE_ACTION.equals(params.actions[i])) {
					map.remove(params.names[i]);
				} else {
					//	If this is a JSON object we add it like that.
					try {
						JSONObject obj = JSONObject.fromObject(params.values[i]);	
						map.put(params.names[i], obj);					
					}
					catch (JSONException jsonEx) {
						map.put(params.names[i], params.values[i]);
					}
				}
			}
			String result = beanConverter.convertToString(map);
			in = new ByteArrayInputStream(result.getBytes("UTF-8"));
			n = jcrNodeFactoryService.setInputStream(path, in,
					RestProvider.CONTENT_TYPE);

			// deal with indexed properties.
			for (int i = 0; i < params.names.length; i++) {
				boolean index = false;
				if (params.indexes != null && "1".equals(params.indexes[i])) {
					index = true;
				}
				if (n.hasProperty("sakai:" + params.names[i])) {
					// if remove, remove it, else update
					if (REMOVE_ACTION.equals(params.actions[i])) {
						n.getProperty("sakai:" + params.names[i]).remove();
					} else {
						n.setProperty("sakai:" + params.names[i],
								params.values[i]);
					}
				} else if (index) {
					// add it
					n.setProperty("sakai:" + params.names[i], params.values[i]);
				}

			}
			n.getSession().save(); // verify changes
			Map<String, Object> outputMap = new HashMap<String, Object>();
			outputMap.put("response", "OK");
			return outputMap;
		} finally {
			try {
				in.close();
			} catch (Exception ex) {
			}
		}
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.rest.RestProvider#getDescription()
	 */
	public RestDescription getDescription() {
		return DESC;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.Provider#getKey()
	 */
	public String getKey() {
		return KEY;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.Provider#getPriority()
	 */
	public int getPriority() {
		return 0;
	}

}
