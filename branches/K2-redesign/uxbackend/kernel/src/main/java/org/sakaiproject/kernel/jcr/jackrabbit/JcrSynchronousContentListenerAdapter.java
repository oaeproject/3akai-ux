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
import com.google.inject.name.Named;

import org.apache.jackrabbit.core.observation.SynchronousEventListener;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.jcr.api.JcrContentListener;

import java.util.List;

import javax.jcr.RepositoryException;

/**
 * an adapter for synchronous listeners, that get called before save on a node
 * returns.
 */
public class JcrSynchronousContentListenerAdapter extends
    JcrContentListenerAdapter implements SynchronousEventListener {

  public static final String SYNCHRONOUS_LISTENERS = "sychronous-listeners";

  /**
   * @param listeners
   * @param cacheManager
   * @throws RepositoryException
   */
  @Inject
  public JcrSynchronousContentListenerAdapter(
      @Named(SYNCHRONOUS_LISTENERS) List<JcrContentListener> listeners,
      CacheManagerService cacheManager, JCRService jcrService) throws RepositoryException {
    super(listeners, cacheManager, jcrService);
    unbind = false;
  }



}
