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

package org.sakaiproject.kernel.messaging;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.Timer;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.Value;
import javax.jcr.Workspace;
import javax.jcr.query.Query;
import javax.jcr.query.QueryManager;
import javax.jcr.query.QueryResult;
import javax.ws.rs.core.MediaType;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.jackrabbit.value.StringValue;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.locking.LockTimeoutException;
import org.sakaiproject.kernel.api.messaging.ChatMessage;
import org.sakaiproject.kernel.api.messaging.ChatMessageHandler;
import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessageConverter;
import org.sakaiproject.kernel.api.messaging.MessagingException;
import org.sakaiproject.kernel.api.messaging.MessagingService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.util.DateUtils;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.ISO9075;
import org.sakaiproject.kernel.util.JcrUtils;

import com.google.inject.Inject;

public class InternalChatMessageHandler implements ChatMessageHandler {

	private static final int CLEAUNUP_EVERY_X_MINUTES = 120 * 60 * 1000; // 2
																			// hours
	private static final String MESSAGES_CHATLOGS = "/chatlogs";
	private static final Log log = LogFactory
			.getLog(InternalChatMessageHandler.class);
	private static final boolean DEBUG = log.isDebugEnabled();
	private static final String key = ChatMessage.Type.INTERNAL.toString();
	private static final int priority = 0;

	private final JCRService jcr;
	private final UserFactoryService userFactory;
	private final JCRNodeFactoryService nodeFactory;
	private MessagingService messagingService;
	private MessageConverter messageConverter;

	@Inject
	public InternalChatMessageHandler(RegistryService registryService,
			JCRService jcr, UserFactoryService userFactory,
			MessagingService messagingService,
			JCRNodeFactoryService nodeFactory, MessageConverter messageConverter) {

		Registry<String, ChatMessageHandler> registry = registryService
				.getRegistry(ChatMessageHandler.REGISTRY);
		registry.add(this);
		this.jcr = jcr;
		this.userFactory = userFactory;
		this.nodeFactory = nodeFactory;
		this.messagingService = messagingService;
		this.messageConverter = messageConverter;

		// Start the timer that will delete this message.
		System.err.println("Cleanup timer started");
		Timer timer = new Timer();
		timer.schedule(new ChatMessageCleaner(jcr), 15 * 1000,
				CLEAUNUP_EVERY_X_MINUTES);
		log.info("Cleanup timer started");
	}

