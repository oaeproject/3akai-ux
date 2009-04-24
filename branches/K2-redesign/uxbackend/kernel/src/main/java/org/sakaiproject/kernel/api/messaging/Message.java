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
import java.net.URL;
import java.util.List;
import java.util.Map;

/**
 * Base interface for all message objects. Can be used as a simple message
 * itself or extended.
 */
public interface Message extends Serializable {

  /**
   * An enumeration of field names in a message. The list is by no means
   * exhaustive.
   */
  public static enum Field {
    /** field name for the sender. */
    FROM("from"),
    /** field name for recipients */
    TO("to"),
    /** field name for subject */
    SUBJECT("subject"),
    /** field name for type. */
    TYPE("type"),
    /** field name for text body */
    BODY_TEXT("bodyText"),
    /** field name for url body */
    BODY_URL("bodyUrl"),
    /** field name for multipart attachments */
    PARTS("parts"),
    /** field name for body mime type */
    MIME_TYPE("mimeType"),
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
     *          the name of the field
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
    /** An email. */
    EMAIL("email"),
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
     *          the type of message
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
   * @param key
   *          the key of the field to get.
   * @return the value found for the requested field. null if not found.
   */
  String getHeader(String key);

  /**
   * Generic getter for a field. Equivalent to getField(key.toString()).
   *
   * @param <T>
   *          the type to be returned.
   * @param key
   *          the key of the field to get.
   * @return the value found for the requested field. null if not found.
   */
  String getHeader(Enum<?> key);

  /**
   * Retrieves all fields stored on the message.
   *
   * @return {@link java.util.Map}<String, Object> of fields with non-null keys
   *         and values.
   */
  Map<String, String> getHeaders();

  /**
   * Generic setter for a field.
   *
   * @param <T>
   *          the type of the value being set.
   * @param key
   *          the field to set a value to.
   * @param value
   *          the value to set.
   */
  void setHeader(String key, String value);

  /**
   * Generic setter for a field. Equivalent to setField(key.toString, value).
   *
   * @param key
   *          the field to set a value to.
   * @param value
   *          the value to set.
   */
  void setHeader(Enum<?> key, String value);

  /**
   * Removes a field from the message.
   *
   * @param key
   *          the key of the field to be removed.
   */
  void removeHeader(String key);

  /**
   * Removes a field from the message.
   *
   * @param key
   *          the key of the field to be removed.
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

  String getTo();

  void addTo(String to);

  /**
   * Is the body of the message text?
   *
   * @return
   */
  boolean isBodyText();

  /**
   * Gets the body of the message as a URI. Return null if the body is not set
   * or set to text.
   *
   * @return the body of the message. null if not set of text.
   */
  URL getBody();

  /**
   * Sets the body of the message to URI.
   *
   * @param newBody
   *          the main text of the message
   */
  void setBody(URL body);

  /**
   * Gets the body as a String.
   *
   * @return String version of the body.
   */
  String getText();

  /**
   * Sets the body to a String. Defaults the mime type to "text/plain" if mime
   * type is not set.
   *
   * @param text
   */
  void setText(String text);

  /**
   * Gets the title of the message.
   *
   * @return the title of the message
   */
  String getSubject();

  /**
   * Sets the title of the message. HTML attributes are allowed and are
   * sanitized by the container.
   *
   * @param newTitle
   *          the title of the message
   */
  void setSubject(String subject);

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
   *          the type of message (enum Message.Type)
   * @see Type
   */
  void setType(String newType);

  /**
   * Gets the mime type of the message content.
   *
   * @return
   */
  String getMimeType();

  /**
   * Sets the mime type of the message content.
   *
   * @param mimeType
   */
  void setMimeType(String mimeType);

  /**
   * Send the message. The implementation by which this is sent depends on how
   * the class was created. The implementation shouldn't be a concern.
   *
   * @throws MessagingException
   */
  void send() throws MessagingException;

  /**
   * Add an attachment to the message. Convenience method for adding a part to
   * the message. This constructs a new message and adds it to the message being
   * called.
   *
   * @param mimeType
   * @param attachment
   */
  void addAttachment(String mimeType, URL attachment);

  /**
   * Add a message as a part of the calling message.
   *
   * @param message
   */
  void addPart(Message message);

  /**
   * Get all parts added to the message.
   *
   * @return all parts added to the message. Empty non-null list if no parts
   *         found.
   */
  List<Message> getParts();
}
