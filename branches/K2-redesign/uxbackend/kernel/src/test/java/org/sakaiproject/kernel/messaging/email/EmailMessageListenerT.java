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
package org.sakaiproject.kernel.messaging.email;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.sakaiproject.kernel.api.messaging.EmailMessage;
import org.sakaiproject.kernel.messaging.EmailMessageImpl;

import java.io.File;
import java.io.Serializable;
import java.util.Enumeration;
import java.util.Observable;
import java.util.Observer;
import java.util.Properties;

import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.ObjectMessage;
import javax.mail.MessagingException;
import javax.mail.Session;

/**
 * Unit test for email message listener
 */
public class EmailMessageListenerT {

  static final String HOST = "localhost";
  static final String PORT = "8025";
  Session session;
  EmailMessageListener listener;
  private EmailMessage email;

  @Before
  public void setUp() {
    Properties props = new Properties();
    props.put("mail.smtp.host", HOST);
    props.put("mail.smtp.port", PORT);
    // props.put("mail.smtp.from", "postmaster@emailMessageListener.test");
    props.put("mail.smtp.sendpartial", "true");
    session = Session.getDefaultInstance(props);

    listener = new EmailMessageListener(session);
    listener.setAllowTransport(false);

    email = new EmailMessageImpl(null);
  }

  @Test
  public void jmsSend() throws Exception {
    ObjectMessage msg = new TestObjMsg(email);
    // pass a null service because we're starting after when the service is used
    email.setFrom("jmssend@example.com");
    email.addTo("random@example.com");
    email.setText("This is some test text.");

    listener.onMessage(msg);
  }

  @Test
  public void send() throws Exception {
    // pass a null service because we're starting after when the service is used
    email.setFrom("send@example.com");
    email.addTo("random@example.com");
    email.setText("This is some test text.");

    listener.handleMessage(email);
  }

  @Test
  public void invalidFrom() throws Exception {
    // pass a null service because we're starting after when the service is used
    email.addTo("invalidfrom@example.com");
    email.setText("This is some test text.");

    try {
      listener.handleMessage(email);
      fail("Should fail with no 'from' address");
    } catch (MessagingException e) {
      // expected
    }
  }

  @Test
  public void noRcpts() throws Exception {
    // pass a null service because we're starting after when the service is used
    email.setFrom("norcpts@example.com");
    email.setText("This is some test text.");

    try {
      listener.handleMessage(email);
      fail("Should fail with no recipient addresses");
    } catch (MessagingException e) {
      // expected
    }
  }

  @Ignore
  public void sendWithAttachments() throws Exception {
    // pass a null service because we're starting after when the service is used
    email.setFrom("attachments@example.com");
    email.addTo("random@example.com");
    email.setText("This is some test text.");
    File f1 = File.createTempFile("test1", null);
    File f2 = File.createTempFile("test2", null);
    email.addAttachment("text/plain", f1.toURI().toURL());
    email.addAttachment("text/plain", f2.toURI().toURL());

    final StringBuilder emailString = new StringBuilder();
    listener.addObserver(new Observer() {

      public void update(Observable o, Object arg) {
        emailString.append(arg);
      }
    });
    listener.handleMessage(email);

    int contentPos = emailString.indexOf("Content-Type: multipart/mixed");
    assertTrue(contentPos > -1);

    String boundaryHeader = "boundary=\"";
    int boundBeg = emailString.indexOf(boundaryHeader) + boundaryHeader.length();
    assertTrue(boundBeg > boundaryHeader.length());
    int boundEnd = emailString.indexOf("\"", boundBeg + 1);
    assertTrue(boundEnd > -1);

    String boundary = emailString.substring(boundBeg, boundEnd);

    int pos = boundEnd;
    int countBoundaries = -1;
    while (pos > -1) {
      countBoundaries++;
      pos = emailString.indexOf(boundary, pos + 1);
    }
    // 3 => 1 for content, 2 for attachments. May also be an extra one after
    // that at the end of the message.
    assertTrue(countBoundaries >= 3);
  }

  @Ignore
  public void sendWithBadAttachment() throws Exception {
    // pass a null service because we're starting after when the service is used
    email.setFrom("attachments@example.com");
    email.addTo("random@example.com");
    email.setText("This is some test text.");
    File f1 = new File("test1.tmp");
    email.addAttachment("text/plain", f1.toURI().toURL());

    final StringBuilder emailString = new StringBuilder();
    listener.addObserver(new Observer() {

      public void update(Observable o, Object arg) {
        emailString.append(arg);
      }
    });
    listener.handleMessage(email);

    assertEquals(0, emailString.length());
  }

  static class TestObjMsg implements ObjectMessage {

    private Serializable obj;

