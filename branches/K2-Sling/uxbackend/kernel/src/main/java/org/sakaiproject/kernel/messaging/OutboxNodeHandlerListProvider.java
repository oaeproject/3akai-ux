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
import com.google.inject.Provider;

import org.sakaiproject.kernel.api.messaging.MessageHandler;

import java.util.ArrayList;
import java.util.List;

public class OutboxNodeHandlerListProvider implements
    Provider<List<MessageHandler>> {

  private ArrayList<MessageHandler> handlers;

  @Inject
  public OutboxNodeHandlerListProvider(
      InternalMessageHandler internalOutgoingMessageHandler) {
    handlers = new ArrayList<MessageHandler>();
    handlers.add(internalOutgoingMessageHandler);
  }

  public List<MessageHandler> get() {
    return handlers;
  }
}
