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

import java.util.Iterator;
import java.util.Set;
import java.util.Map.Entry;

import net.sf.json.JSONObject;
import net.sf.json.JSONSerializer;

import org.sakaiproject.kernel.api.messaging.ChatMessage;
import org.sakaiproject.kernel.api.messaging.ChatMessageConverter;
import org.sakaiproject.kernel.api.messaging.ChatMessagingService;

import com.google.inject.Inject;

/**
 *
 */
public class JsonChatMessageConverter implements ChatMessageConverter {

  private ChatMessagingService chatMessagingService;

  /**
   *
   */
  @Inject
  public JsonChatMessageConverter(ChatMessagingService chatMessagingService) {
    this.chatMessagingService = chatMessagingService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.messaging.MessageConverter#toString(org.sakaiproject.kernel.api.messaging.Message)
   */
  public String toString(ChatMessage msg) {
    // create the string writer and initial builder
    JSONObject base = new JSONObject();

    // accumulate headers from message
    base.accumulateAll(msg.getHeaders());

    // add the body
    base.element(ChatMessage.Field.BODY_TEXT.toString(), msg.getText());

    return base.toString();
  }

  public ChatMessage toMessage(String json) {
    JSONObject jsonObj = (JSONObject) JSONSerializer.toJSON(json);
    ChatMessage msg = toMessage(jsonObj);
    return msg;
  }

  @SuppressWarnings("unchecked")
  protected ChatMessage toMessage(JSONObject jsonObj) {
	  ChatMessage msg = chatMessagingService.createMessage();

    // add headers
    Set entrySet = jsonObj.entrySet();
    Iterator entries = entrySet.iterator();
    while (entries.hasNext()) {
      Entry entry = (Entry) entries.next();
      String key = (String) entry.getKey();
      if (ChatMessage.Field.BODY_TEXT.toString().equals(key)) {
        msg.setText((String) entry.getValue());
      } else {
        msg.setHeader(key, (String) entry.getValue());
      }
    }
    return msg;
  }
}
