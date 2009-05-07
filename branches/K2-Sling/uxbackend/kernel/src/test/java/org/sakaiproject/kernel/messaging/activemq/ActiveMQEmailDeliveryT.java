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


package org.sakaiproject.kernel.messaging.activemq;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.commons.mail.Email;
import org.apache.commons.mail.EmailException;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.KernelModule;
import org.sakaiproject.kernel.messaging.email.EmailMessagingService;
import org.sakaiproject.kernel.messaging.email.commons.HtmlEmail;
import org.sakaiproject.kernel.messaging.email.commons.MultiPartEmail;
import org.sakaiproject.kernel.messaging.email.commons.SimpleEmail;
import org.sakaiproject.kernel.util.PropertiesLoader;
import org.subethamail.wiser.Wiser;
import org.subethamail.wiser.WiserMessage;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.jms.Connection;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageListener;
import javax.jms.MessageProducer;
import javax.jms.ObjectMessage;
import javax.jms.Queue;
import javax.jms.Session;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Part;
import javax.mail.Transport;
import javax.mail.internet.MimeMessage;

public class ActiveMQEmailDeliveryT {
  private static final Log LOG = LogFactory
      .getLog(ActiveMQEmailDeliveryT.class);

  static Connection listenerConn = null;
  static Connection clientConn = null;

  final String vmURL = "vm://localhost?broker.persistent=true";
  final String listenerID = "sakai-kernel";
  final String clientID = "sakai-tool";

  boolean received = false;

  private int listenerMessagesProcessed = 0;

  private static final String TEST_EMAIL_TO = "test@somewherez.org";

  private static final int smtpTestPort = 8025;

  private static final String TEST_EMAIL_FROM_ADDRESS = "postmaster@sakaiproject.org";
  private static final String TEST_EMAIL_FROM_LABEL = "KernelEmailBrokerTest";
  private static String TEST_EMAIL_BODY_PREFIX = "This is a Commons ";
  private static String TEST_EMAIL_BODY_SIMPLEEMAIL = TEST_EMAIL_BODY_PREFIX
      + "SimpleEmail";
  private static String TEST_EMAIL_BODY_HTMLEMAIL = TEST_EMAIL_BODY_PREFIX
      + "HtmlEmail";
  private static String TEST_EMAIL_BODY_MULTIPARTEMAIL = TEST_EMAIL_BODY_PREFIX
      + "MultiPartEmail";
  private static String TEST_EMAIL_SUBJECT = "Test message";
  private static Properties props = new Properties();
  private static Properties kernelProps;
  private static String emailQueueName;
  private static String emailType;

  @BeforeClass
  public static void setUpBeforeClass() throws Exception {
    kernelProps = PropertiesLoader.load(ActiveMQEmailDeliveryT.class
        .getClassLoader(), KernelModule.DEFAULT_PROPERTIES,
        KernelModule.LOCAL_PROPERTIES, KernelModule.SYS_LOCAL_PROPERTIES);
    emailQueueName = kernelProps.getProperty(KernelConstants.JMS_EMAIL_QUEUE);
    emailType = kernelProps.getProperty(KernelConstants.JMS_EMAIL_TYPE);
    props.put("mail.smtp.host", "localhost");
    props.put("mail.smtp.port", "" + smtpTestPort);
  }

  /*
   * @Test public void testUrl() { Assert.assertEquals(fact.getBrokerURL(),
   * ActiveMQConnectionFactory.DEFAULT_BROKER_URL); LOG.info("BrokerUrl: " +
   * fact.getBrokerURL());
   *
   * }
   */

  @Test
  public void testConfigureBroker() {
    ActiveMQConnectionFactory fact = new ActiveMQConnectionFactory(vmURL);
    fact.setClientID(clientID);
    Assert.assertEquals(fact.getBrokerURL(), vmURL);
    LOG.info("new vm broker url: " + fact.getBrokerURL());
  }

