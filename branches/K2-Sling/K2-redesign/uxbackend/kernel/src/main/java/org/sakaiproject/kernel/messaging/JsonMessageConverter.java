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

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.JSONSerializer;

import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessageConverter;
import org.sakaiproject.kernel.api.messaging.MessagingService;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Iterator;
import java.util.Set;
import java.util.Map.Entry;

/**
 *
 */
public class JsonMessageConverter implements MessageConverter {

  private MessagingService messagingService;

  /**
   *
   */
  @Inject
  public JsonMessageConverter(MessagingService messagingService) {
    this.messagingService = messagingService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.MessageConverter#toString(org.sakaiproject.kernel.api.messaging.Message)
   */
  public String toString(Message msg) {
    // create the string writer and initial builder
    JSONObject base = new JSONObject();

    // accumulate headers from message
    base.accumulateAll(msg.getHeaders());

    // add the body
    if (msg.isBodyText()) {
      base.element(Message.Field.BODY_TEXT.toString(), msg.getText());
    } else {
      base.element(Message.Field.BODY_URL.toString(), msg.getBody()
          .toExternalForm());
    }

    if (msg.getParts().size() > 0) {
      JSONArray parts = new JSONArray();
      // add attachments
      for (Message part : msg.getParts()) {
        parts.add(toString(part));
        // base.accumulate(PARTS, toString(part));
      }
      base.element(Message.Field.PARTS.toString(), parts);
    }

    return base.toString();
  }

  public Message toMessage(String json) {
    JSONObject jsonObj = (JSONObject) JSONSerializer.toJSON(json);
    Message msg = toMessage(jsonObj);
    return msg;
  }

  @SuppressWarnings("unchecked")
  protected Message toMessage(JSONObject jsonObj) {
    Message msg = messagingService.createMessage();

    // add headers
    Set entrySet = jsonObj.entrySet();
    Iterator entries = entrySet.iterator();
    while (entries.hasNext()) {
      Entry entry = (Entry) entries.next();
      String key = (String) entry.getKey();
      if (Message.Field.BODY_TEXT.toString().equals(key)) {
        msg.setText((String) entry.getValue());
      } else if (Message.Field.BODY_URL.toString().equals(key)) {
        try {
          msg.setBody(new URL((String) entry.getValue()));
        } catch (MalformedURLException e) {
          msg.setText("Unable to link to body.");
        }
      } else if (Message.Field.PARTS.toString().equals(key)) {
        JSONArray array = (JSONArray) entry.getValue();
        for (Object o : array) {
          msg.addPart(toMessage((JSONObject) o));
        }
      } else {
        msg.setHeader(key, (String) entry.getValue());
      }
    }
    return msg;
  }
}
