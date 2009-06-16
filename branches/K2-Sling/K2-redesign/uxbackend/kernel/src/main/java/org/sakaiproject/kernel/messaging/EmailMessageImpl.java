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

import com.google.inject.Inject;

import org.sakaiproject.kernel.api.messaging.EmailMessage;
import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessagingService;

/**
 * Implementation of Email messages.
 */
public class EmailMessageImpl extends MessageImpl implements
    EmailMessage {

  private static final long serialVersionUID = 1L;

  @Inject
  public EmailMessageImpl(MessagingService messagingService) {
    super(messagingService, Message.Type.EMAIL.toString());
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.EmailMessage#addReplyTo(java.lang.String)
   */
  public void addReplyTo(String email) {
    String msgReplyTo = getHeader(EmailMessage.Field.REPLY_TO);
    if (msgReplyTo != null) {
      msgReplyTo += ", " + email;
    } else {
      msgReplyTo = email;
    }
    setHeader(EmailMessage.Field.REPLY_TO, msgReplyTo);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.EmailMessage#getReplyTo()
   */
  public String getReplyTo() {
    return getHeader(EmailMessage.Field.REPLY_TO);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.EmailMessage#addBcc(java.lang.String)
   */
  public void addBcc(String bcc) {
    String msgBcc = getHeader(EmailMessage.Field.BCC);
    if (msgBcc != null) {
      msgBcc += ", " + bcc;
    } else {
      msgBcc = bcc;
    }
    setHeader(Message.Field.TO, msgBcc);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.EmailMessage#addCC(java.lang.String)
   */
  public void addCC(String cc) {
    String msgCc = getHeader(EmailMessage.Field.CC);
    if (msgCc != null) {
      msgCc += ", " + cc;
    } else {
      msgCc = cc;
    }
    setHeader(Message.Field.TO, msgCc);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.EmailMessage#getBcc()
   */
  public String getBcc() {
    return getHeader(EmailMessage.Field.BCC);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.EmailMessage#getCC()
   */
  public String getCC() {
    return getHeader(EmailMessage.Field.CC);
  }
}
