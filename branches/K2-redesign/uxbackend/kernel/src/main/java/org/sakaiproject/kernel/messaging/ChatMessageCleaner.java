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

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimerTask;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.query.Query;
import javax.jcr.query.QueryManager;
import javax.jcr.query.QueryResult;

import org.apache.commons.lang.time.DateUtils;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.messaging.ChatMessage;
import org.sakaiproject.kernel.api.messaging.MessagingException;
import org.sakaiproject.kernel.util.ISO9075;


public class ChatMessageCleaner extends TimerTask {

	private final int TIME_TO_DELETE = -120; // Messages older than this value
											// will be deleted. (value is
											// minutes)

	private final JCRService jcrService;

	/**
	 * 
	 * @param jcrService
	 */
	public ChatMessageCleaner(JCRService jcrService) {
		this.jcrService = jcrService;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see java.util.TimerTask#run()
	 */
	@Override
	public void run() {
		System.err.println("Timer task running.");
		System.err.println("Got jcr." + jcrService);

		QueryManager queryManager;
		try {
			jcrService.loginSystem(); // need to be admin when in our own thread

			// Get the current date and substract x minutes of it.
			Date d = new Date();
			d = DateUtils.addMinutes(d, TIME_TO_DELETE);

			// Make the format for the JCR query
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			SimpleDateFormat sdfMinutes = new SimpleDateFormat("kk:mm:ss");

			String timestamp = sdf.format(d) + "T" + sdfMinutes.format(d)
					+ ".000+01:00";

			queryManager = jcrService.getQueryManager();

			System.err.println("Got queryManager." + queryManager);

			String queryPath = "/jcr:root/"
					+ ISO9075.encodePath("_userprivate") + "//element(*,"
					+ JCRConstants.NT_FILE + ")[@"
					+ JCRConstants.JCR_MESSAGE_CHAT_CONVERSATION_ID
					+ " != '' and @" + JCRConstants.JCR_CREATED
					+ " < xs:dateTime('" + timestamp + "') and @"
					+ JCRConstants.JCR_MESSAGE_TYPE + "= '"
					+ ChatMessage.Type.INTERNAL.toString() + "']";

			Query query = queryManager.createQuery(queryPath, Query.XPATH);
			QueryResult qr = query.execute();

			System.err.println("Ran query.");
			NodeIterator nodes = qr.getNodes();

			// Loop the found nodes and delete them
			while (nodes.hasNext()) {
				Node n = nodes.nextNode();
				n.remove();
				System.err.println("Node removed.");
			}

			// need to manually save
			if (jcrService.hasActiveSession()) {
				Session session = jcrService.getSession();
				session.save();
			}

			System.err.println("Timer done.");

		} catch (RepositoryException e) {
			throw new MessagingException(e.getMessage(), e);
		} finally {
			// need to manually logout and commit
			try {
				jcrService.logout();
			} catch (Exception e) {
				throw new RuntimeException("Failed to logout of JCR: " + e, e);
			}
		}
	}
}
