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

package org.sakaiproject.kernel.user;

import com.google.inject.Inject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserProvisionAgent;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.util.ISO9075;
import org.sakaiproject.kernel.util.JcrUtils;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.query.Query;

public class InboxAgent implements UserProvisionAgent {

  Log log = LogFactory.getLog(InboxAgent.class);

  private static final String KEY = "InboxAgent";
  private static final int PRIORITY = 0;

  // FIXME Get these strings from somewhere instead of hardcoding them
  private static final String INBOX_LABEL = "inbox";
  private static final String INBOX_PATH = "messages/inbox";

  private UserFactoryService userFactoryService = null;
  private JCRNodeFactoryService nodeFactory = null;

  @Inject
  public InboxAgent(RegistryService registryService,
      UserFactoryService userFactoryService, JCRNodeFactoryService nodeFactory) {
    this.userFactoryService = userFactoryService;
    this.nodeFactory = nodeFactory;
    Registry<String, UserProvisionAgent> registry = registryService
        .getRegistry(UserProvisionAgent.REGISTRY);
    registry.add(this);
  }

  public void provision(UserEnvironment userEnv) {
    String path = "/" + ISO9075.encodePath(userFactoryService
        .getUserPrivatePath(userEnv.getUser().getUuid())
        + INBOX_PATH);
    String query = "/" + path + "/element(*, " + JCRConstants.NT_FILE + ")[@"
        + JCRConstants.JCR_LABELS + "='" + INBOX_LABEL + "']";
    try {
      Node inbox = nodeFactory.createFolder(path);
      JcrUtils.makeSmartNode(inbox, Query.XPATH, query);
    } catch (JCRNodeFactoryServiceException e) {
      log.error(e);
    } catch (RepositoryException e) {
      log.error(e);
    }
  }

  public String getKey() {
    return KEY;
  }

  public int getPriority() {
    return PRIORITY;
  }

}
