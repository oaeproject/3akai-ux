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

import com.google.inject.Inject;

import org.sakaiproject.kernel.api.authz.AccessControlStatement;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.authz.ReferencedObject;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;

import javax.jcr.Node;
import javax.jcr.RepositoryException;

/**
 * This SimpleReferenceResolverService converts References into jCRNodes.
 */
public class JcrReferenceResolverService implements ReferenceResolverService{



  private JCRNodeFactoryService jcrNodeFactoryService;
  private AuthzResolverService authzResolverService;
  /**
   *
   */
  @Inject
  public JcrReferenceResolverService(JCRNodeFactoryService jcrNodeFactoryService, AuthzResolverService authzResolverService) {
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.authzResolverService = authzResolverService;
  }
  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.ReferenceResolverService#resolve(java.lang.String)
   */
  public ReferencedObject resolve(String resourceReference) {
    try {
      Node n = jcrNodeFactoryService.getNode(resourceReference);
      if ( n == null ) {
        return new EmptyReferenceObject(resourceReference,null,this);
      }
      return new JcrReferenceObject(n, authzResolverService);
    } catch (RepositoryException e) {
      return new EmptyReferenceObject(resourceReference,e,this);
    } catch (JCRNodeFactoryServiceException e) {
      return new EmptyReferenceObject(resourceReference,e,this);
    }
  }
  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.authz.ReferenceResolverService#newAccessControlStatement(java.lang.String)
   */
  public AccessControlStatement newAccessControlStatement(String acs) {
     return new JcrAccessControlStatementImpl(acs);
  }

}
