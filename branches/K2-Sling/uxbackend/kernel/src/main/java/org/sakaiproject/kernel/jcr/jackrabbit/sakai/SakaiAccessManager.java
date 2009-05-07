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

package org.sakaiproject.kernel.jcr.jackrabbit.sakai;

import com.google.inject.Inject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.jackrabbit.core.HierarchyManager;
import org.apache.jackrabbit.core.ItemId;
import org.apache.jackrabbit.core.security.AMContext;
import org.apache.jackrabbit.core.security.AccessManager;
import org.apache.jackrabbit.spi.commons.conversion.DefaultNamePathResolver;
import org.apache.jackrabbit.spi.commons.namespace.NamespaceResolver;
import org.sakaiproject.kernel.jcr.api.internal.SakaiUserPrincipal;
import org.sakaiproject.kernel.jcr.jackrabbit.JCRAnonymousPrincipal;
import org.sakaiproject.kernel.jcr.jackrabbit.JCRSystemPrincipal;

import java.security.Principal;
import java.util.Set;

import javax.jcr.AccessDeniedException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.NoSuchWorkspaceException;
import javax.jcr.RepositoryException;
import javax.security.auth.Subject;

/**
 * @author ieb
 */
public class SakaiAccessManager implements AccessManager {
  private static final Log LOG = LogFactory.getLog(SakaiAccessManager.class);
  private static final boolean debug = LOG.isDebugEnabled();

  private Subject subject;

  @SuppressWarnings("unused")
  private HierarchyManager hierMgr;

  protected boolean anonymous = false;

  private boolean initialized = false;

  protected boolean sakaisystem = false;

  private NamespaceResolver resolver;

  protected String sakaiUserId = ""; // a blank userId is the anon user

  @SuppressWarnings("unused")
  private DefaultNamePathResolver pathResolver;

  @Inject
  public SakaiAccessManager() {
  }

  /*
   * (non-Javadoc)
   *
   * @see
   * org.apache.jackrabbit.core.security.AccessManager#init(org.apache.jackrabbit
   * .core.security.AMContext)
   */
  @edu.umd.cs.findbugs.annotations.SuppressWarnings(value={"BC_VACUOUS_INSTANCEOF"},justification="The type safety in only at compile time.")
  public void init(AMContext context) throws AccessDeniedException, Exception {
    if (initialized) {
      throw new IllegalStateException("already initialized");
    }

    subject = context.getSubject();
    hierMgr = context.getHierarchyManager();
    resolver = context.getNamespaceResolver();
    pathResolver = new DefaultNamePathResolver(resolver, true);


    anonymous = !subject.getPrincipals(JCRAnonymousPrincipal.class).isEmpty();
    if (!anonymous) {
      sakaisystem = !subject.getPrincipals(JCRSystemPrincipal.class).isEmpty();

      Set<SakaiUserPrincipal> principals = subject.getPrincipals(SakaiUserPrincipal.class);
      if (principals.size() == 0) {
        if (debug) {
          LOG.debug("No SakaiUserPrincipal found for context: " + context);
        }
      } else {
        for (Principal p :principals ) {
          if (p instanceof SakaiUserPrincipal) {
            SakaiUserPrincipal sp = (SakaiUserPrincipal) p;
            sakaiUserId = sp.getName();
          }
        }
      }
    }

    // we should get hold of the current jcr session by some means,
    // and we might want the Guice injector

    // TODO check permission to access given workspace based on principals
    initialized = true;
  }

  /*
   * (non-Javadoc)
   *
   * @see org.apache.jackrabbit.core.security.AccessManager#close()
   */
  public synchronized void close() throws Exception {
    if (!initialized) {
      throw new IllegalStateException("not initialized");
    }

    initialized = false;

  }

  /*
   * (non-Javadoc)
   *
   * @see
   * org.apache.jackrabbit.core.security.AccessManager#checkPermission(org.apache
   * .jackrabbit.core.ItemId, int)
   */
  public void checkPermission(ItemId item, int permission)
      throws AccessDeniedException, ItemNotFoundException, RepositoryException {
    if ( !isGranted(item, permission)) {
      throw new AccessDeniedException("Permission deined to "+actionToString(permission)+"on"+item);
    }
  }

  /**
   * @param permission
   * @return
   */
  private String actionToString(int permission) {
    StringBuilder sb = new StringBuilder();
    if ( (permission & AccessManager.READ) == AccessManager.READ ) {
      sb.append("read ");
    }
    if ( (permission & AccessManager.REMOVE) == AccessManager.REMOVE ) {
      sb.append("remove ");
    }
    if ( (permission & AccessManager.WRITE) == AccessManager.WRITE ) {
      sb.append("write ");
    }
    return sb.toString();
  }

  /*
   * (non-Javadoc)
   *
   * @see
   * org.apache.jackrabbit.core.security.AccessManager#isGranted(org.apache.
   * jackrabbit.core.ItemId, int)
   */
  public boolean isGranted(ItemId item, int permission)
      throws ItemNotFoundException, RepositoryException {
    return ((getPermissions(item) & permission) == permission);
  }

  /**
   * @param item
   * @return
   */
  private int getPermissions(ItemId item) {
    // this should create a permission set for the user and the resource, that may be
    // cached. For the moment we will just return full access.
    return AccessManager.READ | AccessManager.REMOVE | AccessManager.WRITE;
  }

  /*
   * (non-Javadoc)
   *
   * @see
   * org.apache.jackrabbit.core.security.AccessManager#canAccess(java.lang.String
   * )
   */
  public boolean canAccess(String workspace) throws NoSuchWorkspaceException,
      RepositoryException {
    // TODO look up the workspace in
    return true;
  }

}