  // Test is broken: @Test
  public void testGetConnections() {
    ActiveMQConnectionFactory clientFact = new ActiveMQConnectionFactory(vmURL);
    ActiveMQConnectionFactory serverFact = new ActiveMQConnectionFactory(vmURL);
    clientFact.setClientID(clientID);
    serverFact.setClientID(listenerID);
    try {
      listenerConn = serverFact.createQueueConnection();
      Assert.assertNotNull(listenerConn);
      clientConn = clientFact.createQueueConnection();
      Assert.assertNotNull(clientConn);
    } catch (JMSException e) {
      e.printStackTrace();
      Assert.assertTrue(false);
    }
  }

  // Test is broken @Test
  public void testCommonsEmailOneWaySeparateSessions() {

    Queue emailQueue = null;
    MessageConsumer consumer = null;
    MessageProducer producer = null;
    Session clientSession = null;
    Session listenerSession = null;
    // it is not necessary to use the Email interface here
    // Email is used here just to allow for multiple types of emails to
    // occupy
    // the same varaible. SimpleEmail etc can each be used directly.
    List<Email> emails = new ArrayList<Email>();
    EmailMessagingService messagingService = new EmailMessagingService(vmURL,
        emailQueueName, emailType, null, null, null, null);
    emails.add(new SimpleEmail(messagingService));
    emails.add(new MultiPartEmail(messagingService));
    emails.add(new HtmlEmail(messagingService));
    try {

      listenerSession = listenerConn.createSession(false,
          Session.AUTO_ACKNOWLEDGE);
      emailQueue = listenerSession
          .createQueue(emailQueueName);

      consumer = listenerSession.createConsumer(emailQueue);

      consumer.setMessageListener(new EmailListener());

      listenerConn.start();

      listenerSession.run();

    } catch (JMSException e2) {
      e2.printStackTrace();
      Assert.assertTrue(false);
    }

    Wiser smtpServer = new Wiser();
    smtpServer.setPort(smtpTestPort);
    smtpServer.start();

    try {
      clientSession = clientConn.createSession(false, Session.AUTO_ACKNOWLEDGE);
      emailQueue = clientSession
          .createQueue(emailQueueName);
      producer = clientSession.createProducer(emailQueue);

      clientConn.start();
      clientSession.run();

    } catch (JMSException e) {
      e.printStackTrace();
      Assert.assertTrue(false);
    }

    for (Email em : emails) {

      try {
        em.addTo(TEST_EMAIL_TO);
        em.setFrom(TEST_EMAIL_FROM_ADDRESS, TEST_EMAIL_FROM_LABEL);
        // host and port will be ignored since the email session is
        // established
        // by
        // the listener
        em.setHostName("localhost");
        em.setSmtpPort(smtpTestPort);
        em.setSubject(TEST_EMAIL_SUBJECT);
        if (em instanceof HtmlEmail) {
          em.setMsg(TEST_EMAIL_BODY_HTMLEMAIL);
        } else if (em instanceof MultiPartEmail) {
          em.setMsg(TEST_EMAIL_BODY_MULTIPARTEMAIL);
        } else if (em instanceof SimpleEmail) {
          em.setMsg(TEST_EMAIL_BODY_SIMPLEEMAIL);
        }

      } catch (EmailException e1) {
        Assert.assertTrue(false);
        e1.printStackTrace();
      }

      try {
        em.buildMimeMessage();
      } catch (EmailException e1) {
        e1.printStackTrace();
        Assert.assertTrue(false);
      }

      ByteArrayOutputStream os = new ByteArrayOutputStream();
      try {

        em.getMimeMessage().writeTo(os);
      } catch (javax.mail.MessagingException e) {
        e.printStackTrace();
        Assert.assertTrue(false);
      } catch (IOException e) {
        e.printStackTrace();
        Assert.assertTrue(false);
      }

      String content = os.toString();

      ObjectMessage om;
      try {
        om = clientSession.createObjectMessage(content);

        om.setJMSType(emailType);

        LOG.info("Client: Sending test message....");
        producer.send(om);
      } catch (JMSException e) {
        e.printStackTrace();
        Assert.assertTrue(false);
      }

    }

    long start = System.currentTimeMillis();
    while (listenerMessagesProcessed < 3
        && System.currentTimeMillis() - start < 10000L) {
      // wait for transport
    }
    Assert.assertTrue(listenerMessagesProcessed == 3);

    List<WiserMessage> messages = smtpServer.getMessages();
    Assert.assertTrue(messages.size() + " != expected value of 3", messages
        .size() == 3);

    for (WiserMessage wisermsg : messages) {
      String body = null;
      String subject = null;
      MimeMessage testmail = null;

      try {
        testmail = wisermsg.getMimeMessage();
      } catch (MessagingException e) {
        Assert.assertTrue(false);
        e.printStackTrace();
      }

      if (testmail != null) {
        LOG.info("SMTP server: test email received: ");
        try {
          LOG.info("To: " + testmail.getHeader("To", ","));

          LOG.info("Subject: " + testmail.getHeader("Subject", ","));
          body = getBodyAsString(testmail.getContent());
          subject = testmail.getHeader("Subject", ",");
        } catch (MessagingException e) {
          Assert.assertTrue(false);
          e.printStackTrace();
        } catch (IOException e) {
          Assert.assertTrue(false);
          e.printStackTrace();
        }
        LOG.info("Body: " + body);
        Assert.assertTrue(subject.contains(TEST_EMAIL_SUBJECT));
        Assert.assertTrue(body.contains("This is a Commons"));
      } else {
        Assert.assertTrue(false);
      }
    }

    if (clientSession != null) {
      try {
        clientSession.close();
      } catch (JMSException e) {
        e.printStackTrace();
        Assert.assertTrue(false);
      }
      clientSession = null;
    }

    if (listenerSession != null) {
      try {
        listenerSession.close();
      } catch (JMSException e) {
        e.printStackTrace();
        Assert.assertTrue(false);
      }
      listenerSession = null;
    }

    smtpServer.stop();

  }

