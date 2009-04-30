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
package org.sakaiproject.kernel.rest.messages;

import net.sf.json.JSONException;

import org.sakaiproject.kernel.api.presence.PresenceService;

import org.sakaiproject.kernel.rest.DefaultUserInfoParser;

import org.sakaiproject.kernel.api.presence.PresenceService;

import org.sakaiproject.kernel.rest.DefaultUserInfoParser;

import org.sakaiproject.kernel.api.presence.PresenceService;

import org.sakaiproject.kernel.rest.DefaultUserInfoParser;

import org.sakaiproject.kernel.api.presence.PresenceService;

import org.sakaiproject.kernel.rest.DefaultUserInfoParser;

import org.sakaiproject.kernel.api.presence.PresenceService;

import org.sakaiproject.kernel.rest.DefaultUserInfoParser;

import org.sakaiproject.kernel.api.presence.PresenceService;

import org.sakaiproject.kernel.rest.DefaultUserInfoParser;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.Value;
import javax.jcr.ValueFormatException;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.query.Query;
import javax.jcr.query.QueryManager;
import javax.jcr.query.QueryResult;
import javax.jcr.version.VersionException;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import com.google.inject.Inject;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.JSONSerializer;

import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.locking.LockTimeoutException;
import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessagingService;
import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.ISO9075;
import org.sakaiproject.kernel.util.JcrUtils;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;

/**
 * 
 */
