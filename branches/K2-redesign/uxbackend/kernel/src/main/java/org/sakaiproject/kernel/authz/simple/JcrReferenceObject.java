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

import org.sakaiproject.kernel.api.UpdateFailedException;
import org.sakaiproject.kernel.api.authz.AccessControlStatement;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.ReferencedObject;
import org.sakaiproject.kernel.api.jcr.JCRConstants;

import java.util.ArrayList;
import java.util.List;

import javax.jcr.AccessDeniedException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.Node;
import javax.jcr.PathNotFoundException;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.Value;

/**
 *
 */
public class JcrReferenceObject implements ReferencedObject {

  private List<AccessControlStatement> acl;
  private List<AccessControlStatement> inheritableAcl;
  private String path;
  private boolean rootReference = false;
  private JcrReferenceObject parentReference;
  private Node node;
  private String owner;
  private AuthzResolverService authzResolverService;

  /**
   * @param n
   * @throws RepositoryException
   */
  public JcrReferenceObject(Node node, AuthzResolverService authzResolverService)
      throws RepositoryException {
    this.node = node;
    this.authzResolverService = authzResolverService;
    path = node.getPath();
    acl = new ArrayList<AccessControlStatement>();
    inheritableAcl = new ArrayList<AccessControlStatement>();
    try {
      Property property = node.getProperty(JCRConstants.ACL_ACL);
      for (Value aclSpec : property.getValues()) {
        AccessControlStatement acs = new JcrAccessControlStatementImpl(aclSpec
            .getString());
        if (acs.isPropagating()) {
          inheritableAcl.add(acs);
        }
        acl.add(acs);
      }
    } catch (PathNotFoundException pnfe) {

      // no acl on this node
    } catch (Exception ex) {
      ex.printStackTrace();
    }

    Node ownerNode = node;
    Node rootNode = node.getSession().getRootNode();
    while (owner == null) {
      try {
        Property property = ownerNode.getProperty(JCRConstants.ACL_OWNER);
        owner = property.getString();
        break;
      } catch (PathNotFoundException pnfe) {
      } catch (Exception ex) {
        ex.printStackTrace();
      }
      if ( rootNode.equals(ownerNode) ) {
        break;
      }
      ownerNode = ownerNode.getParent();
      if ( ownerNode == null  || rootNode.equals(ownerNode) ) {
        break;
      }
    }

    Node parent = null;
    try {
      parent = node.getParent();
    } catch (ItemNotFoundException e) {
      parent = null;
    } catch (AccessDeniedException e) {
      e.printStackTrace();
    } catch (RepositoryException e) {
      e.printStackTrace();
    }
    if (parent != null) {
      parentReference = new JcrReferenceObject(parent, authzResolverService);
      if (parentReference.getInheritableAccessControlList().size() == 0) {
        rootReference = true;
      }
    } else {
      rootReference = true;
    }

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#getAccessControlList()
   */
  public List<AccessControlStatement> getAccessControlList() {
    return acl;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#getInheritableAccessControlList()
   */
  public List<AccessControlStatement> getInheritableAccessControlList() {
    return inheritableAcl;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#getKey()
   */
  public String getKey() {
    return path;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#getParent()
   */
  public ReferencedObject getParent() {
    return parentReference;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#isRoot()
   */
  public boolean isRoot() {
    // see of this is a root, which means that all parent objects are also root,
    // this will recurse up the tree.
    boolean rootRef = rootReference
        && (parentReference == null || parentReference.isRoot());
    return rootRef;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#addAccessControlStatement(org.sakaiproject.kernel.api.authz.AccessControlStatement)
   */
  public void addAccessControlStatement(AccessControlStatement newAcs)
      throws UpdateFailedException {
    try {
      for (AccessControlStatement acs : acl) {
        if (newAcs.equals(acs)) {
          return;
        }
      }
      String[] values = new String[acl.size() + 1];
      int i = 0;
      for (AccessControlStatement acs : acl) {
        values[i++] = acs.toString();
      }
      values[i] = newAcs.toString();
      node.setProperty(JCRConstants.ACL_ACL, values);

      acl.add(newAcs);
      if (newAcs.isPropagating()) {
        inheritableAcl.add(newAcs);
      }

      authzResolverService.invalidateAcl(this);
    } catch (NumberFormatException e) {
      throw new UpdateFailedException("Unable to update ACL in node " + path + " :"
          + e.getMessage());
    } catch (RepositoryException e) {
      throw new UpdateFailedException("Unable to update ACL in node " + path + " :"
          + e.getMessage());
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#removeAccessControlStatement(org.sakaiproject.kernel.api.authz.AccessControlStatement)
   */
  // TODO test coverage required.
  public void removeAccessControlStatement(AccessControlStatement removeAcs)
      throws UpdateFailedException {
    try {
      List<AccessControlStatement> toRemove = new ArrayList<AccessControlStatement>();
      List<String> newValues = new ArrayList<String>();
      for (AccessControlStatement acs : acl) {
        if (removeAcs.equals(acs)) {
          toRemove.add(acs);
        } else {
          newValues.add(acs.toString());
        }
      }
      String[] values = newValues.toArray(new String[0]);
      node.setProperty(JCRConstants.ACL_ACL, values);

      acl.removeAll(toRemove);
      inheritableAcl.removeAll(toRemove);

      authzResolverService.invalidateAcl(this);

    } catch (RepositoryException e) {
      throw new UpdateFailedException("Unable to update ACL in node " + path + " :"
          + e.getMessage());
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#setAccessControlList(java.util.List)
   */
  public void setAccessControlList(List<AccessControlStatement> newAcl) {
    try {
      String[] values = new String[newAcl.size()];
      int i = 0;
      for (AccessControlStatement acs : newAcl) {
        values[i++] = acs.toString();
      }
      node.setProperty(JCRConstants.ACL_ACL, values);

      acl = Lists.newArrayList(newAcl);
      inheritableAcl = Lists.newArrayList();
      for (AccessControlStatement acs : acl) {
        if (acs.isPropagating()) {
          inheritableAcl.add(acs);
        }
      }
      authzResolverService.invalidateAcl(this);

    } catch (RepositoryException e) {
      throw new UpdateFailedException("Unable to update ACL in node " + path + " :"
          + e.getMessage());
    }

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#getOwner()
   */
  public String getOwner() {
    return owner;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.ReferencedObject#isPermanent()
   */
  public boolean isPermanent() {
    return true;
  }
}
