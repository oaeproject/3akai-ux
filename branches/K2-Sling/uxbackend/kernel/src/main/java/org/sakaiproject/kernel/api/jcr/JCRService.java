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

package org.sakaiproject.kernel.api.jcr;

import org.sakaiproject.kernel.api.locking.Lock;
import org.sakaiproject.kernel.api.locking.LockTimeoutException;

import javax.jcr.LoginException;
import javax.jcr.Node;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.observation.Event;
import javax.jcr.observation.ObservationManager;
import javax.jcr.query.QueryManager;

/**
 * The base JCR Service, containing the methods necessary to interact with a JCR
 * implementation.
 */
public interface JCRService {
  public static final String NT_FOLDER = "nt:folder";

  public static final String NT_FILE = "nt:file";

  public static final String JCR_CONTENT = "jcr:content";

  public static final String JCR_DATA = "jcr:data";

  public static final String NT_ROOT = "rep:root";

  public static final String NT_RESOURCE = "nt:resource";

  public static final String JCR_LASTMODIFIED = "jcr:lastModified";

  public static final String JCR_MIMETYPE = "jcr:mimeType";

  public static final String JCR_ENCODING = "jcr:encoding";

  public static final String MIX_REFERENCEABLE = "mix:referenceable";

  public static final String JCR_UUID = "jcr:uuid";

  public static final String NAME_REQUEST_SCOPE = "requestScope@org.sakaiproject.kernel.api.jcr.JCRService";

  public static final String NAME_CREDENTIALS = "credentials@org.sakaiproject.kernel.api.jcr.JCRService";

  /**
   * Get a session, shout return the same one in the same request scope.
   * @return
   * @throws LoginException
   * @throws RepositoryException
   */
  Session getSession() throws LoginException, RepositoryException;

  /**
   * Login to the JCR and return a session.
   * @return
   * @throws LoginException
   * @throws RepositoryException
   */
  Session login() throws LoginException, RepositoryException;

  /**
   * Logout of the JCR, expire the session and unbind from the current thread.
   * @return
   * @throws LoginException
   * @throws RepositoryException
   */
  void logout() throws LoginException, RepositoryException;

  /**
   * Get the repository.
   * @return
   */
  Repository getRepository();

  /**
   * Set the current thread session and returns the previous one, setting to
   * null will clear the current session.
   *
   * @param session the session replace the current session with.
   * @return
   */
  Session setSession(Session session);

  /**
   * Return true if the node supplied should have the suggested mixin added.
   * This enables repository implementations to ignore certain mixing
   * properties.
   *
   * @param n
   * @param mixin
   * @return
   * @throws RepositoryException
   */
  boolean needsMixin(Node n, String mixin) throws RepositoryException;

  /**
   * Return true of the session is active.
   *
   * @return
   */
  boolean hasActiveSession();

  /**
   * The name of the default JCR workspace.
   *
   * @return
   */
  String getDefaultWorkspace();

  /**
   * Get the ObservationManager from the JCR, this can be used to register
   * events.
   *
   * @return
   */
  ObservationManager getObservationManager();

  /**
   * Login a system user
   * @throws RepositoryException
   * @throws LoginException
   */
  Session loginSystem() throws LoginException, RepositoryException;

  /**
   * Is the event external ie not from this node in cluster.
   * @param event
   * @return true if from another node in the cluster.
   */
  boolean isExternalEvent(Event event);

  /**
   * Perform a Save
   * @throws RepositoryException
   */
  void save() throws RepositoryException;

   /**
   * Get the QueryManager from the JCR, this can be used to search for nodes.
   *
   * @return
   */
  QueryManager getQueryManager() throws RepositoryException;

  /**
   * Locks a node using the <b>Kernel Locking</a> api, returning a lock.
   * The lock is scoped to the request but will auto expire after time or memory pressure.
   * @param node the node to be locked
   * @return the lock bound to this thread
   * @throws RepositoryException
   * @throws LockTimeoutException
   */
  Lock lock(Node node) throws RepositoryException, LockTimeoutException;

  /**
   * clear open locks on the session.
   */
  void clearLocks();

}
