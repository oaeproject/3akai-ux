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
import com.google.inject.Singleton;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.jackrabbit.core.nodetype.NodeTypeManagerImpl;
import org.sakaiproject.kernel.api.jcr.JCRRegistrationService;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.SakaiJCRCredentials;

import java.io.InputStream;

import javax.jcr.LoginException;
import javax.jcr.NamespaceException;
import javax.jcr.NamespaceRegistry;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.Workspace;

/**
 */
@Singleton
public class JCRRegistrationServiceImpl implements JCRRegistrationService {

  private static final Log LOG = LogFactory
      .getLog(JCRRegistrationServiceImpl.class);

  private RepositoryBuilder repositoryBuilder;

  /**
   *
   */
  @Inject
  public JCRRegistrationServiceImpl(RepositoryBuilder repositoryBuilder) {
    this.repositoryBuilder = repositoryBuilder;
  }

  public void registerNamespace(String prefix, String uri) {
    Session s = null;
    SakaiJCRCredentials system = new SakaiJCRCredentials();
    Repository repository = repositoryBuilder.getInstance();
    try {
      s = repository.login(system);
    } catch (LoginException e) {
      throw new SecurityException("Failed to login to Sakai repository", e);
    } catch (RepositoryException e) {
      throw new RuntimeException("Failed to login to Sakai repository", e);
    }

    Workspace w = s.getWorkspace();
    NamespaceRegistry reg;
    try {
      reg = w.getNamespaceRegistry();
    } catch (RepositoryException e) {
      throw new RuntimeException(
          "Failed to get workspace namespace registry for workspace: "
              + w.getName(), e);
    }

    try {
      reg.getPrefix(uri);
      // if we get to this point the namespace already exists
    } catch (NamespaceException e) {
      try {
        reg.registerNamespace(prefix, uri);
      } catch (RepositoryException ex) {
        throw new RuntimeException(
            "Failed to register additional namespace prefix (" + prefix
                + ") with uri (" + uri + ") in workspace: " + w.getName(), ex);
      }
    } catch (RepositoryException ex) {
      throw new RuntimeException("Failed to lookup namespace prefix (" + prefix
          + ") with uri (" + uri + ") in workspace: " + w.getName(), ex);
    } finally {
      try {
        s.logout();
      } finally {
      }
    }

  }

  public void registerNodetypes(InputStream xml) {
    Session s = null;
    try {
      SakaiJCRCredentials system = new SakaiJCRCredentials();
      Repository repository = repositoryBuilder.getInstance();
      s = repository.login(system);
      Workspace w = s.getWorkspace();
      NodeTypeManagerImpl ntm = (NodeTypeManagerImpl) w.getNodeTypeManager();
      ntm.registerNodeTypes(xml, "text/xml");
    } catch (Exception e) {
      LOG.info("Error Registering Additional JCR NameSpaces/Nodetypes "
          + e.getMessage());
    } finally {
      try {
        s.logout();
      } finally {
      }
    }

  }

}
