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

import java.util.HashMap;
import java.util.Map;

import org.sakaiproject.kernel.api.messaging.ChatMessage;
import org.sakaiproject.kernel.api.messaging.ChatMessagingService;

import com.google.inject.Inject;

/**
 * Base implementation for messages
 */
public class ChatMessageImpl implements ChatMessage {

	/**
   *
   */
	private static final long serialVersionUID = -5961927759010420137L;
	public static final String TEXT_PLAIN = "text/plain";

	private transient final ChatMessagingService chatMessagingService;
	private final HashMap<String, String> headers;

	private String bodyText;

	@Inject
	public ChatMessageImpl(ChatMessagingService chatMessagingService) {
		headers = new HashMap<String, String>();
		this.chatMessagingService = chatMessagingService;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#getHeader(java.lang.String)
	 */
	public String getHeader(String key) {
		return headers.get(key);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @param <T>
	 * @param key
	 * @return
	 * @see ChatMessage#getHeader(java.lang.Enum)
	 */
	public String getHeader(Enum<?> key) {
		return getHeader(key.toString());
	}

	public Map<String, String> getHeaders() {
		return headers;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#removeHeader(Enum)
	 */
	public void removeHeader(Enum<?> key) {
		removeHeader(key.toString());
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#removeHeader(String)
	 */
	public void removeHeader(String key) {
		headers.remove(key);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#setHeader(java.lang.String,
	 *      java.lang.Object)
	 */
	public void setHeader(String key, String value) {
		headers.put(key, value);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @param key
	 * @param value
	 * @see ChatMessage#setHeader(java.lang.Enum, java.io.Serializable)
	 */
	public void setHeader(Enum<?> key, String value) {
		setHeader(key.toString(), value);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see ChatMessage#send()
	 */
	public void send() {
		chatMessagingService.send(this);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#isBodyText()
	 */
	public boolean isBodyText() {
		return bodyText != null;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#getFrom()
	 */
	public String getFrom() {
		return getHeader(ChatMessage.Field.FROM);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#getText()
	 */
	public String getText() {
		return bodyText;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#setFrom()
	 */
	public void setFrom(String from) {
		setHeader(ChatMessage.Field.FROM, from);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#getTo()
	 */
	public String getTo() {
		return getHeader(ChatMessage.Field.TO);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#setTo()
	 */
	public void setTo(String to) {
		setHeader(ChatMessage.Field.TO, to);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#setText(java.lang.String)
	 */
	public void setText(String text) {
		this.bodyText = text;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#setType(org.sakaiproject.kernel.api.messaging.Message.Type)
	 */
	public void setType(String newType) {
		setHeader(ChatMessage.Field.TYPE.toString(), newType);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#getType()
	 */
	public String getType() {
		return getHeader(ChatMessage.Field.TYPE.toString());
	}

	/**
	 * {@inheritDoc}
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#getCid()
	 */
	public String getCid() {
		return getHeader(ChatMessage.Field.CID.toString());
	}

	/**
	 * {@inheritDoc}
	 * @see org.sakaiproject.kernel.api.messaging.ChatMessage#setCid(java.lang.String)
	 */
	public void setCid(String cid) {
		setHeader(ChatMessage.Field.CID.toString(), cid);
	}
}