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
package org.sakaiproject.kernel.chat;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.query.Query;
import javax.jcr.query.QueryManager;
import javax.jcr.query.QueryResult;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import net.sf.json.JSONObject;
import net.sf.json.JSONSerializer;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.messaging.ChatMessage;
import org.sakaiproject.kernel.api.messaging.ChatMessagingService;
import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.ISO9075;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;

import com.google.inject.Inject;

@Path("/chat")
public class ChatProvider implements Documentable, JaxRsSingletonProvider,
		Initialisable {

	private static final String OK = "{\"response\", \"OK\"}";
	private static final String ERROR = "{\"response\", \"ERROR\"}";

	private static final RestDescription REST_DOCS = new RestDescription();
	static {
		REST_DOCS.setTitle("Chat service");
		REST_DOCS
				.setShortDescription("The chat service allows you to send and receive chat messages.");
		REST_DOCS.setBackUrl("../__describe__");
	}

	private BeanConverter beanConverter;
	private Registry<String, JaxRsSingletonProvider> jaxRsSingletonRegistry;
	private ChatMessagingService chatMessagingService;
	private JCRNodeFactoryService jcrNodeFactoryService;
	private JCRService jcrService;
	private SessionManagerService sessionManagerService;
	private UserFactoryService userFactoryService;

	@Inject
	public ChatProvider(SessionManagerService sessionManagerService,
			RegistryService registryService, BeanConverter beanConverter,
			JCRService jcrService, ChatMessagingService chatMessagingService,
			JCRNodeFactoryService jcrNodeFactoryService,
			UserFactoryService userFactoryService) {
		this.beanConverter = beanConverter;
		this.chatMessagingService = chatMessagingService;
		this.jcrNodeFactoryService = jcrNodeFactoryService;
		this.jcrService = jcrService;
		this.sessionManagerService = sessionManagerService;
		this.userFactoryService = userFactoryService;

		jaxRsSingletonRegistry = registryService
				.getRegistry(JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY);
		jaxRsSingletonRegistry.add(this);

	}

	@GET
	@Path("/get")
	@Produces(MediaType.TEXT_PLAIN)
	public String getStatus(@QueryParam("users") String users,
			@QueryParam("initial") Boolean initial)
			throws RepositoryException, JCRNodeFactoryServiceException, 
			IOException {
		// Check to see if this user is logged in.
		String userId = sessionManagerService.getCurrentUserId();
		if (StringUtils.isEmpty(userId) || "anon".equals(userId)) {
			return generateResponse("ERROR", "messages",
					"You have to sign in before you can get the messages.");
		}
		// Get users private node
		Node n = jcrNodeFactoryService.getNode(userFactoryService
				.getUserPrivatePath(userId));
		
		// Node wasn't found (probably because there are no messages yet)
		if (n == null) {
			return generateResponse("OK", "messages", new Object[0]);
		}

		String[] arrUsers;
		// Put the different users in an array.
		System.err.println("UUUUUUUUUUUUUUUSSSSSSSSSERRRRRRS: " + users);
		if (users == null || StringUtils.isEmpty(users)) {
			arrUsers = new String[0];
		} else {
			arrUsers = users.split(",");
		}
		
		// Check the initial param
		if (initial == null){
			initial = true;
		}
		
		// Array that contains the chat messages.
		//JSONArray chatusers = JSONObject.fromObject(arrUsers);
		
		// Arraylist that contains the chat messages.
		//Get the chat messages
		Map<String, ArrayList<Object>> chatusers = getChatMessages(initial, n, arrUsers, userId);
		if (chatusers.size() == 0) {
			// There were no chat messages found, we return an empty array.
			return generateResponse("OK", "messages", new Object[0]);
		}
		
		Map<String, Object> mapUser = new HashMap<String, Object>();
		Map<String, Object> mapGlobal = new HashMap<String, Object>();
		for (String s : chatusers.keySet()) {
			mapUser.put("messages", chatusers.get(s));
			mapUser.put("profile", getUserProfile(s));
			mapGlobal.put(s, mapUser);
		}
		
		// Add them to the array
		//JSONArray arr = JSONArray.fromObject(chatusers);
		
//		return beanConverter.convertToString(map2);
		return generateResponse("OK", "messages", mapGlobal);
	}

	
	private Object getUserProfile(String s)  throws RepositoryException, 
	JCRNodeFactoryServiceException, UnsupportedEncodingException, IOException {
		InputStream in = null;
		Object o = new Object();
		try{
			in = jcrNodeFactoryService.getInputStream(userFactoryService
					.getUserProfilePath(s));
			o = JSONObject.fromObject(IOUtils.readFully(in, "UTF-8"));
		}finally{
			if(in != null){
				in.close();
			}
		}
		return o;
	}

	private Map<String, ArrayList<Object>> getChatMessages(Boolean initial, Node n, String[] arrUsers, String userId) 
	throws RepositoryException, IOException, JCRNodeFactoryServiceException {
		// Get all the nodes
		QueryManager queryManager = jcrService.getQueryManager();
		String queryPath = n.getPath();
		queryPath = "/jcr:root/" + ISO9075.encodePath(queryPath + "/chats")
				+ "//element(*," + JCRConstants.NT_FILE + ")";
		
		if(arrUsers.length > 0){
			String whereQuery = "MetaData[";
			String userQuery = "";
			for (String s : arrUsers) {
				userQuery += "@" + JCRConstants.JCR_MESSAGE_FROM
						+ "='" + s + "' or ";
				userQuery += "@" + JCRConstants.JCR_MESSAGE_RCPTS
				+ "='" + s + "' or ";
			}
			userQuery = "("
					+ userQuery.subSequence(0, userQuery.lastIndexOf(" or "))
							.toString() + ")";
			whereQuery += userQuery;

			queryPath += whereQuery + "]";
		}
		
		queryPath += " order by @" + JCRConstants.JCR_CREATED + " ascending";
		
		Query query = queryManager.createQuery(queryPath, Query.XPATH);

		QueryResult qr = query.execute();
		NodeIterator nodes = qr.getNodes();
		
		Map<String, ArrayList<Object>> chatusers = new HashMap<String, ArrayList<Object>>();
		
		InputStream in = null;
		try{
			while(nodes.hasNext()){
				Node node = nodes.nextNode();
				in = null;
				in = jcrNodeFactoryService.getInputStream(node.getPath());
				
				// Read the chat message
				String data = IOUtils.readFully(in, "UTF-8");
				
				// Make object
				JSONObject jsonObj = (JSONObject) JSONSerializer.toJSON(data);
				jsonObj.put("name", node.getName());
				jsonObj.put("pathToMessage", node.getPath());

				boolean read = false;
				// Fetch the read status of the message.
				if (node.hasProperty(JCRConstants.JCR_MESSAGE_READ)) {
					read = (node
							.getProperty(JCRConstants.JCR_MESSAGE_READ)
							.getBoolean()) ? true : false;
				}
				jsonObj.put("read", read);
				node.setProperty(JCRConstants.JCR_MESSAGE_READ, true);
				node.save();
				
				// Get from and to
				String from = jsonObj.getString("from");
				String to = jsonObj.getString("to");
				String otheruser = "";
				if(from.equals(userId)){
					otheruser = to;
				}else{
					otheruser = from;
				}
				System.err.println("//////////////////==== ArrUsers: " + arrUsers.toString());
				System.err.println("//////////////////==== ArrUsers: " + arrUsers.length);
				if(arrUsers.length == 0){
					if(!read){
						if (chatusers.get(otheruser) != null) {
							chatusers.get(otheruser).add(jsonObj);
						}
						else {
							ArrayList<Object> o = new ArrayList<Object>();
							o.add(jsonObj);
							chatusers.put(otheruser, o);
						}
					}
				}else{
					if(initial || (!initial && !read)){
						if (chatusers.get(otheruser) != null) {
							chatusers.get(otheruser).add(jsonObj);
						}
						else {
							ArrayList<Object> o = new ArrayList<Object>();
							o.add(jsonObj);
							chatusers.put(otheruser, o);
						}
					}
				}
				
			}
		} finally {
			if (in != null)
				in.close();
		}		
		
		return chatusers;
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

	@POST
	@Path("/send")
	@Produces(MediaType.TEXT_PLAIN)
	public String sendMessage(@FormParam("to") String to,
			@FormParam("message") String message) {
		// Get the current userId
		String userId = sessionManagerService.getCurrentUserId();

		// Check if the user is logged in or if it's an anon user
		// Anon users can't send messages
		if (StringUtils.isEmpty(userId) || "anon".equals(userId)) {
			return ERROR;
		}
		// Check if the message or the receiver is empty
		if (StringUtils.isEmpty(message) || StringUtils.isEmpty(to)) {
			return ERROR;
		}
		// {to: "user id from sentTo",message: "message from the user"}
		ChatMessage chatmessage = chatMessagingService.createMessage();
		chatmessage.setType(ChatMessage.Type.INTERNAL.toString());
		chatmessage.setText(message);
		chatmessage.setFrom(userId);
		chatmessage.setTo(to);

		// Send the chat message
		chatmessage.send();

		return OK;
	}

	public RestDescription getRestDocumentation() {
		return REST_DOCS;
	}

	public Documentable getJaxRsSingleton() {
		return this;
	}

	public String getKey() {
		return "chat";
	}

	public int getPriority() {
		return 0;
	}

	public void destroy() {
		jaxRsSingletonRegistry.remove(this);
	}

	public void init() {

	}

}
