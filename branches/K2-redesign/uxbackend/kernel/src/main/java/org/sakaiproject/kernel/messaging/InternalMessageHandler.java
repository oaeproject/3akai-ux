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

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.locking.LockTimeoutException;
import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessageHandler;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.util.JcrUtils;

import java.io.InputStream;

import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.Workspace;

public class InternalMessageHandler implements MessageHandler {

  private static final Log log = LogFactory
      .getLog(InternalMessageHandler.class);
  private static final boolean DEBUG = log.isDebugEnabled();
  private static final String key = Message.Type.INTERNAL.toString();
  private static final int priority = 0;

  private final JCRService jcr;
  private final UserFactoryService userFactory;
  private final JCRNodeFactoryService nodeFactory;

  @Inject
  public InternalMessageHandler(RegistryService registryService,
      JCRService jcr, UserFactoryService userFactory,
      JCRNodeFactoryService nodeFactory) {
    Registry<String, MessageHandler> registry = registryService
        .getRegistry(MessageHandler.REGISTRY);
    registry.add(this);
    this.jcr = jcr;
    this.userFactory = userFactory;
    this.nodeFactory = nodeFactory;
  }

  public void handle(String userID, String filePath, String fileName, Node node) {
    try {
      Property prop = node.getProperty(JCRConstants.JCR_MESSAGE_RCPTS);
      String rcptsVal = prop.getString();
      String[] rcpts = StringUtils.split(rcptsVal, ",");

      if (rcpts != null) {
        for (String rcpt : rcpts) {
          /** set message path for the user. */
          String msgPath = userFactory.getNewMessagePath(rcpt) + "/" + fileName;
          if (DEBUG) {
            log.debug("Writing " + filePath + " to " + msgPath);
          }
          InputStream in = nodeFactory.getInputStream(filePath);
          Node n = nodeFactory.setInputStream(msgPath, in, "UTF-8");
          JcrUtils.addNodeLabel(jcr, n, "inbox");
          /** TODO remove any properties that are associated to the sender */
        }
      }
      // move the original node to the common message store for the sender and
      // label it as "sent"
      // create the parent if it doesn't exist.
      Property fromProp = node.getProperty(JCRConstants.JCR_MESSAGE_FROM);
      String from = fromProp.getString();
      String sentPath = userFactory.getNewMessagePath(from);
      Node targetNode = null;
      try {
        targetNode = nodeFactory.getNode(sentPath);
      } catch (JCRNodeFactoryServiceException e) {
        // will handle null node after this
      } catch (RepositoryException e) {
        // will handle null node after this
      }
      if (targetNode == null) {
        targetNode = nodeFactory.createFolder(sentPath);
        // the node *must* be saved to make it available to the move.
        // call to the parent-parent so that "messages" is used as the saving
        // node rather than the parent (year) as it may not exist yet.
        targetNode.getParent().getParent().save();
      }
      String sentMsgPath = sentPath + "/" + fileName;
      if (DEBUG) {
        log.debug("Moving message " + filePath + " to " + sentMsgPath);
      }
      Workspace workspace = jcr.getSession().getWorkspace();
      workspace.move(filePath, sentMsgPath);
      JcrUtils.addNodeLabel(jcr, nodeFactory.getNode(sentMsgPath), "sent");
      jcr.save();
    } catch (RepositoryException e) {
      log.error(e.getMessage(), e);
    } catch (JCRNodeFactoryServiceException e) {
      log.error(e.getMessage(), e);
    } catch (LockTimeoutException e) {
      log.error(e.getMessage(), e);
    }
  }

  public String getKey() {
    return key;
  }

  public int getPriority() {
    return priority;
  }

}
