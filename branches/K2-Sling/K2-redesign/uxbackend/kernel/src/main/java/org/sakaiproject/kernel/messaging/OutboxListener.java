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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.messaging.MessageHandler;
import org.sakaiproject.kernel.jcr.api.JcrContentListener;

import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;

/**
 *
 */
public class OutboxListener implements JcrContentListener {
  private static final Log log = LogFactory.getLog(OutboxListener.class);

  private JCRNodeFactoryService jcrNodeFactory;
  private Registry<String, MessageHandler> registry;
  private static final boolean DEBUG = log.isDebugEnabled();

  @Inject
  public OutboxListener(JCRNodeFactoryService jcrNodeFactory,
      RegistryService registryService) {
    registry = registryService.getRegistry(MessageHandler.REGISTRY);
    this.jcrNodeFactory = jcrNodeFactory;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.jcr.api.JcrContentListener#onEvent(int,
   *      java.lang.String, java.lang.String, java.lang.String)
   */
  public void onEvent(int type, String userID, String filePath, String fileName) {
    // make sure we deal only with outbox items
    if (filePath.contains(KernelConstants.MESSAGES + "/"
        + KernelConstants.OUTBOX)) {
      if (DEBUG) {
        log.debug("Handling outbox message [" + filePath + "]");
      }
      try {
        // get the node, call up the appropriate handler and pass off based on
        // message type
        Node n = jcrNodeFactory.getNode(filePath);
        Property msgTypeProp = n.getProperty(JCRConstants.JCR_MESSAGE_TYPE);
        String msgType = msgTypeProp.getString();
        MessageHandler handler = registry.getMap().get(msgType);
        if (handler != null) {
          if (DEBUG) {
            log.debug("Handling with " + msgType + ": " + handler);
          }
          handler.handle(userID, filePath, fileName, n);
        } else {
          log.warn("No handler found for message type [" + msgType + "]");
        }
      } catch (JCRNodeFactoryServiceException e) {
        log.error(e.getMessage(), e);
      } catch (RepositoryException e) {
        log.error(e.getMessage(), e);
      }
    }
  }
}