    TestObjMsg(Serializable obj) {
      this.obj = obj;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.ObjectMessage#getObject()
     */
    public Serializable getObject() throws JMSException {
      return obj;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.ObjectMessage#setObject(java.io.Serializable)
     */
    public void setObject(Serializable obj) throws JMSException {
      this.obj = obj;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#acknowledge()
     */
    public void acknowledge() throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#clearBody()
     */
    public void clearBody() throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#clearProperties()
     */
    public void clearProperties() throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getBooleanProperty(java.lang.String)
     */
    public boolean getBooleanProperty(String arg0) throws JMSException {
      return false;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getByteProperty(java.lang.String)
     */
    public byte getByteProperty(String arg0) throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getDoubleProperty(java.lang.String)
     */
    public double getDoubleProperty(String arg0) throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getFloatProperty(java.lang.String)
     */
    public float getFloatProperty(String arg0) throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getIntProperty(java.lang.String)
     */
    public int getIntProperty(String arg0) throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSCorrelationID()
     */
    public String getJMSCorrelationID() throws JMSException {
      return null;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSCorrelationIDAsBytes()
     */
    public byte[] getJMSCorrelationIDAsBytes() throws JMSException {
      return null;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSDeliveryMode()
     */
    public int getJMSDeliveryMode() throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSDestination()
     */
    public Destination getJMSDestination() throws JMSException {
      return null;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSExpiration()
     */
    public long getJMSExpiration() throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSMessageID()
     */
    public String getJMSMessageID() throws JMSException {
      return null;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSPriority()
     */
    public int getJMSPriority() throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSRedelivered()
     */
    public boolean getJMSRedelivered() throws JMSException {
      return false;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSReplyTo()
     */
    public Destination getJMSReplyTo() throws JMSException {
      return null;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSTimestamp()
     */
    public long getJMSTimestamp() throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getJMSType()
     */
    public String getJMSType() throws JMSException {
      return null;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getLongProperty(java.lang.String)
     */
    public long getLongProperty(String arg0) throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getObjectProperty(java.lang.String)
     */
    public Object getObjectProperty(String arg0) throws JMSException {
      return null;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getPropertyNames()
     */
    @SuppressWarnings("unchecked")
    public Enumeration getPropertyNames() throws JMSException {
      return null;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getShortProperty(java.lang.String)
     */
    public short getShortProperty(String arg0) throws JMSException {
      return 0;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#getStringProperty(java.lang.String)
     */
    public String getStringProperty(String arg0) throws JMSException {
      return null;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#propertyExists(java.lang.String)
     */
    public boolean propertyExists(String arg0) throws JMSException {
      return false;
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setBooleanProperty(java.lang.String, boolean)
     */
    public void setBooleanProperty(String arg0, boolean arg1)
        throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setByteProperty(java.lang.String, byte)
     */
    public void setByteProperty(String arg0, byte arg1) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setDoubleProperty(java.lang.String, double)
     */
    public void setDoubleProperty(String arg0, double arg1) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setFloatProperty(java.lang.String, float)
     */
    public void setFloatProperty(String arg0, float arg1) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setIntProperty(java.lang.String, int)
     */
    public void setIntProperty(String arg0, int arg1) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSCorrelationID(java.lang.String)
     */
    public void setJMSCorrelationID(String arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSCorrelationIDAsBytes(byte[])
     */
    public void setJMSCorrelationIDAsBytes(byte[] arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSDeliveryMode(int)
     */
    public void setJMSDeliveryMode(int arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSDestination(javax.jms.Destination)
     */
    public void setJMSDestination(Destination arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSExpiration(long)
     */
    public void setJMSExpiration(long arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSMessageID(java.lang.String)
     */
    public void setJMSMessageID(String arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSPriority(int)
     */
    public void setJMSPriority(int arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSRedelivered(boolean)
     */
    public void setJMSRedelivered(boolean arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSReplyTo(javax.jms.Destination)
     */
    public void setJMSReplyTo(Destination arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSTimestamp(long)
     */
    public void setJMSTimestamp(long arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setJMSType(java.lang.String)
     */
    public void setJMSType(String arg0) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setLongProperty(java.lang.String, long)
     */
    public void setLongProperty(String arg0, long arg1) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setObjectProperty(java.lang.String,
     *      java.lang.Object)
     */
    public void setObjectProperty(String arg0, Object arg1) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setShortProperty(java.lang.String, short)
     */
    public void setShortProperty(String arg0, short arg1) throws JMSException {
    }

    /**
     * {@inheritDoc}
     *
     * @see javax.jms.Message#setStringProperty(java.lang.String,
     *      java.lang.String)
     */
    public void setStringProperty(String arg0, String arg1) throws JMSException {
    }
  }
}
