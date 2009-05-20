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
import com.google.inject.Injector;

import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.messaging.EmailMessage;
import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessageConverter;
import org.sakaiproject.kernel.api.messaging.MessagingException;
import org.sakaiproject.kernel.api.messaging.MessagingService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.util.DateUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;

import javax.jcr.Node;
import javax.jcr.RepositoryException;

/**
 *
 */
public class JcrMessagingService implements MessagingService {
  private Injector injector;
  private JCRNodeFactoryService jcrNodeFactory;
  private MessageConverter msgConverter;
  private UserFactoryService userFactory;

  @Inject
  public JcrMessagingService(JCRNodeFactoryService jcrNodeFactory,
      MessageConverter msgConverter, Injector injector,
      UserFactoryService userFactory) {
    this.jcrNodeFactory = jcrNodeFactory;
    this.injector = injector;
    this.msgConverter = msgConverter;
    this.userFactory = userFactory;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.MessagingService#send(javax.jms.Message)
   */
  public void send(Message msg) throws MessagingException {
    // establish the send date and add it to the message
    String date = DateUtils.rfc2822();
    msg.setHeader(Message.Field.DATE, date);

    try {
      // convert message to the storage format (json)
      String json = msgConverter.toString(msg);

      // create an input stream to the content and write to JCR
      ByteArrayInputStream bais = new ByteArrayInputStream(json
          .getBytes("UTF-8"));

      // get the path for the outbox
      String path = userFactory.getMessagesPath(msg.getFrom()) + "/"
          + KernelConstants.OUTBOX + "/";

      // create a sha-1 hash of the content to use as the message name
      String msgName = org.sakaiproject.kernel.util.StringUtils.sha1Hash(json);

      // write the data to the node
      Node n = jcrNodeFactory.setInputStream(path + msgName, bais,
          "application/json");

      // set the type, recipients and date as node properties
      // A sent message is automaticly read.
      n.setProperty(JCRConstants.JCR_MESSAGE_READ, true);
      n.setProperty(JCRConstants.JCR_MESSAGE_ID, msgName);
      n.setProperty(JCRConstants.JCR_MESSAGE_TYPE, msg.getType());
      n.setProperty(JCRConstants.JCR_MESSAGE_SUBJECT, msg.getSubject());
      n.setProperty(JCRConstants.JCR_MESSAGE_CATEGORY, msg.getCategory());
      n.setProperty(JCRConstants.JCR_MESSAGE_FROM, msg.getFrom());
      n.setProperty(JCRConstants.JCR_MESSAGE_RCPTS, msg.getTo());
      n.setProperty(JCRConstants.JCR_MESSAGE_DATE, date);
    } catch (JCRNodeFactoryServiceException e) {
      throw new MessagingException(e.getMessage(), e);
    } catch (RepositoryException e) {
      throw new MessagingException(e.getMessage(), e);
    } catch (IOException e) {
      throw new MessagingException(e.getMessage(), e);
    } catch (NoSuchAlgorithmException e) {
      throw new MessagingException(e.getMessage(), e);
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.MessagingService#createEmailMessage()
   */
  public EmailMessage createEmailMessage() {
    EmailMessage em = injector.getInstance(EmailMessage.class);
    return em;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.MessagingService#createMessage()
   */
  public Message createMessage() {
    Message m = injector.getInstance(Message.class);
    return m;
  }
}
