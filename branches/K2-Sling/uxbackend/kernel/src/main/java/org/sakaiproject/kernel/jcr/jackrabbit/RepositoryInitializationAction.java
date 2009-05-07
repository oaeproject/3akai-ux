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
package org.sakaiproject.kernel.jcr.jackrabbit;

import com.google.inject.Inject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.internal.api.InitializationAction;
import org.sakaiproject.kernel.jcr.api.internal.RepositoryStartupException;
import org.sakaiproject.kernel.jcr.api.internal.StartupAction;

import java.util.Iterator;
import java.util.List;

import javax.jcr.Session;

/**
 * A Kernel initalization action to initialize the JCR repository. This class performs
 * initalization by invoking a list of JCR StartupActions. Those actions are injected into
 * the constructor.
 */
public class RepositoryInitializationAction implements InitializationAction {

  private static final Log LOG = LogFactory.getLog(RepositoryInitializationAction.class);
  private List<StartupAction> startupActions;
  private JCRService jcrService;

  /**
   * Create the repository initialization action.
   */
  @Inject
  public RepositoryInitializationAction(JCRService jcrService,
      List<StartupAction> startupActions) {
    this.jcrService = jcrService;
    this.startupActions = startupActions;

  }

  /**
   * {@inheritDoc}
   *
   * @throws RepositoryStartupException
   * @see org.sakaiproject.kernel.internal.api.InitializationAction#init()
   */
  public void init() throws RepositoryStartupException {
    Session s = null;
    try {
      LOG.info("Starting " + startupActions);
      s = jcrService.getSession();
      if (startupActions != null) {
        for (Iterator<StartupAction> i = startupActions.iterator(); i.hasNext();) {
          StartupAction startUpAction = i.next();
          startUpAction.startup(s);
        }
      }
    } catch (Exception e) {
      throw new RepositoryStartupException("Failed to initialization on respository ", e);
    }

  }

}