	public void handle(String userID, String filePath, String fileName,
			Node node) {
		try {
			Property prop = node.getProperty(JCRConstants.JCR_MESSAGE_RCPTS);
			String rcpt = prop.getString();
			InputStream in = null;
			Property fromProp = node.getProperty(JCRConstants.JCR_MESSAGE_FROM);
			String from = fromProp.getString();
			if (rcpt != null) {
				/** set message path for the user. */
				/** TODO make getNewMessagePath in userFactory) */
				/** TODO change KernelContstants with chats */
				/*
				 * String msgPath = userFactory.getNewMessagePath(rcpt) + "/" +
				 * fileName;
				 */
				String msgPath = userFactory.getUserPrivatePath(rcpt);
				in = nodeFactory.getInputStream(filePath);
				msgPath += "chats/" + from + "/" + fileName;

				Node n = nodeFactory.setInputStream(msgPath, in, "UTF-8");
				JcrUtils.addNodeLabel(jcr, n, "inbox");

				n.setProperty(JCRConstants.JCR_MESSAGE_READ, false);
				n.setProperty(JCRConstants.JCR_MESSAGE_FROM, 
						node.getProperty(JCRConstants.JCR_MESSAGE_FROM).getString());
				n.setProperty(JCRConstants.JCR_MESSAGE_CHAT_CONVERSATION_ID, 
						node.getProperty(JCRConstants.JCR_MESSAGE_CHAT_CONVERSATION_ID).getString());
				n.setProperty(JCRConstants.JCR_MESSAGE_RCPTS, 
						node.getProperty(JCRConstants.JCR_MESSAGE_RCPTS).getString());
				/**
				 * TODO remove any properties that are associated to the sender
				 */
			}
			// move the original node to the common message store for the sender
			// and
			// label it as "sent"
			// create the parent if it doesn't exist.

			/** TODO make getNewMessagePath in userFactory) */
			/** TODO change KernelContstants with chats */
			// String sentPath = userFactory.getNewMessagePath(from);
			String sentPath = userFactory.getUserPrivatePath(from) + "chats/"
					+ rcpt;
			Node targetNode = null;
			try {
				targetNode = nodeFactory.getNode(sentPath);
			} catch (JCRNodeFactoryServiceException e) {
				// will handle null node after this
			} catch (RepositoryException e) {
				// will handle null node after this
			}
			if (targetNode == null) {
				targetNode = nodeFactory.createFolder(sentPath);
				// the node *must* be saved to make it available to the move.
				// call to the parent-parent so that "messages" is used as the
				// saving
				// node rather than the parent (year) as it may not exist yet.
				targetNode.getParent().save();
			}
			String sentMsgPath = sentPath + "/" + fileName;
			if (DEBUG) {
				log.debug("Moving message " + filePath + " to " + sentMsgPath);
			}
			System.err.println("///////// InternalChatMessage: Moving message "
					+ filePath + " to " + sentMsgPath);
			Workspace workspace = jcr.getSession().getWorkspace();
			workspace.move(filePath, sentMsgPath);
			JcrUtils
					.addNodeLabel(jcr, nodeFactory.getNode(sentMsgPath), "sent");
			nodeFactory.getNode(sentMsgPath).setProperty(
					JCRConstants.JCR_MESSAGE_READ, true);

			jcr.save();

			// Write this message to the log.
			logMessage(node);

		} catch (RepositoryException e) {
			log.error(e.getMessage(), e);
		} catch (JCRNodeFactoryServiceException e) {
			log.error(e.getMessage(), e);
		} catch (LockTimeoutException e) {
			log.error(e.getMessage(), e);
		}
	}

	/**
	 * @param msgPath
	 * @param in
	 */
	private void logMessage(Node node) {

		try {
			String from = node.getProperty(JCRConstants.JCR_MESSAGE_FROM).getString();
			String to = node.getProperty(JCRConstants.JCR_MESSAGE_RCPTS).getString();
			String conversationId = node.getProperty(JCRConstants.JCR_MESSAGE_CHAT_CONVERSATION_ID).getString();

			InputStream in = null;
			String json = null;
			try {
				in = nodeFactory.getInputStream(node.getPath());
				// Read the chat message.
				System.err.println("Read chat message");
				json = IOUtils.readFully(in, "UTF-8");
				System.err.println("json = " + json);
			} finally {
				in.close();
			}
			System.err.println("Fully read chat message.");
			if (json != null) {

				// Convert the sent message
				System.err.println("Trying to convert message.");
				Message sentMessage = messagingService.createMessage();
				sentMessage = messageConverter.toMessage(json);

				sentMessage.setCategory("Chat");

				// Save the logs for both the users.
				doLog(from, to, conversationId, sentMessage);
				doLog(to, from, conversationId, sentMessage);
			}

		} catch (UnsupportedEncodingException e) {
			System.err.println(e);
			throw new MessagingException(e.getMessage(), e);
		} catch (JCRNodeFactoryServiceException e) {
			System.err.println(e);
			throw new MessagingException(e.getMessage(), e);
		} catch (RepositoryException e) {
			System.err.println(e);
			throw new MessagingException(e.getMessage(), e);
		} catch (IOException e) {
			System.err.println(e);
			throw new MessagingException(e.getMessage(), e);
		}

	}

