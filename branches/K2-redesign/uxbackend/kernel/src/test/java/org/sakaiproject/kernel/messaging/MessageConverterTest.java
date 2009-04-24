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

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import com.google.inject.Guice;
import com.google.inject.Injector;

import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessageConverter;
import org.sakaiproject.kernel.api.messaging.MessagingService;
import org.sakaiproject.kernel.model.test.ModelModule;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 *
 */
public class MessageConverterTest {
  private MessageConverter msgConverter;
  private Injector injector;
  private Message msg;

  @Before
  public void setUp() {
    injector = Guice.createInjector(new ModelModule(),
        new MessagingTestModule());
    msgConverter = injector.getInstance(MessageConverter.class);

    // setup 5 different calls to createMessage
    MessagingService msgServ = injector.getInstance(MessagingService.class);
    for (int i = 0; i < 10; i++) {
      expect(msgServ.createMessage()).andReturn(new MessageImpl(msgServ));
    }
    replay(msgServ);

    msg = injector.getInstance(Message.class);
    msg.setFrom("test@example.com");
    msg.setSubject("test message");
  }

  @Test
  public void convertSimpleMessage() throws Exception {
    msg.setText("text of test message");

    Message msg2 = convertAgain(msg);
    compareMessages(msg, msg2);
  }

  @Test
  public void convertMessageWithUrlBody() throws Exception {
    String body = "text in a file";
    URL url = writeTempFile(body);
    msg.setBody(url);
    Message msg2 = convertAgain(msg);

    compareMessages(msg, msg2);
  }

  @Test
  public void convertMessageWithParts() throws Exception {
    String body = "text of test message";
    msg.setText(body);
    // add first part
    Message part1 = injector.getInstance(Message.class);
    URL url1 = writeTempFile("test1");
    part1.setBody(url1);
    msg.addPart(part1);
    // add second part
    URL url2 = writeTempFile("test2");
    msg.addAttachment("application/file", url2);
    Message msg2 = convertAgain(msg);

    // test outer message
    compareMessages(msg, msg2);
  }

  @Test
  public void convertMessageWithNestedParts() throws Exception {
    String body = "text of test message";
    msg.setText(body);
    // add first part
    Message part1 = injector.getInstance(Message.class);
    URL url1 = writeTempFile("test1");
    part1.setBody(url1);
    msg.addPart(part1);
    // add second part
    URL url2 = writeTempFile("test2");
    msg.addAttachment("application/file", url2);
    // add nested part
    Message part3 = injector.getInstance(Message.class);
    URL url3 = writeTempFile("test3");
    part3.setBody(url3);
    Message part4 = injector.getInstance(Message.class);
    URL url4 = writeTempFile("test4");
    part4.setBody(url4);
    part3.addPart(part4);
    msg.addPart(part3);
    Message msg2 = convertAgain(msg);

    // test outer message
    compareMessages(msg, msg2);
  }

  private Message convertAgain(Message msg) {
    String json = msgConverter.toString(msg);
    Message msg2 = msgConverter.toMessage(json);
    // String json = converter.convertToString(msg);
    // Message msg2 = converter.convertToObject(json, Message.class);
    return msg2;
  }

  private File createTempFile() throws IOException {
    File f = File.createTempFile("whatever", null);
    f.deleteOnExit();
    return f;
  }

  private String readFile(URL url) throws IOException {
    BufferedReader br = new BufferedReader(new InputStreamReader(url
        .openStream()));

    StringBuilder fileContent = new StringBuilder();
    String inputLine = null;
    while ((inputLine = br.readLine()) != null) {
      fileContent.append(inputLine);
    }
    return fileContent.toString();
  }

  private URL writeTempFile(String body) throws IOException {
    File f = createTempFile();
    FileWriter fw = new FileWriter(f);
    fw.append(body);
    fw.flush();
    fw.close();
    URL url = f.toURI().toURL();
    return url;
  }

  private void compareMessages(Message msg1, Message msg2) throws IOException {
    Map<String, String> headers1 = msg1.getHeaders();
    Map<String, String> headers2 = msg2.getHeaders();
    assertEquals(headers1.size(), headers2.size());
    for (Entry<String, String> header1 : headers1.entrySet()) {
      String key1 = header1.getKey();
      String value1 = header1.getValue();
      assertTrue(headers2.containsKey(key1));
      assertEquals(value1, headers2.get(key1));
    }
    assertEquals(msg1.isBodyText(), msg2.isBodyText());
    assertEquals(msg1.getText(), msg2.getText());
    assertEquals(msg1.getBody(), msg2.getBody());

    if (!msg1.isBodyText()) {
      String content1 = readFile(msg1.getBody());
      String content2 = readFile(msg2.getBody());
      assertEquals(content1, content2);
    }

    // test parts
    List<Message> parts1 = msg1.getParts();
    List<Message> parts2 = msg2.getParts();
    assertEquals(parts1.size(), parts2.size());

    for (int i = 0; i < parts1.size(); i++) {
      compareMessages(parts1.get(i), parts2.get(i));
    }
  }
}