  private String getBodyAsString(Object content) {
    Multipart mime = null;
    StringBuffer sb = new StringBuffer();
    if (content instanceof String) {
      return (String) content;
    } else if (content instanceof Multipart) {
      try {
        mime = (Multipart) content;
        for (int i = 0; i < mime.getCount(); ++i) {
          Part p = mime.getBodyPart(i);
          sb.append(p.getContent());
        }
      } catch (MessagingException e) {
        e.printStackTrace();
        Assert.assertTrue(false);
      } catch (IOException e) {
        e.printStackTrace();
        Assert.assertTrue(false);
      }
    } else {
      Assert.assertTrue(false);
    }
    return sb.toString();
  }

  protected void setReceived() {
    listenerMessagesProcessed++;
  }

  @AfterClass
  public static void tearDownAfterClass() throws Exception {

    if (clientConn != null) {
      clientConn.stop();
      clientConn = null;
    }

    if (listenerConn != null) {
      listenerConn.stop();
      listenerConn = null;
    }

  }

  public class EmailListener implements MessageListener {

    public void onMessage(Message message) {
      LOG.info("---> in consumer message listener...");

      try {
        if (emailType.equals(message.getJMSType())
            && message instanceof ObjectMessage) {
          // avoiding selectors
          ObjectMessage m = (ObjectMessage) message;

          String content = null;
          try {
            content = (String) m.getObject();
          } catch (JMSException e) {
            e.printStackTrace();
            Assert.assertTrue(false);
          }
          if (content != null) {
            byte[] bytes = content.getBytes();
            ByteArrayInputStream bis = new ByteArrayInputStream(bytes);
            try {

              javax.mail.Session session = javax.mail.Session
                  .getDefaultInstance(props, null);
              MimeMessage emailMessage = new MimeMessage(session, bis);
              LOG.info("Sending email to smtp server on port: " + smtpTestPort);
              Transport.send(emailMessage);
            } catch (MessagingException e1) {
              e1.printStackTrace();
              Assert.assertTrue(false);
            }
          }

        } else {
          Assert.assertTrue(false);
        }
      } catch (JMSException e) {
        e.printStackTrace();
        Assert.assertTrue(false);
      }
      setReceived();
    }
  }

}