	protected void doLog(String user, String otherUser, String conversationId,
			Message newMessage) throws RepositoryException,
			JCRNodeFactoryServiceException {

		// Find the log for this uer
		String filePath = userFactory.getMessagesPath(user) + MESSAGES_CHATLOGS;
		Node logNode = findMessage(conversationId, filePath);

		try {
			Message msg = null;
			if (logNode == null) {
				System.err.println("Log node is null");
				// This is the first message they send to each other
				// so there is no log yet.
				msg = newMessage;
				msg.setHeader(Message.Field.DATE, DateUtils.rfc2822());
				msg.setSubject("Chat log");

				// We create the node
				Node targetNode = nodeFactory.createFile(filePath + "/"
						+ conversationId, MediaType.APPLICATION_JSON);
				// Save it
				targetNode.getParent().getParent().save();

				logNode = targetNode;

				// Create a new log
				saveLog(msg, filePath + "/" + conversationId, logNode,
						conversationId);

				System.err.println("Created new log node.");

			} else {
				// The log did exist already
				// We fetch it and add this message to it.

				InputStream inLog = null;
				try {
					// We have a log file
					// Read it and convert it to a message.
					inLog = nodeFactory.getInputStream(logNode.getPath());
					String jsonLog = IOUtils.readFully(inLog, "UTF-8");
					msg = messageConverter.toMessage(jsonLog);

					System.err.println("Read log node.");
				} catch (IOException e) {
					throw new MessagingException(e.getMessage(), e);
				} finally {
					try {
						inLog.close();
					} catch (IOException e) {
						throw new MessagingException(e.getMessage(), e);
					}
				}

				// Add the chat message to it.
				msg.addPart(newMessage);

				System.err.println("Added the part to the log node.");

				// Save the log.
				saveLog(msg, logNode.getPath(), logNode, conversationId);

				System.err.println("Saved everything to JCR.");

			}

		} catch (UnsupportedEncodingException e) {
			System.err.println(e);
			throw new MessagingException(e.getMessage(), e);
		} catch (JCRNodeFactoryServiceException e) {
			System.err.println(e);
			throw new MessagingException(e.getMessage(), e);
		} catch (RepositoryException e) {
			System.err.println(e);
			throw new MessagingException(e.getMessage(), e);
		} catch (LockTimeoutException e) {
			System.err.println(e);
			throw new MessagingException(e.getMessage(), e);
		}

	}

	protected void saveLog(Message msg, String path, Node logNode,
			String conversationId) throws UnsupportedEncodingException,
			JCRNodeFactoryServiceException, RepositoryException,
			LockTimeoutException {

		System.err.println("Path = " + path);

		// Save message to jcr
		String toSave = messageConverter.toString(msg);
		// create an input stream to the content and write to JCR
		ByteArrayInputStream bais = new ByteArrayInputStream(toSave
				.getBytes("UTF-8"));
		logNode = nodeFactory.setInputStream(path, bais, "application/json");

		System.err.println("Wrote stream to JCR.");
		Value[] newVals = new Value[1];
		newVals[0] = new StringValue("inbox");
		logNode.setProperty(JCRConstants.JCR_LABELS, newVals);
		logNode.setProperty(JCRConstants.JCR_MESSAGE_TYPE, msg.getType());
		logNode.setProperty(JCRConstants.JCR_MESSAGE_READ, false);
		logNode.setProperty(JCRConstants.JCR_MESSAGE_ID, conversationId);
		logNode.setProperty(JCRConstants.JCR_MESSAGE_SUBJECT, msg.getSubject());
		logNode.setProperty(JCRConstants.JCR_MESSAGE_CATEGORY, msg.getCategory());
		logNode.setProperty(JCRConstants.JCR_MESSAGE_FROM, msg.getFrom());
		logNode.setProperty(JCRConstants.JCR_MESSAGE_RCPTS, msg.getTo());
		logNode.setProperty(JCRConstants.JCR_MESSAGE_DATE, DateUtils.rfc2822());
		logNode.save();
		jcr.save();

		System.err.println("Saved everything to JCR.");
	}

	protected Node findMessage(String logMessageId, String path)
			throws RepositoryException, JCRNodeFactoryServiceException {
		QueryManager queryManager = jcr.getQueryManager();

		String queryPath = "/jcr:root/" + ISO9075.encodePath(path)
				+ "//element(*," + JCRConstants.NT_FILE + ")[@"
				+ JCRConstants.JCR_MESSAGE_ID + "='" + logMessageId + "']";

		Query query = queryManager.createQuery(queryPath, Query.XPATH);
		QueryResult qr = query.execute();
		NodeIterator nodes = qr.getNodes();
		if (nodes.getSize() > 0) {
			return nodes.nextNode();
		}
		return null;
	}

	public String getKey() {
		return key;
	}

	public int getPriority() {
		return priority;
	}

}