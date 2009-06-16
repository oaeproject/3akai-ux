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

import com.google.inject.Inject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.messaging.EmailMessage;
import org.sakaiproject.kernel.api.messaging.Message;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Observable;
import java.util.Observer;
import java.util.Map.Entry;

import javax.jms.JMSException;
import javax.jms.MessageListener;
import javax.jms.ObjectMessage;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.SendFailedException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.Message.RecipientType;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.internet.MimePart;

/**
 *
 */
public class EmailMessageListener implements MessageListener {

  private static final Log LOG = LogFactory.getLog(EmailMessageListener.class);
  private final javax.mail.Session session;
  /**
   * Testing variable to enable/disable the calling of Transport.send
   */
  private boolean allowTransport = true;
  /**
   * Object to notify observers of changes in this class. This should be
   * considered a testing instrumentation.
   */
  private Observable observable;

  @Inject
  public EmailMessageListener(Session session) {
    this.session = session;
    observable = new EmailMessageObservable();
  }

  protected void setAllowTransport(boolean allowTransport) {
    this.allowTransport = allowTransport;
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.jms.MessageListener#onMessage(javax.jms.Message)
   */
  public void onMessage(javax.jms.Message jmsMsg) {
    if (jmsMsg instanceof ObjectMessage) {
      ObjectMessage objMsg = (ObjectMessage) jmsMsg;
      try {
        // get the email message and break out the parts
        Message email = (Message) objMsg.getObject();
        handleMessage(email);
      } catch (JMSException e) {
        // TODO log for now. We need to return a message to the sender that
        // something died while processing this message
        LOG.error(e.getMessage(), e);
      } catch (AddressException e) {
        LOG.error(e.getMessage(), e);
      } catch (UnsupportedEncodingException e) {
        LOG.error(e.getMessage(), e);
      } catch (SendFailedException e) {
        LOG.error(e.getMessage(), e);
      } catch (MessagingException e) {
        LOG.error(e.getMessage(), e);
      } catch (IOException e) {
        LOG.error(e.getMessage(), e);
      }
    }
  }

  public void handleMessage(Message email) throws AddressException,
      UnsupportedEncodingException, SendFailedException, MessagingException,
      IOException {
    String fromAddress = email.getHeader(Message.Field.FROM);
    if (fromAddress == null) {
      throw new MessagingException("Unable to send without a 'from' address.");
    }

    // transform to a MimeMessage
    ArrayList<String> invalids = new ArrayList<String>();

    // convert and validate the 'from' address
    InternetAddress from = new InternetAddress(fromAddress, true);

    // convert and validate reply to addresses
    String replyTos = email.getHeader(EmailMessage.Field.REPLY_TO);
    InternetAddress[] replyTo = emails2Internets(replyTos, invalids);

    // convert and validate the 'to' addresses
    String tos = email.getHeader(Message.Field.TO);
    InternetAddress[] to = emails2Internets(tos, invalids);

    // convert and validate 'cc' addresses
    String ccs = email.getHeader(EmailMessage.Field.CC);
    InternetAddress[] cc = emails2Internets(ccs, invalids);

    // convert and validate 'bcc' addresses
    String bccs = email.getHeader(EmailMessage.Field.BCC);
    InternetAddress[] bcc = emails2Internets(bccs, invalids);

    int totalRcpts = to.length + cc.length + bcc.length;
    if (totalRcpts == 0) {
      throw new MessagingException("No recipients to send to.");
    }

    MimeMessage mimeMsg = new MimeMessage(session);
    mimeMsg.setFrom(from);
    mimeMsg.setReplyTo(replyTo);
    mimeMsg.setRecipients(RecipientType.TO, to);
    mimeMsg.setRecipients(RecipientType.CC, cc);
    mimeMsg.setRecipients(RecipientType.BCC, bcc);

    // add in any additional headers
    Map<String, String> headers = email.getHeaders();
    if (headers != null && !headers.isEmpty()) {
      for (Entry<String, String> header : headers.entrySet()) {
        mimeMsg.setHeader(header.getKey(), header.getValue());
      }
    }

    // add the content to the message
    List<Message> parts = email.getParts();
    if (parts == null || parts.size() == 0) {
      setContent(mimeMsg, email);
    } else {
      // create a multipart container
      Multipart multipart = new MimeMultipart();

      // create a body part for the message text
      MimeBodyPart msgBodyPart = new MimeBodyPart();
      setContent(msgBodyPart, email);

      // add the message part to the container
      multipart.addBodyPart(msgBodyPart);

      // add attachments
      for (Message part : parts) {
        addPart(multipart, part);
      }

      // set the multipart container as the content of the message
      mimeMsg.setContent(multipart);
    }

    if (allowTransport) {
      // send
      Transport.send(mimeMsg);
    } else {
      try {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        mimeMsg.writeTo(output);
        String emailString = output.toString();
        LOG.info(emailString);
        observable.notifyObservers(emailString);
      } catch (IOException e) {
        LOG.info("Transport disabled and unable to write message to log: "
            + e.getMessage(), e);
      }
    }
  }

  /**
   * Sets the content of the mime part using the content of the email message.
   *
   * @param mimePart
   *          To where the content should be set.
   * @param email
   *          From where the content should be retrieved.
   * @throws IOException
   *           If the content is a URL and there is a problem opening a stream
   *           to it.
   * @throws MessagingException
   *           If there is a problem setting the content to the mime part.
   */
  private void setContent(MimePart mimePart, Message email)
      throws IOException, MessagingException {
    Object content = null;
    if (email.isBodyText()) {
      content = email.getText();
    } else {
      URL url = email.getBody();
      URLConnection conn = url.openConnection();
      content = conn.getContent();
    }

    mimePart.setContent(content, email.getMimeType());
  }

  /**
   * Attaches a file as a body part to the multipart message
   *
   * @param multipart
   * @param attachment
   * @throws MessagingException
   */
  private void addPart(Multipart multipart, Message msg)
      throws MessagingException {
    MimeBodyPart part = new MimeBodyPart();
    part.setContent(msg.getBody(), msg.getType());
    multipart.addBodyPart(part);
  }

  /**
   * Converts a {@link java.util.List} of {@link String} to
   * {@link javax.mail.internet.InternetAddress}.
   *
   * @param emails
   * @return Array will be the same size as the list with converted addresses.
   *         If list is null, the array returned will be 0 length (non-null).
   * @throws AddressException
   * @throws UnsupportedEncodingException
   */
  protected InternetAddress[] emails2Internets(String emails,
      List<String> invalids) {
    // set the default return value
    InternetAddress[] iaddrs = new InternetAddress[0];

    if (emails != null && emails.length() > 0) {
      String[] addrs = emails.split(",");
      ArrayList<InternetAddress> laddrs = new ArrayList<InternetAddress>();
      for (String addr : addrs) {
        try {
          InternetAddress ia = new InternetAddress(addr, true);
          laddrs.add(ia);
        } catch (AddressException e) {
          invalids.add(addr);
        }
      }
      if (!laddrs.isEmpty()) {
        iaddrs = laddrs.toArray(iaddrs);
      }
    }

    return iaddrs;
  }

  void addObserver(Observer ob) {
    observable.addObserver(ob);
  }

  static class EmailMessageObservable extends Observable {

    @Override
    public void notifyObservers(Object o) {
      setChanged();
      super.notifyObservers(o);
    }
  }
}
