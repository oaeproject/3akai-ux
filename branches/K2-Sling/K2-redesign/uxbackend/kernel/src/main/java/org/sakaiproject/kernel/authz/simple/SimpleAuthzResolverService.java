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
package org.sakaiproject.kernel.authz.simple;

import com.google.common.collect.Lists;
import com.google.inject.Inject;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.authz.AccessControlStatement;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionDeniedException;
import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.kernel.api.authz.QueryStatement;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.authz.ReferencedObject;
import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 *
 */
public class SimpleAuthzResolverService implements AuthzResolverService {

  private static final Log LOG = LogFactory
      .getLog(SimpleAuthzResolverService.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private SessionManagerService sessionManager;
  private ReferenceResolverService referenceResolverService;
  private UserEnvironmentResolverService userEnvironmentResolverService;
  private Cache<Map<String, List<AccessControlStatement>>> cachedAcl;
  private CacheManagerService cacheManagerService;

  private long secureKey = System.currentTimeMillis();

  /**
   *
   */
  @Inject
  public SimpleAuthzResolverService(SessionManagerService sessionManager,
      ReferenceResolverService referenceResolverService,
      UserEnvironmentResolverService userEnvironmentResolverService,
      CacheManagerService cacheManagerService) {
    this.sessionManager = sessionManager;
    this.referenceResolverService = referenceResolverService;
    this.userEnvironmentResolverService = userEnvironmentResolverService;
    this.cachedAcl = cacheManagerService.getCache("acl_cache",
        CacheScope.CLUSTERINVALIDATED);
    this.cacheManagerService = cacheManagerService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.AuthzResolverService#check(java.lang.String,
   *      org.sakaiproject.kernel.api.authz.PermissionQuery)
   */
  @SuppressWarnings(value = { "WMI_WRONG_MAP_ITERATOR" }, justification = " Invalid, the acl get is not from an Entry set")
  public void check(String resourceReference, PermissionQuery permissionQuery)
      throws PermissionDeniedException {

    String requestGrant = getRequestGrant();

    if (requestGrant != null) {
      LOG.warn("Bypassed Security " + requestGrant);
      return;
    }

    Cache<Object> grants = cacheManagerService.getCache("authz",
        CacheScope.REQUEST);

    // check the local cache
    String permissionQueryToken = permissionQuery
        .getQueryToken(resourceReference);

    if (grants.containsKey(permissionQueryToken)) {
      if ((Boolean) grants.get(permissionQueryToken)) {
        return;
      } else {
        throw new PermissionDeniedException("No grant found on "
            + resourceReference + " by " + permissionQuery
            + " (request cached) ");

      }
    }

    String userId = sessionManager.getCurrentUserId();

    UserEnvironment userEnvironment = userEnvironmentResolverService
        .resolve(userId);
    if (userEnvironment.isSuperUser()) {
      if (debug) {
        LOG.debug("SECURITY: SuperUser permission granted on:"
            + permissionQueryToken);
      }
      return;
    }
    ReferencedObject referencedObject = referenceResolverService
        .resolve(resourceReference);
    /*
     * build a hash of permission lists keyed by access control key, the access
     * control is populates in the permission list so that the access control
     * statements from higher up the tree are appended to the list. This means
     * that access control statements are order in closeness to the node, so
     * that close access control statements have more influence over the
     * security check
     */

    /*
     * Check that the ACL isn't in the cache
     */
    Map<String, List<AccessControlStatement>> acl = cachedAcl
        .get(referencedObject.getKey());
    if (acl == null) {
      // not in the cache create, and populate
      acl = new HashMap<String, List<AccessControlStatement>>();

      Map<String, List<AccessControlStatement>> aclFromCache = populateKeys(
          referencedObject, acl);
      if (aclFromCache != null) {
        acl = aclFromCache;
      } else {
        ReferencedObject controllingObject = populateAcl(referencedObject, acl);

        if (controllingObject != null) {
          cachedAcl.put(controllingObject.getKey(), acl);
        }
      }
    }

    if (debug) {
      if (acl.size() == 0) {
        LOG.debug("WARNING ------------------Empty ACL");
      } else {
        for (String k : acl.keySet()) {
          LOG.debug("Loaded ACL for " + k);
        }
      }
    }

    // now we have the acl derived, we can now go through the permissionQuery,
    // extract the query statements to
    // see if any are satisfied or denied in order.

    for (QueryStatement qs : permissionQuery.statements()) {

      List<AccessControlStatement> kacl = acl.get(qs.getStatementKey());
      if (kacl == null || kacl.size() == 0) {
        kacl = acl.get("*");
      }
      if (kacl != null) {
        for (AccessControlStatement ac : kacl) {
          if (userEnvironment.matches(referencedObject, ac.getSubject())) {
            if (ac.isGranted()) {
              if (debug) {
                LOG.debug("Granted Permission for user "
                    + userEnvironment.getUser().getUuid() + " on " + ac);
              }
              // cache the response in the request scope cache.
              grants.put(permissionQueryToken, true);
              return;
            } else {
              // cache the response in the request scope cache.
              grants.put(permissionQueryToken, false);
              if (debug) {
                LOG.debug("Denied Permission " + ac);
              }
              throw new PermissionDeniedException(
                  "Permission Explicitly deinied on " + resourceReference
                      + " by " + ac + " for " + qs + " user environment "
                      + userEnvironment);
            }
          }
        }
      }
    }

    // cache the response in the request scope cache.
    grants.put(permissionQueryToken, false);
    throw new PermissionDeniedException("No grant found on "
        + resourceReference + " by " + permissionQuery + " for "
        + userEnvironment);
  }

  /**
   *
   */
  private ReferencedObject populateAcl(ReferencedObject referencedObject,
      Map<String, List<AccessControlStatement>> acl) {
    /*
     * the controlling object is the first object looking back up the tree that
     * has an ACL statement.
     */
    ReferencedObject controllingObject = null;
    List<AccessControlStatement> aclList = referencedObject
        .getAccessControlList();
    if (aclList.size() > 0) {
      for (AccessControlStatement ac : referencedObject.getAccessControlList()) {
        // if there was an acl this marks the position back up the hierarchy
        // that is the first node with acl statements.
        if (controllingObject == null) {
          controllingObject = referencedObject;
        }
        addAcs(acl, ac.getStatementKey(), ac);
        // populate the permissions into the map, appending to lists,
        // each key represents an access control item, the list contains
        // varieties of acl to be consulted
      }
    }

    ReferencedObject parent = referencedObject.getParent();

    while (parent != null) {
      Map<String, List<AccessControlStatement>> parentAcl = cachedAcl
          .get(parent.getKey());
      if (parentAcl != null) {
        // copy the acl, appending found statements to the end of the current
        // node
        if (acl.size() > 0) {
          for (Entry<String, List<AccessControlStatement>> e : parentAcl
              .entrySet()) {
            addAcs(acl, e.getKey(), e.getValue());
          }
        } else {
          throw new IllegalStateException("If a cached parent ACL was going "
              + "to be used, it should have been detected earlier when "
              + "prepopulating with keys, theoretically this exception "
              + "should never be thrown.");
        }
        break;
      } else {

        List<AccessControlStatement> pAcl = parent.getAccessControlList();
        if (pAcl.size() > 0) {
          // nothing in the cache, sop
          for (AccessControlStatement ac : pAcl) {
            if (ac.isPropagating()) {
              // the ac is propagaing meaning it will propagate to child
              // nodes.
              if (controllingObject == null) {
                controllingObject = parent;
              }
              addAcs(acl, ac.getStatementKey(), ac);
            }
          }
        }
        // if this was the root element, stop resolution
        if (parent.isRoot()) {
          break;
        }
        parent = parent.getParent();
      }
    }
    return controllingObject;
  }

  /**
   * Add an acl fragment to the acl, assumes that the list at the key exists.
   *
   * @param acl
   *          the acl
   * @param key
   *          the key to add, if * will be added to all keys
   * @param aclFragment
   *          the acl fragment
   */
  private void addAcs(Map<String, List<AccessControlStatement>> acl,
      String key, List<AccessControlStatement> aclFragment) {
    if ("*".equals(key)) {
      for (List<AccessControlStatement> a : acl.values()) {
        a.addAll(aclFragment);
      }
    } else {
      acl.get(key).addAll(aclFragment);
    }
  }

  /**
   * Add a single acl to the acl
   *
   * @param acl
   * @param statementKey
   * @param ac
   */
  private void addAcs(Map<String, List<AccessControlStatement>> acl,
      String key, AccessControlStatement ac) {
    if ("*".equals(key)) {
      for (List<AccessControlStatement> a : acl.values()) {
        a.add(ac);
      }
    } else {
      acl.get(key).add(ac);
    }
  }

  /**
   * Populates the ACL with keys, but if it finds a parent ACL that has no
   * additions then it returns that. If there are additions it adds the keys
   * from the parent and returns.
   *
   * @param referencedObject
   *          the starting object
   * @param acl
   *          the acl to be populated with keys.
   * @return an ACL if there is a complete one suitable for use, otherwise null.
   */
  private Map<String, List<AccessControlStatement>> populateKeys(
      ReferencedObject referencedObject,
      Map<String, List<AccessControlStatement>> acl) {
    // first populate the acl with keys.
    List<AccessControlStatement> aclList = referencedObject
        .getAccessControlList();
    if (aclList.size() > 0) {
      for (AccessControlStatement ac : referencedObject.getAccessControlList()) {
        String key = ac.getStatementKey();
        if (!acl.containsKey(key)) {
          List<AccessControlStatement> plist = new ArrayList<AccessControlStatement>();
          acl.put(key, plist);
        }
      }
    }

    ReferencedObject parent = referencedObject.getParent();

    while (parent != null) {
      Map<String, List<AccessControlStatement>> parentAcl = cachedAcl
          .get(parent.getKey());
      if (parentAcl != null) {
        // copy the acl, appending found statements to the end of the current
        // node
        if (acl.size() > 0) {
          for (Entry<String, List<AccessControlStatement>> e : parentAcl
              .entrySet()) {
            if (!acl.containsKey(e.getKey())) {
              List<AccessControlStatement> plist = new ArrayList<AccessControlStatement>();
              acl.put(e.getKey(), plist);
            }
          }
          // no more keys required here
          return null;
        } else {
          // the acl was empty so we can just use this one.
          return parentAcl;
        }
      } else {

        List<AccessControlStatement> pAcl = parent.getAccessControlList();
        if (pAcl.size() > 0) {
          // nothing in the cache, sop
          for (AccessControlStatement ac : pAcl) {
            if (ac.isPropagating()) {
              String key = ac.getStatementKey();
              if (!acl.containsKey(key)) {
                List<AccessControlStatement> plist = new ArrayList<AccessControlStatement>();
                acl.put(key, plist);
              }
            }
          }
        }
        // if this was the root element, stop resolution
        if (parent.isRoot()) {
          break;
        }
        parent = parent.getParent();
      }
    }
    return null;
  }

  @java.lang.SuppressWarnings("unchecked")
  public void setRequestGrant(String reason) {
    Cache<Object> grants = cacheManagerService.getCache("authz",
        CacheScope.REQUEST);
    List<String> grantStack = (List<String>) grants.get("request-granted"
        + secureKey);
    if (grantStack == null) {
      grantStack = Lists.newArrayList();
      grants.put("request-granted" + secureKey, grantStack);
    }
    grantStack.add(reason);
    LOG.warn("Request Fully Granted :" + reason);
  }

  @java.lang.SuppressWarnings("unchecked")
  public void clearRequestGrant() {
    Cache<Object> grants = cacheManagerService.getCache("authz",
        CacheScope.REQUEST);
    List<String> grantStack = (List<String>) grants.get("request-granted"
        + secureKey);
    if (grantStack == null) {
      grantStack = Lists.newArrayList();
      grants.put("request-granted" + secureKey, grantStack);
    }
    if (grantStack.size() > 0) {
      grantStack.remove(grantStack.size() - 1);
    }
    LOG.warn("Request Granted Removed ");
  }

  public void invalidateAcl(ReferencedObject referencedObject) {
    cachedAcl.removeChildren(referencedObject.getKey());
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.AuthzResolverService#hasRequestGrant()
   */
  @java.lang.SuppressWarnings("unchecked")
  public String getRequestGrant() {
    Cache<Object> grants = cacheManagerService.getCache("authz",
        CacheScope.REQUEST);
    List<String> grantStack = (List<String>) grants.get("request-granted"
        + secureKey);

    if (grantStack != null && grantStack.size() > 0) {
      return grantStack.get(grantStack.size() - 1);
    }
    return null;
  }
}
