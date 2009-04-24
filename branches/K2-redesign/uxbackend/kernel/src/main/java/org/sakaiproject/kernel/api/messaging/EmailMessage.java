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

/**
 * Base interface for all email objects.
 */
public interface EmailMessage extends Message {

  public static final String TYPE = "EmailMessage";

  public static enum Field {

    CC("Cc"), BCC("Bcc"), REPLY_TO("Reply-To"), DATE("Date");
    /**
     * the name of the header associated to the field.
     */
    private final String header;

    /**
     * Create a field based on a header name.
     *
     * @param jsonString
     *          the name of the field
     */
    private Field(String header) {
      this.header = header;
    }

    /**
     * @return a string representation of the enum.
     */
    @Override
    public String toString() {
      return this.header;
    }
  }

  /**
   * Adds a carbon copy recipient to the message.
   *
   * @param cc
   */
  void addCC(String cc);

  /**
   * Gets the carbon copy recipients of the message.
   *
   * @return Comma delimited String of CC recipients. null if not set.
   */
  String getCC();

  /**
   * Adds a blind carbon copy recipient to the message.
   *
   * @param cc
   */
  void addBcc(String bcc);

  /**
   * Gets the blind carbon copy recipients of the message.
   *
   * @return Comma delimited String of CC recipients. null if not set.
   */
  String getBcc();

  /**
   * Add recipient for replies.
   *
   * @param email
   *          Email string of reply to recipient.
   */
  void addReplyTo(String email);

  /**
   * Get reply recipients.
   *
   * @return {@link java.util.List} of {@link java.lang.String} of reply
   *         recipients.
   */
  String getReplyTo();
}
