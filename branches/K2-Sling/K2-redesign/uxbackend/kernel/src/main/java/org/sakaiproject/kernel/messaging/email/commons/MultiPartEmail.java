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

package org.sakaiproject.kernel.messaging.email.commons;

import com.google.inject.Inject;

import org.sakaiproject.kernel.api.messaging.MessagingException;
import org.sakaiproject.kernel.messaging.email.EmailMessagingService;

import java.io.Serializable;

import javax.jms.JMSException;

public class MultiPartEmail extends org.apache.commons.mail.MultiPartEmail
    implements Serializable {

  /**
   *
   */
  private static final long serialVersionUID = -7836497250571174552L;
  private transient EmailMessagingService messagingService;

  /**
   *
   */
  @Inject
  public MultiPartEmail(EmailMessagingService messagingService) {
    this.messagingService = messagingService;
  }

  /**
   * Does the work of actually sending the email.
   *
   * @exception MessagingException
   *              if there was an error.
   *
   * @return - the message id
   */
  @Override
  public String send() throws MessagingException {
    String messageId;
    try {
      messageId = messagingService.send(this);
    } catch (JMSException e) {
      throw new MessagingException(e);
    }

    return messageId;
  }
}