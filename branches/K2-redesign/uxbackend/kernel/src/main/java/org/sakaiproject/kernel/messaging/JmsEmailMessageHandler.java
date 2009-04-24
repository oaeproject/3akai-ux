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

import com.google.inject.name.Named;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessageHandler;
import org.sakaiproject.kernel.util.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.MessageProducer;
import javax.jms.ObjectMessage;
import javax.jms.Session;

/**
 *
 */
public class JmsEmailMessageHandler implements MessageHandler {
  private static final String KEY = Message.Type.EMAIL.toString();
  private static final Log log = LogFactory
      .getLog(JmsEmailMessageHandler.class);

  private JCRNodeFactoryService nodeFactory;
  private ConnectionFactory connFactory;
  private String emailQueueName;
  private String emailJmsType;

  public JmsEmailMessageHandler(JCRNodeFactoryService nodeFactory,
      ConnectionFactory connFactory,
      @Named(KernelConstants.JMS_EMAIL_QUEUE) String emailQueueName,
      @Named(KernelConstants.JMS_EMAIL_TYPE) String emailJmsType) {
    this.nodeFactory = nodeFactory;
    this.connFactory = connFactory;
    this.emailQueueName = emailQueueName;
    this.emailJmsType = emailJmsType;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.MessageHandler#handle(java.lang.String,
   *      java.lang.String, java.lang.String, javax.jcr.Node)
   */
  public void handle(String userID, String filePath, String fileName, Node node) {
    try {
      InputStream inputStream = nodeFactory.getInputStream(filePath);
      String content = IOUtils.readFully(inputStream, "UTF-8");
      Connection conn = connFactory.createConnection();
      conn.setClientID("sakai.emailmessagehandler");
      Session clientSession = conn.createSession(false,
          Session.AUTO_ACKNOWLEDGE);
      Destination emailTopic = clientSession.createTopic(emailQueueName);
      MessageProducer client = clientSession.createProducer(emailTopic);
      ObjectMessage mesg = clientSession.createObjectMessage(content);
      mesg.setJMSType(emailJmsType);
      client.send(mesg);
    } catch (JMSException e) {
      log.error(e.getMessage(), e);
    } catch (RepositoryException e) {
      log.error(e.getMessage(), e);
    } catch (JCRNodeFactoryServiceException e) {
      log.error(e.getMessage(), e);
    } catch (UnsupportedEncodingException e) {
      log.error(e.getMessage(), e);
    } catch (IOException e) {
      log.error(e.getMessage(), e);
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return KEY;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getPriority()
   */
  public int getPriority() {
    return 0;
  }

}
