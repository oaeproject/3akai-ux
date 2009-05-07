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
package org.sakaiproject.kernel.rest.me;

import org.sakaiproject.kernel.rest.DefaultUserInfoParser;

import com.google.common.collect.ImmutableMap;
import com.google.inject.Inject;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.util.user.AnonUser;
import org.sakaiproject.kernel.util.user.NullUserEnvironment;
import org.sakaiproject.kernel.util.user.UserLocale;
import org.sakaiproject.kernel.webapp.Initialisable;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.jcr.RepositoryException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Implements the Me service.
 */
public class RestMeProvider implements RestProvider, Initialisable {

	private static final String ANON_UE_FILE = "/configuration/defaults/anonue.json";
	private static RestDescription DESCRIPTION = new RestDescription();
	private JCRNodeFactoryService jcrNodeFactoryService;
	private SessionManagerService sessionManagerService;
	private BeanConverter beanConverter;
	private UserEnvironmentResolverService userEnvironmentResolverService;
	private UserResolverService userResolverService;
	private UserFactoryService userFactoryService;
	private Registry<String, RestProvider> registry;
	private DefaultUserInfoParser defaultUserInfoParser;

	@Inject
	public RestMeProvider(RegistryService registryService,
			SessionManagerService sessionManagerService,
			JCRNodeFactoryService jcrNodeFactoryService,
			UserResolverService userResolverService, DefaultUserInfoParser defaultUserInfoParser,
			UserFactoryService userFactoryService, BeanConverter beanConverter,
			UserEnvironmentResolverService userEnvironmentResolverService) {
		registry = registryService.getRegistry(RestProvider.REST_REGISTRY);
		registry.add(this);

		this.sessionManagerService = sessionManagerService;
		this.jcrNodeFactoryService = jcrNodeFactoryService;
		this.beanConverter = beanConverter;
		this.userEnvironmentResolverService = userEnvironmentResolverService;
		this.userResolverService = userResolverService;
		this.userFactoryService = userFactoryService;
		this.defaultUserInfoParser = defaultUserInfoParser;
		
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.webapp.Initialisable#init()
	 */
	public void init() {
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.webapp.Initialisable#destroy()
	 */
	public void destroy() {
		registry.remove(this);
	}

	static {
		DESCRIPTION.setTitle("Me Service");
		DESCRIPTION.setBackUrl("../__describe__");
		DESCRIPTION
				.setShortDescription("The Me service provides information about "
						+ "the current user");
		DESCRIPTION
				.addSection(
						1,
						"Introduction",
						"The Me Service, when queried will respond with a json specific "
								+ "to the logged in user. If no logged in user is present, then an "
								+ "anonymouse json response will be sent. In addition some headers "
								+ "will be modified to reflect the locale preferences of the user.");
		DESCRIPTION
				.addSection(
						2,
						"Response: Anon User",
						"Where the user is an anon user the response will contain 2 parts, "
								+ "a description of the locale and a default anon user environment. The "
								+ "locale is derived from the locale specified in the request and the "
								+ "locale of the server. ");
		DESCRIPTION
				.addSection(
						2,
						"Response: Authenticated User",
						"Where the user is an authenticaated user the response will contain 2 parts, "
								+ "a description of the locale and a authenticated user environment, of if none "
								+ "is found a default one for the user. The "
								+ "locale is derived from the locale specified in the request, any prefereces "
								+ "expressed by the user and the "
								+ "locale of the server. ");
		DESCRIPTION.addParameter("none", "The service accepts no parameters ");
		DESCRIPTION
				.addHeader("none",
						"The service neither looks for headers nor sets any non standard headers");
		DESCRIPTION
				.addURLTemplate(
						"me",
						"The service is selected by /rest/me and provides the me json for the current user.");
		DESCRIPTION
				.addURLTemplate(
						"me/<userid,userid,userid>",
						"The service is selected by /rest/me and provides the a reduced me json response for the specified user.");
		DESCRIPTION
				.addResponse(
						"200",
						"The service returns a JSON body with 2 structures locale, and preferences. eg "
								+ " { locale :{\"country\":\"US\",\"variant\":\"\",\"displayCountry\":\"United States\","
								+ "\"ISO3Country\":\"USA\",\"displayVariant\":\"\",\"language\":\"en\",\"displayLanguage\":\"English\","
								+ "\"ISO3Language\":\"eng\",\"displayName\":\"English (United States)\"}, "
								+ "preferences :{ userid : \"ib236\",  superUser: false,  subjects : [\"group1:maintain\" ,\"group2:maintain\" ,"
								+ "\"group2:access\" ,\".engineering:student\"]},"
								+ "\"userStoragePrefix\":\"/12/14/useuuid\",\"profile\": {} }");

	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.rest.RestProvider#dispatch(java.lang.String[],
	 *      javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse) /x/y/z?searchOrder=1231231
	 */
	public void dispatch(String[] elements, HttpServletRequest request,
			HttpServletResponse response) {
		try {
			if (elements.length > 1) {
				doOtherUser(elements, request, response);
			} else {
				doUser(elements, request, response);
			}
		} catch (SecurityException ex) {
			throw ex;
		} catch (RestServiceFaultException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new RestServiceFaultException(ex.getMessage(), ex);
		}

	}

	/**
	 * Output another user, limited information set.
	 * 
	 * @param elements
	 *            the path elements of the request.
	 * @param request
	 *            the request object.
	 * @param response
	 *            the response object.
	 * @throws IOException
	 *             if there was a problem sending the output.
	 * @throws RepositoryException
	 *             the there was a problem with the repository.
	 * @throws JCRNodeFactoryServiceException 
	 */
	private void doOtherUser(String[] elements, HttpServletRequest request,
			HttpServletResponse response) throws IOException,
			RepositoryException, JCRNodeFactoryServiceException {
		String[] userIds = StringUtils.split(elements[1], ',');
		
		response.setContentType(RestProvider.CONTENT_TYPE);
		ServletOutputStream outputStream = response.getOutputStream();
		outputStream.print("{ \"users\" : [ ");

		boolean first = true;
		if (userIds != null) {
			for (String userId : userIds) {
				if (!first) {
					outputStream.print(",");
				}
				User user = userResolverService.resolveWithUUID(userId);
				if (user == null) {
					outputStream.print(beanConverter
							.convertToString(ImmutableMap.of("statusCode",
									"404", "userId", userId)));
				} else {
					outputStream
							.print("{ \"statusCode\": \"200\", \"restricted\": true");
					outputPathPrefix(user.getUuid(), outputStream);
					outputUserProfile(user.getUuid(), outputStream);					
					outputStream.print("}");
				}
				first = false;
			}
		}
		outputStream.print("]}");
	}

	/**
	 * Output this user.
	 * 
	 * @param elements
	 *            the request path elements.
	 * @param request
	 *            the request object.
	 * @param response
	 *            the response object.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws RepositoryException
	 */
	public void doUser(String[] elements, HttpServletRequest request,
			HttpServletResponse response) throws RepositoryException,
			JCRNodeFactoryServiceException, IOException {
		Session session = sessionManagerService.getCurrentSession();
		User user = session.getUser();

		System.err.println("Got user as " + user);

		Locale locale = userEnvironmentResolverService.getUserLocale(request
				.getLocale(), session);
		if (user == null || user.getUuid() == null
				|| "anon".equals(user.getUuid())) {
			sendOutput(response, locale, new AnonUser(), ANON_UE_FILE);
		} else {
			UserEnvironment userEnvironment = userEnvironmentResolverService
					.resolve(user);
			if (userEnvironment == null
					|| userEnvironment instanceof NullUserEnvironment) {
				sendDefaultUserOutput(response, locale, user);
			} else {
				sendOutput(response, locale, userEnvironment.getUser(),
						userEnvironment);
			}
		}
	}

	/**
	 * @param response
	 * @param anonMeFile
	 * @throws JCRNodeFactoryServiceException
	 * @throws RepositoryException
	 * @throws IOException
	 */
	private void sendOutput(HttpServletResponse response, Locale locale,
			User user, UserEnvironment userEnvironment)
			throws RepositoryException, JCRNodeFactoryServiceException,
			IOException {
		response.setContentType(RestProvider.CONTENT_TYPE);
		ServletOutputStream outputStream = response.getOutputStream();
		outputStream.print("{ \"locale\" :");
		outputStream.print(beanConverter.convertToString(UserLocale
				.localeToMap(locale)));
		outputStream.print(", \"preferences\" :");
		userEnvironment.setProtected(true);
		String json = beanConverter.convertToString(userEnvironment);
		userEnvironment.setProtected(false);
		outputStream.print(json);
		outputPathPrefix(user.getUuid(), outputStream);
		outputUserProfile(user.getUuid(), outputStream);
		outputStream.print("}");
	}

	/**
	 * @param response
	 * @param anonMeFile
	 * @throws JCRNodeFactoryServiceException
	 * @throws RepositoryException
	 * @throws IOException
	 */
	private void sendOutput(HttpServletResponse response, Locale locale,
			User user, String path) throws RepositoryException,
			JCRNodeFactoryServiceException, IOException {
		response.setContentType(RestProvider.CONTENT_TYPE);
		ServletOutputStream outputStream = response.getOutputStream();
		outputStream.print("{ \"locale\" :");
		outputStream.print(beanConverter.convertToString(UserLocale
				.localeToMap(locale)));
		sendFile("preferences", path, outputStream);
		outputPathPrefix(user.getUuid(), outputStream);
		outputStream.print(", \"profile\" : {}");
		outputStream.print("}");
	}

	/**
	 * @param string
	 * @param path
	 * @throws IOException
	 * @throws RepositoryException
	 */
	private void sendFile(String key, String path,
			ServletOutputStream outputStream) throws IOException,
			RepositoryException {

		InputStream in = null;
		try {
			in = jcrNodeFactoryService.getInputStream(path);
			if (in == null) {
				outputStream.print(", \"");
				outputStream.print(key);
				outputStream.print("\" : {}");
			} else {
				outputStream.print(", \"");
				outputStream.print(key);
				outputStream.print("\" :");
				IOUtils.stream(in, outputStream);
			}
		} catch (Exception ex) {
			outputStream.print(", \"");
			outputStream.print(key);
			outputStream.print("\" : {}");
		} finally {
			try {
				in.close();
			} catch (Exception ex) {
			}
		}
	}

	/**
	 * @param response
	 * @param anonMeFile
	 * @throws JCRNodeFactoryServiceException
	 * @throws RepositoryException
	 * @throws IOException
	 */
	private void sendDefaultUserOutput(HttpServletResponse response,
			Locale locale, User user) throws RepositoryException,
			JCRNodeFactoryServiceException, IOException {
		response.setContentType(RestProvider.CONTENT_TYPE);
		ServletOutputStream outputStream = response.getOutputStream();
		outputStream.print("{ \"locale\" :");
		outputStream.print(beanConverter.convertToString(UserLocale
				.localeToMap(locale)));
		outputStream.print(", \"preferences\" :");
		Map<String, Object> m = new HashMap<String, Object>();
		m.put("uuid", user.getUuid());
		m.put("superUser", false);
		m.put("subjects", new String[0]);
		outputStream.print(beanConverter.convertToString(m));
		outputPathPrefix(user.getUuid(), outputStream);
		outputUserProfile(user.getUuid(), outputStream);
		outputStream.print("}");
	}

	/**
	 * @param response
	 * @param userUuid
	 * @throws RepositoryException
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException 
	 */
	private void outputUserProfile(String uuid, ServletOutputStream outputStream)
			throws IOException, RepositoryException, JCRNodeFactoryServiceException {
		
		outputStream.print(", " + "\"profile\" : " + beanConverter.convertToString(defaultUserInfoParser.getJSONforUserProfile(uuid)));
		
		//String path = userFactoryService.getUserProfilePath(uuid);
		//sendFile("profile", path, outputStream);
	}

	private void outputPathPrefix(String uuid, ServletOutputStream outputStream)
			throws IOException {
		String pathPrefix = userFactoryService.getUserPathPrefix(uuid);
		outputStream.print(", \"userStoragePrefix\":\"");
		outputStream.print(pathPrefix);
		outputStream.print("\"");
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.rest.RestProvider#getDescription()
	 */
	public RestDescription getDescription() {
		return DESCRIPTION;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.Provider#getKey()
	 */
	public String getKey() {
		return "me";
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
