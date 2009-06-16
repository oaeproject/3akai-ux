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
package org.sakaiproject.kernel.rest.presencewow;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jcr.RepositoryException;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.presence.PresenceService;
import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.social.FriendsResolverService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.model.FriendBean;
import org.sakaiproject.kernel.model.FriendsBean;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;

import com.google.common.collect.Lists;
import com.google.inject.Inject;

@Path("/presencewow")
public class PresencewowProvider implements Documentable,
		JaxRsSingletonProvider, Initialisable {

	private static final String OK = "{\"response\", \"OK\"}";
	private static final String ERROR = "{\"response\", \"ERROR\"}";
	private PresenceService presenceService;
	private SessionManagerService sessionManagerService;
	private FriendsResolverService friendsResolverService;
	private Registry<String, JaxRsSingletonProvider> jaxRsSingletonRegistry;
	private BeanConverter beanConverter;
	private UserFactoryService userFactoryService;
	private JCRNodeFactoryService jcrNodeFactoryService;

	private static final RestDescription REST_DOCS = new RestDescription();
	private static final String STATUS_PARAM = "status";

	static {
		REST_DOCS.setTitle("Presencewow Service");
		REST_DOCS.setShortDescription("The rest service to support presence");
		REST_DOCS
				.addURLTemplate("/ping/<location>",
						"Ping presence for the current user, optionally setting the location");
		REST_DOCS.addURLTemplate("/friends",
				"Get an online status and profileinformation for my friends");
		REST_DOCS.addURLTemplate("/status/<location>",
				"Get the online status at a location");
		REST_DOCS.addURLTemplate("/status", "POST, set my status");
		REST_DOCS.addParameter(STATUS_PARAM, "Sets the status");
	}

	/**
	   *
	   */
	@Inject
	public PresencewowProvider(PresenceService presenceService,
			SessionManagerService sessionManagerService,
			FriendsResolverService friendsResolverService,
			RegistryService registryService, BeanConverter beanConverter,
			UserFactoryService userFactoryService,
			JCRNodeFactoryService jcrNodeFactoryService) {
		this.presenceService = presenceService;
		this.sessionManagerService = sessionManagerService;
		this.friendsResolverService = friendsResolverService;
		this.userFactoryService = userFactoryService;
		this.beanConverter = beanConverter;
		this.jcrNodeFactoryService = jcrNodeFactoryService;
		jaxRsSingletonRegistry = registryService
				.getRegistry(JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY);

		jaxRsSingletonRegistry.add(this);

	}

	@GET
	@Path("/ping")
	@Produces(MediaType.TEXT_PLAIN)
	public String ping() {
		String userId = sessionManagerService.getCurrentUserId();
		System.err.println("User ID is " + userId);
		if (!StringUtils.isEmpty(userId) && !"anon".equals(userId)) {
			presenceService.ping(userId, null);
			return OK;
		}
		return ERROR;
	}

	@GET
	@Path("/friends")
	@Produces(MediaType.TEXT_PLAIN)
	public String getFriendsStatus() throws RepositoryException,
			JCRNodeFactoryServiceException, UnsupportedEncodingException,
			IOException {
		System.err.println("11111");
		// Get the userId of the current user
		String userId = sessionManagerService.getCurrentUserId(); // 
		// Check if the user id is not empty and if the user is anonymous
		if (!StringUtils.isEmpty(userId) && !"anon".equals(userId)) {
			// Let the server know that you are still online
			presenceService.ping(userId, null);
			FriendsBean fbs = friendsResolverService.resolve(userId);
			// Get all the friends of the user
			List<FriendBean> friendBeans = fbs.getFriends();
			List<FriendBean> acceptedFriendBeans = Lists.newArrayList();
			// Add all the accepted friends
			for (FriendBean fb : friendBeans) {
				if(fb.getStatus().equals("ACCEPTED")){
					acceptedFriendBeans.add(fb);
				}		
			}
			Map<String, Object> mapItems = new HashMap<String, Object>();			
			
			Object[] arrFriends = new Object[acceptedFriendBeans.size()];
			for (FriendBean fb : acceptedFriendBeans) {
				if(fb.getStatus().equals("ACCEPTED")){
					String friendUid = fb.getFriendUuid();
					Map<String, Object> mapUser = new HashMap<String, Object>();
					mapUser.put("status", presenceService.getStatus(friendUid));
					mapUser.put("userid", friendUid);
					mapUser.put("userStoragePrefix", userFactoryService
							.getUserPathPrefix(friendUid));
					InputStream in = null;
					in = jcrNodeFactoryService.getInputStream(userFactoryService
							.getUserProfilePath(friendUid));
					mapUser.put("profile", IOUtils.readFully(in, "UTF-8"));
					arrFriends[acceptedFriendBeans.indexOf(fb)] = mapUser;
				}				
			}
			mapItems.put("items", arrFriends);
			return beanConverter.convertToString(mapItems);
		}
		return ERROR;
	}

	@POST
	@Path("/status")
	public String setStatus(@FormParam(STATUS_PARAM) String status) {
		String userId = sessionManagerService.getCurrentUserId();
		if (StringUtils.isEmpty(userId) && !"anon".equals(userId)) {
			presenceService.setStatus(userId, status);
			return OK;
		}
		return ERROR;
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
		return "presence";
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