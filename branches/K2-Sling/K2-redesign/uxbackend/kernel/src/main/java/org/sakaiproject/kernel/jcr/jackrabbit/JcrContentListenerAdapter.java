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
import org.sakaiproject.kernel.api.jcr.EventRegistration;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.jcr.api.JcrContentListener;

import java.util.Arrays;
import java.util.List;

import javax.jcr.LoginException;
import javax.jcr.RepositoryException;
import javax.jcr.observation.Event;
import javax.jcr.observation.EventIterator;
import javax.jcr.observation.EventListener;
import javax.jcr.observation.ObservationManager;

/**
 *
 */
public class JcrContentListenerAdapter implements EventListener, EventRegistration {

  private static final Log LOG = LogFactory.getLog(JcrContentListenerAdapter.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private static final String DATA_NODE = "/" + JCRConstants.JCR_CONTENT + "/"
      + JCRConstants.JCR_DATA;
  private List<JcrContentListener> listeners;
  private CacheManagerService cacheManager;
  protected boolean unbind = true;
  private JCRService jcrService;

  /**
   * @param listeners
   * @throws RepositoryException
   * 
   */
  @Inject
  public JcrContentListenerAdapter(List<JcrContentListener> listeners,
      CacheManagerService cacheManager, JCRService jcrService) throws RepositoryException {
    this.listeners = listeners;
    this.cacheManager = cacheManager;
    this.jcrService = jcrService;
  }

  /**
   * {@inheritDoc}
   * 
   * @throws RepositoryException
   * 
   * @see org.sakaiproject.kernel.api.jcr.EventRegistration#register(javax.jcr.observation.ObservationManager)
   */
  public void register(ObservationManager observationManager) throws RepositoryException {
    observationManager.addEventListener(this, Event.PROPERTY_ADDED
        | Event.PROPERTY_CHANGED | Event.PROPERTY_REMOVED, "/", true, null, new String[] {
        JCRConstants.NT_RESOURCE, JCRConstants.NT_UNSTRUCTURED}, false);
    LOG.info("Registered " + this.getClass().getName());
  }

  /**
   * {@inheritDoc}
   * 
   * @see javax.jcr.observation.EventListener#onEvent(javax.jcr.observation.EventIterator)
   */
  public void onEvent(EventIterator events) {
    try {
      if (unbind) {
        jcrService.loginSystem();
      }
      if (debug) {
        LOG.debug("Firing event set ");
      }
      for (; events.hasNext();) {
        try {
          Event event = events.nextEvent();
          if (!jcrService.isExternalEvent(event)) {
            // only listen to internal events
            String path = event.getPath();
            if (path.endsWith(DATA_NODE)) {
              String filePath = path.substring(0, path.length() - DATA_NODE.length());
              String fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
              for (JcrContentListener listener : listeners) {
                listener.onEvent(event.getType(), event.getUserID(), filePath, fileName);
              }
            }
            if (debug) {
              LOG.debug("User \"" + event.getUserID() + "\" fired content event \""
                  + event.getType() + "\" at path \"" + path + "\".");
            }
          }
        } catch (Exception rex) {
          LOG.error("Exception firing event.");
          if (debug) {
            LOG.debug("Cause: " + rex.getMessage());
          }
          LOG.trace("Trace: " + Arrays.toString(rex.getStackTrace()));
        }
      }

    } catch (LoginException e) {
      LOG.warn("Cant Login to JCR " + e.getMessage(), e);
    } catch (RepositoryException e) {
      LOG.warn("Cant Login to JCR " + e.getMessage(), e);
    } finally {
      if (unbind) {
        try {
          jcrService.logout();
        } catch (LoginException e) {
          LOG.warn("Cant Logout of JCR " + e.getMessage(), e);
        } catch (RepositoryException e) {
          LOG.warn("Cant Logout of JCR " + e.getMessage(), e);
        }
        try {
          cacheManager.unbind(CacheScope.REQUEST);
        } catch (Exception ex) {
          LOG.warn("Exception unbinding cache manager from request.");
        }
        try {
          cacheManager.unbind(CacheScope.THREAD);
        } catch (Exception ex) {
          LOG.warn("Exception unbinding cache manager from thread.");
        }
      }
    }
  }
}