@Path("/messages")
public class MessagesProvider implements Documentable, JaxRsSingletonProvider,
		Initialisable {

	private static final RestDescription REST_DOCS = new RestDescription();
	static {
		REST_DOCS.setTitle("Messaging service");
		REST_DOCS
				.setShortDescription("The messaging service allows you to send and fetch internal messages.");
		REST_DOCS.setBackUrl("../__describe__");
		REST_DOCS
				.addSection(
						1,
						"Introduction",
						"The messages service provides a way to access the messages of the currently logged in user.");

		REST_DOCS
				.addURLTemplate(
						"/send",
						"(POST) This will send a message to the JCR.<br />"
								+ " The message should be formatted in the following way.<br />"
								+ "There are 2 POST parameters.<br />"
								+ " - to : The uuid of the person to be posted to.<br />"
								+ " - fields_ : A JSON object containing the following:<br />"
								+ "   {\"TITLE\":\"my subject\",\"TYPE\":\"Message\",\"BODY\":\"my body\"}<br />");

		REST_DOCS
				.addURLTemplate(
						"/messages",
						"(GET) Will fetch the messages for a current user."
								+ "Options: <br />"
								+ " - types : Comma seperated list of the types of messages (inbox, sent, trash.) <br />"
								+ " - categories : Comma sperated list of the categories of messages (Announcement, invitation, .. .)<br />"
								+ " - sort : On what property the messages should be sorted (available: date, to, from, subject.)<br />"
								+ " - sortOrder : ascending or descending. <br />"
								+ " - n : Number of messages that should be returned.<br />"
								+ " - p : Which page (zero based.)");

		REST_DOCS.addURLTemplate("/count",
				"(GET) Count the number of messages.");
		REST_DOCS
				.addURLTemplate(
						"/delete",
						"(POST) Mark a message as deleted.<br />"
								+ "Options: <br />"
								+ " - messages : An array containing the path to the message that should be marked as trashed.");
	}

	private Registry<String, JaxRsSingletonProvider> jaxRsSingletonRegistry;
	private BeanConverter beanConverter;
	private JCRNodeFactoryService jcrNodeFactoryService;
	private UserFactoryService userFactoryService;
	private SessionManagerService sessionManagerService;
	private MessagingService messagingService;
	private JCRService jcrService;
	private DefaultUserInfoParser defaultUserInfoParser;

	private Map<String, Object> users = new HashMap<String, Object>();

	@Inject
	public MessagesProvider(JCRNodeFactoryService jcrNodeFactoryService,
			SessionManagerService sessionManagerService,
			UserFactoryService userFactoryService, PresenceService presenceService,
			RegistryService registryService, BeanConverter beanConverter,
			MessagingService messagingService, JCRService jcrService,
			DefaultUserInfoParser defaultUserInfoParser,
			UserResolverService userResolverService) {
		this.beanConverter = beanConverter;
		this.jcrNodeFactoryService = jcrNodeFactoryService;
		this.userFactoryService = userFactoryService;
		this.sessionManagerService = sessionManagerService;
		this.messagingService = messagingService;
		this.jcrService = jcrService;
		
		this.defaultUserInfoParser = defaultUserInfoParser;

		jaxRsSingletonRegistry = registryService
				.getRegistry(JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY);
		jaxRsSingletonRegistry.add(this);

	}
	

	@GET
	@Path("/createDummyMessages")
	@Produces(MediaType.TEXT_PLAIN)
	public String createDummyMessages(@QueryParam("to") String to,
			@QueryParam("from") String from, @QueryParam("n") int n) {

		if (to != null && from != null) {
			for (int i = 0; i < n; i++) {
				Message msg = messagingService.createMessage();
				msg.setText("Message " + i);
				msg.setSubject("Message " + i);
				msg.setFrom(from);
				msg.setType(Message.Type.INTERNAL.toString());
				msg.setCategory("Message");
				msg.addTo(to);
				msg.send();
			}

			return "Done";
		} else {
			return "Provide a to uuid.";
		}
	}

	@POST
	@Path("/send")
	@Produces(MediaType.TEXT_PLAIN)
	public String send(@FormParam("to") String to,
			@FormParam("message") String message,
			@FormParam("reply") String reply) throws RepositoryException,
			JCRNodeFactoryServiceException, UnsupportedEncodingException,
			IOException {

		User user = sessionManagerService.getCurrentSession().getUser();

		// anon users are'nt allowed to send messages.
		if (user == null) {
			return generateResponse("ERROR", "message",
					"Anonymous users can't send messages.");
		}

		// Get parameters out of JSON
		// message is in this form:
		// {"fields_":{"TITLE":"my subject","TYPE":"Message","BODY":"my body"}}
		JSONObject parameters = JSONObject.fromObject(message);

		Map<String, Object> mapJSON = beanConverter.convertToMap(parameters
				.getString("fields_"));

		String subject = mapJSON.get("title").toString();
		String type = mapJSON.get("type").toString();
		String body = mapJSON.get("body").toString();

		// Make sure we have all nescecary information.
		if (subject.equals("") || type.equals("") || body.equals("")
				|| to.equals("")) {
			return generateResponse("ERROR", "message",
					"Some fields are missing.");
		}

		// create the message and send it.
		Message msg = messagingService.createMessage();
		msg.setText(body);
		msg.setSubject(subject);
		msg.setFrom(user.getUuid());
		msg.setType(Message.Type.INTERNAL.toString());
		msg.setCategory(type);
		msg.addTo(to);

		// If this is a reply to another message we add the message.
		if (reply != null) {
			// Read the message
			Node n = jcrNodeFactoryService.getNode(reply);
			if (n != null) {
				InputStream in = null;
				in = jcrNodeFactoryService.getInputStream(reply);
				String jsonMessage = IOUtils.readFully(in, "UTF-8");
				Message previousMessage = toMessage(jsonMessage);
				msg.addPart(previousMessage);
			}
		}

		// send the message.
		msg.send();

		return generateResponse("OK", "message", "Message sent.");
	}

	@GET
	@Path("/messages")
	@Produces(MediaType.TEXT_PLAIN)
	public String messages(@QueryParam("types") String types,
			@QueryParam("users") String users,
			@QueryParam("categories") String categories,
			@QueryParam("sort") String sort,
			@QueryParam("sortOrder") String sortOrder,
			@QueryParam("n") int numberOfMessages, @QueryParam("p") int page)
			throws JCRNodeFactoryServiceException, RepositoryException,
			IOException {

		// Check to see if this user is logged in.
		String uuid = sessionManagerService.getCurrentUserId();
		if (uuid == null) {
			return generateResponse("ERROR", "message",
					"Login before fetching the messages.");
		}
		// Get users path
		Node n = jcrNodeFactoryService.getNode(userFactoryService
				.getUserPrivatePath(sessionManagerService.getCurrentUserId()));

		// Node wasnt found, this could be because there are no messages yet.
		if (n == null) {
			return generateResponse("OK", "messages", new Object[0]);
		}

		// Maybe we want to filter them on inbox, sent, trash ...
		String[] arrTypes;
		if (types != null && !types.equals("")) {
			arrTypes = types.split(",");
		} else {
			arrTypes = new String[0];
		}

		// Maybe we want to filter them on inbox, sent, trash ...
		String[] arrCategories;
		if (categories != null && !categories.equals("")) {
			arrCategories = categories.split(",");
		} else {
			arrCategories = new String[0];
		}

		// Maybe we only want messages from and to specific users.
		String[] arrUsers;
		if (users != null && !users.equals("")) {
			arrUsers = users.split(",");
		} else {
			arrUsers = new String[0];
		}

		int from = 0;
		int to = 10;
		// paging
		if (numberOfMessages > 0 && page > -1) {
			from = page * numberOfMessages;
			from = (from < 0) ? 0 : from;
			to = (page + 1) * numberOfMessages;
			// If a negative number is given we only display 10.
			to = (to <= 0) ? numberOfMessages : to;
		}

		Map<String, String> availableSortOptions = new HashMap<String, String>();
		availableSortOptions.put("category", JCRConstants.JCR_MESSAGE_CATEGORY);
		availableSortOptions.put("date", JCRConstants.JCR_MESSAGE_DATE);
		availableSortOptions.put("subject", JCRConstants.JCR_MESSAGE_SUBJECT);
		availableSortOptions.put("type", JCRConstants.JCR_MESSAGE_TYPE);

		// By default we sort on date
		sort = (sort == null) ? JCRConstants.JCR_MESSAGE_DATE
				: ((availableSortOptions.containsKey(sort)) ? availableSortOptions
						.get(sort)
						: JCRConstants.JCR_MESSAGE_DATE);
		sortOrder = (sortOrder == null) ? "descending" : ((sortOrder
				.equalsIgnoreCase("descending")) ? "descending" : "ascending");

		// now we can get them
		// Get all the messages.
		ArrayList<JSONObject> messages = new ArrayList<JSONObject>();
		messages = getMessages(n, arrTypes, arrCategories, arrUsers, sort,
				sortOrder, from, to);

		if (messages.size() == 0) {
			// There were no message, we return an empty array.
			return generateResponse("OK", "messages", new Object[0]);
		}

		// Sorting
		// Sorting a to or from fields requires a look at the JCR, thats why we
		// do it here.
		// Other fields can be sorted in the XPATH query.
		if (sort.equals("to") || sort.equals("from")) {
			messages = sortMessages(messages, sort, sortOrder);
		}

		// We have some messages in here...
		// Get the user for each message
		messages = getUserInfo(messages);

		// sort order
		// messages = sortMessages(messages, sort, sortOrder);

		// Add them to the array
		JSONArray arr = JSONArray.fromObject(messages);

		return generateResponse("OK", "messages", arr);

	}

	@GET
	@Path("/count")
	@Produces(MediaType.TEXT_PLAIN)
	public String count(@QueryParam("types") String types,
			@QueryParam("categories") String cats,
			@QueryParam("read") String read) throws RepositoryException,
			JCRNodeFactoryServiceException {
		// Get users path
		Node n = jcrNodeFactoryService.getNode(userFactoryService
				.getUserPrivatePath(sessionManagerService.getCurrentUserId()));

		if (n == null) {
			return generateResponse("OK", "count", "0");
		}

		String[] arrTypes = new String[0];
		if (types != null) {
			arrTypes = types.split(",");
		}
		String[] arrCategories = new String[0];
		if (cats != null) {
			arrCategories = cats.split(",");
		}
		String[] arrRead = new String[0];
		if (read != null) {
			arrRead = read.split(",");
		}

		long[] count = new long[arrTypes.length];
		String path = n.getPath();

		for (int i = 0; i < arrTypes.length; i++) {
			QueryManager queryManager = jcrService.getQueryManager();
			String xpathQuery = path;
			xpathQuery = "/jcr:root/"
					+ ISO9075.encodePath(xpathQuery + "/messages")
					+ "//element(*," + JCRConstants.NT_FILE + ")";

			String whereQuery = "";
			boolean where = false;
			if (!arrTypes[i].equals("*")) {
				whereQuery = "[@" + JCRConstants.JCR_LABELS + "='"
						+ arrTypes[i] + "'";
				where = true;
			}
			if (!arrCategories[i].equals("*")) {
				whereQuery += (where) ? " and " : "[";
				whereQuery += "@" + JCRConstants.JCR_MESSAGE_CATEGORY + "='"
						+ arrCategories[i] + "'";
				where = true;
			}
			if (!arrRead[i].equals("all")) {
				whereQuery += (where) ? " and " : "[";
				whereQuery += "@" + JCRConstants.JCR_MESSAGE_READ + "='"
						+ arrRead[i] + "']";
			} else {
				whereQuery += "]";
			}

			xpathQuery += whereQuery;

			Query query = queryManager.createQuery(xpathQuery, Query.XPATH);
			QueryResult qr = query.execute();
			count[i] = qr.getNodes().getSize();
			System.err.println("Count : " + count[i]);
		}

		JSONArray arr = JSONArray.fromObject(count);

		System.err.println(beanConverter.convertToString(arr));

		return generateResponse("OK", "count", arr);
	}

	@POST
	@Path("/delete")
	@Produces(MediaType.TEXT_PLAIN)
	public String delete(@FormParam("messages") String[] messages)
			throws RepositoryException, JCRNodeFactoryServiceException,
			LockTimeoutException {
		// Check to see if this user is logged in.
		String uuid = sessionManagerService.getCurrentUserId();
		if (uuid == null) {
			return generateResponse("ERROR", "message",
					"Login before fetching the messages.");
		}
		if (messages == null) {
			return generateResponse("ERROR", "message", "Invalid parameters.");
		}

		for (String m : messages) {
			// This could throw Null ..
			Node n = jcrNodeFactoryService.getNode(m);

			// Remove the label and add the new one.
			JcrUtils.removeNodeLabel(jcrService, n, "inbox");
			JcrUtils.addNodeLabel(jcrService, n, "trash");

		}
		return generateResponse("OK", "messages",
				"The message(s) have been deleted.");
	}

	/**
	 * Takes a list of JSONObjects that represent messages and add the user info
	 * for the to & from field
	 * 
	 * @param messages
	 * @return
	 * @throws UnsupportedEncodingException
	 * @throws RepositoryException
	 * @throws JCRNodeFactoryServiceException
	 * @throws IOException
	 */
	private ArrayList<JSONObject> getUserInfo(ArrayList<JSONObject> messages)
			throws UnsupportedEncodingException, RepositoryException,
			JCRNodeFactoryServiceException, IOException {
		for (JSONObject m : messages) {
			// To
			m.put("userTo", handleRecepeints(m.get("to").toString()));

			// From
			m.put("userFrom", handleRecepeints(m.get("from").toString()));

			// Message in a message
			if (m.has("parts")) {
				// This message has sub messages
				ArrayList<JSONObject> subMessages = new ArrayList<JSONObject>();
				JSONArray arr = m.getJSONArray("parts");
				for (Object o : arr) {
					subMessages.add((JSONObject) o);
				}
				subMessages = getUserInfo(subMessages);
				m.put("parts", JSONArray.fromObject(subMessages));
			}

		}
		return messages;
	}

	/**
	 * Takes a string that is either a single uuid or a comma seperated list of
	 * user ids.
	 * 
	 * @param recepeint
	 * @return
	 * @throws UnsupportedEncodingException
	 * @throws RepositoryException
	 * @throws JCRNodeFactoryServiceException
	 * @throws IOException
	 */
	private Object handleRecepeints(String recepeint)
			throws UnsupportedEncodingException, RepositoryException,
			JCRNodeFactoryServiceException, IOException {
		Object o = null;
		if (recepeint.contains(",")) {
			// There are multiple users for this message.
			ArrayList<JSONObject> userObjects = new ArrayList<JSONObject>();
			String[] userIds = recepeint.split(",");
			for (String userId : userIds) {
				// This is a user we havent fetched already.
				if (!users.containsKey(userId)) {
					JSONObject jsonObject = defaultUserInfoParser.getJSONForUser(userId);
					users.put(userId, jsonObject);
					userObjects.add(jsonObject);
				}
				// We already have this user ..
				else {
					userObjects.add((JSONObject) users.get(userId));
				}
			}
			o = JSONArray.fromObject(userObjects);
		} else {
			// Only a single user
			if (!users.containsKey(recepeint)) {
				JSONObject jsonObject = defaultUserInfoParser.getJSONForUser(recepeint);
				users.put(recepeint, jsonObject);
				o = jsonObject;
			} else {
				o = users.get(recepeint);
			}
		}
		return o;
	}

	/**
	 * Sorts a list of messages. Be sure that sort is a field on a Message
	 * category
	 * 
	 * @param messages
	 * @param sort
	 * @param sortOrder
	 * @return
	 */
	private ArrayList<JSONObject> sortMessages(ArrayList<JSONObject> messages,
			String sort, String sortOrder) {
		MessageComparator msgComparator = new MessageComparator();
		msgComparator.setField(sort);
		Collections.sort(messages, msgComparator);

		// up or down
		if (sortOrder.equals("descending")) {
			Collections.reverse(messages);
		}
		return messages;
	}

	/**
	 * Get all the messages from a node
	 * 
	 * @param n
	 * @return
	 * @throws RepositoryException
	 * @throws JCRNodeFactoryServiceException
	 * @throws UnsupportedEncodingException
	 * @throws IOException
	 */
	protected ArrayList<JSONObject> getMessages(Node n, String[] types,
			String[] cats, String[] users, String sorting, String sortOrder,
			int from, int to) throws RepositoryException,
			JCRNodeFactoryServiceException, UnsupportedEncodingException,
			IOException {

		// Get all the nodes
		QueryManager queryManager = jcrService.getQueryManager();
		String query = "/jcr:root/"
				+ ISO9075.encodePath(n.getPath() + "/messages")
				+ "//element(*," + JCRConstants.NT_FILE + ")";

		String whereQuery = "MetaData[";
		// Filter the messages based on inbox, sent, trash, ...
		boolean where = false;
		if (types.length > 0) {
			where = true;
			String typesQuery = "";
			for (String s : types) {
				typesQuery += "@" + JCRConstants.JCR_LABELS + "='" + s
						+ "' or ";
			}
			whereQuery += "("
					+ typesQuery.subSequence(0, typesQuery.lastIndexOf(" or "))
							.toString() + ")";

		}
		// Filter the messages based on chat, invitation, announcement ...
		if (cats.length > 0) {

			if (where) {
				// There was already some kind of filtering.
				whereQuery += " and ";
			}
			where = true;
			String catsQuery = "";
			for (String s : cats) {
				catsQuery += "@" + JCRConstants.JCR_MESSAGE_CATEGORY + "='" + s
						+ "' or ";
			}
			catsQuery = "("
					+ catsQuery.subSequence(0, catsQuery.lastIndexOf(" or "))
							.toString() + ")";
			whereQuery += catsQuery;
		}

		// Filter the messages based on user
		if (users.length > 0) {
			if (where) {
				// There was already some kind of filtering.
				whereQuery += " and ";
			}
			where = true;
			String userQuery = "";
			for (String s : users) {
				userQuery += "jcr:contains(@" + JCRConstants.JCR_MESSAGE_FROM
						+ ",'" + s + "') or ";
			}
			userQuery = "("
					+ userQuery.subSequence(0, userQuery.lastIndexOf(" or "))
							.toString() + ")";
			whereQuery += userQuery;
		}

		if (where) {
			query += whereQuery + "]";
		}
		/*
		 * else { query += "[jcr:position() >= " + from +
		 * " and jcr:position() < " + to + "]"; }
		 */

		// sorting on
		query += " order by @" + sorting + " " + sortOrder;

		Query oQuery = queryManager.createQuery(query, Query.XPATH);

		QueryResult qr = oQuery.execute();
		NodeIterator nodes = qr.getNodes();

		ArrayList<JSONObject> messages = new ArrayList<JSONObject>();
		InputStream in = null;
		try {
			int iMessages = 0;
			while (nodes.hasNext()) {
				Node node = nodes.nextNode();
				if (iMessages >= from && iMessages < to) {
					in = null;
					in = jcrNodeFactoryService.getInputStream(node.getPath());
					if (in != null) {
						// Read message
						String data = IOUtils.readFully(in, "UTF-8");
						// Make object
						JSONObject jsonObj = (JSONObject) JSONSerializer
								.toJSON(data);

						jsonObj.put("name", node.getName());

						// Add the type (sent, inbox, trash, ...)
						jsonObj.put("pathToMessage", node.getPath());
						if (node.hasProperty(JCRConstants.JCR_LABELS)) {
							List<String> arrTypes = new ArrayList<String>();
							for (Value v : node.getProperty(
									JCRConstants.JCR_LABELS).getValues()) {
								arrTypes.add(v.getString());
							}
							jsonObj.put("types", arrTypes);
						}

						// Check to see if this message has been read or
						// not.
						boolean read = false;
						// Fetch the read status of the message.
						if (node.hasProperty(JCRConstants.JCR_MESSAGE_READ)) {
							read = (node
									.getProperty(JCRConstants.JCR_MESSAGE_READ)
									.getBoolean()) ? true : false;
						}
						jsonObj.put("read", read);

						// Add it
						messages.add(jsonObj);
					}
				} else if (iMessages >= to) {
					break;
				}

				iMessages++;
			}
		} finally {
			if (in != null)
				in.close();
		}

		return messages;
	}

	/**
	 * Set the read status of a message
	 * 
	 * @param node
	 *            message node
	 * @param isRead
	 *            Is the message read or not
	 * @throws RepositoryException
	 * @throws ConstraintViolationException
	 * @throws LockException
	 * @throws VersionException
	 * @throws ValueFormatException
	 */
	public void setMessageReadStatus(Node node, Boolean isRead)
			throws ValueFormatException, VersionException, LockException,
			ConstraintViolationException, RepositoryException {
		node.setProperty(JCRConstants.JCR_MESSAGE_READ, isRead);
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

	/* TODO use JsonMessageConverter */
	public Message toMessage(String json) {
		JSONObject jsonObj = (JSONObject) JSONSerializer.toJSON(json);
		Message msg = toMessage(jsonObj);
		return msg;
	}

	/* TODO use JsonMessageConverter */
	@SuppressWarnings("unchecked")
	protected Message toMessage(JSONObject jsonObj) {
		Message msg = messagingService.createMessage();

		// add headers
		Set entrySet = jsonObj.entrySet();
		Iterator entries = entrySet.iterator();
		while (entries.hasNext()) {
			Entry entry = (Entry) entries.next();
			String key = (String) entry.getKey();
			if (Message.Field.BODY_TEXT.toString().equals(key)) {
				msg.setText((String) entry.getValue());
			} else if (Message.Field.BODY_URL.toString().equals(key)) {
				try {
					msg.setBody(new URL((String) entry.getValue()));
				} catch (MalformedURLException e) {
					msg.setText("Unable to link to body.");
				}
			} else if (Message.Field.PARTS.toString().equals(key)) {
				JSONArray array = (JSONArray) entry.getValue();
				for (Object o : array) {
					msg.addPart(toMessage((JSONObject) o));
				}
			} else {
				msg.setHeader(key, (String) entry.getValue());
			}
		}
		return msg;
	}

	public RestDescription getRestDocumentation() {
		return REST_DOCS;
	}

	public Documentable getJaxRsSingleton() {
		return this;
	}

	public String getKey() {
		return "messages";
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