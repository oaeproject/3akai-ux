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
package org.sakaiproject.kernel.api.messaging;

import java.io.Serializable;
import java.util.Map;

/**
 * Interface for chat messages
 */
public interface ChatMessage extends Serializable {

	/**
	 * An enumeration of field names in a chat message.
	 */
	public static enum Field {
		/** field name for the sender. */
		FROM("from"),
		/** field name for recipient */
		TO("to"),
		/** field name for text body */
		BODY_TEXT("bodyText"),
		/** field name for type. */
		TYPE("type"),
		/** field name for the send date */
		DATE("date");

		/**
		 * the name of the field.
		 */
		private final String niceName;

		/**
		 * Create a field based on a name.
		 * 
		 * @param jsonString
		 *            the name of the field
		 */
		private Field(String jsonString) {
			this.niceName = jsonString;
		}

		/**
		 * @return a string representation of the enum.
		 */
		@Override
		public String toString() {
			return this.niceName;
		}
	}

	/**
	 * The type of a message.
	 */
	public static enum Type {
		/** A message that can be delivered within the system **/
		INTERNAL("internal");

		/**
		 * The type of message.
		 */
		private final String niceName;

		/**
		 * Create a message type based on a string token.
		 * 
		 * @param jsonString
		 *            the type of message
		 */
		private Type(String jsonString) {
			this.niceName = jsonString;
		}

		/**
		 * @return a string representation of the enum.
		 */
		@Override
		public String toString() {
			return this.niceName;
		}
	}

	/**
	 * Generic getter for a field.
	 * 
	 * @param key the key of the field to get.
	 * @return the value found for the requested field. null if not found.
	 */
	String getHeader(String key);

	/**
	 * Generic getter for a field. Equivalent to getField(key.toString()).
	 * 
	 * @param <T> the type to be returned.
	 * @param key the key of the field to get.
	 * @return the value found for the requested field. null if not found.
	 */
	String getHeader(Enum<?> key);

	/**
	 * Retrieves all fields stored on the message.
	 * 
	 * @return {@link java.util.Map}<String, Object> of fields with non-null
	 *         keys and values.
	 */
	Map<String, String> getHeaders();

	/**
	 * Generic setter for a field.
	 * 
	 * @param <T> the type of the value being set.
	 * @param key the field to set a value to.
	 * @param value the value to set.
	 */
	void setHeader(String key, String value);

	/**
	 * Generic setter for a field. Equivalent to setField(key.toString, value).
	 * 
	 * @param key the field to set a value to.
	 * @param value the value to set.
	 */
	void setHeader(Enum<?> key, String value);

	/**
	 * Removes a field from the message.
	 * 
	 * @param key the key of the field to be removed.
	 */
	void removeHeader(String key);

	/**
	 * Removes a field from the message.
	 * 
	 * @param key the key of the field to be removed.
	 */
	void removeHeader(Enum<?> key);

	/**
	 * Get the sender of the message.
	 * 
	 * @return
	 */
	String getFrom();

	/**
	 * Set the sender of the message.
	 */
	void setFrom(String from);
	
	/**
	 * Get the receiver of the message
	 * 
	 * @return
	 */
	String getTo();

	/**
	 * Set the receiver of the message
	 * 
	 * @param to
	 */
	void setTo(String to);

	/**
	 * Gets the body as a String.
	 * 
	 * @return String version of the body.
	 */
	String getText();

	/**
	 * Sets the body to a String.
	 * 
	 * @param text
	 */
	void setText(String text);

	/**
	 * Gets the type of the message.
	 * 
	 * @return the type of message
	 * @see Type
	 */
	String getType();

	/**
	 * Sets the type of the message.
	 * 
	 * @param newType
	 *            the type of message (enum Message.Type)
	 * @see Type
	 */
	void setType(String newType);
	
	/**
	 * Send the message. The implementation by which this is sent depends on how
	 * the class was created. The implementation shouldn't be a concern.
	 * 
	 * @throws MessagingException
	 */
	void send() throws MessagingException;
}