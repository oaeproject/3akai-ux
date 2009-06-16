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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.inject.Inject;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.UpdateFailedException;
import org.sakaiproject.kernel.api.authz.AccessControlStatement;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.authz.ReferencedObject;
import org.sakaiproject.kernel.authz.simple.JcrAccessControlStatementImpl;
import org.sakaiproject.kernel.jcr.api.internal.RepositoryStartupException;
import org.sakaiproject.kernel.jcr.api.internal.StartupAction;
import org.sakaiproject.kernel.util.PropertiesLoader;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Map.Entry;

import javax.jcr.Session;

/**
 *
 */
public class PopulateBaseRepositoryAcls implements StartupAction {

  private static final String ACLS_TO_LOAD = "res://org/sakaiproject/kernel/jcr/jackrabbit/populate_repository_acl.properties";
  private static final Log LOG = LogFactory.getLog(PopulateBaseRepositoryAcls.class);
  private ReferenceResolverService referenceResolverService;

  /**
   *
   */
  @Inject
  public PopulateBaseRepositoryAcls(
      ReferenceResolverService referenceResolverService) {
    this.referenceResolverService = referenceResolverService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.jcr.api.internal.StartupAction#startup(javax.jcr.Session)
   */
  public void startup(Session s) throws RepositoryStartupException {
    try {
      Map<String, List<AccessControlStatement>> aclLists = Maps.newHashMap();

      Properties p = PropertiesLoader.load(this.getClass().getClassLoader(),
          ACLS_TO_LOAD);
      for (Entry<Object, Object> e : p.entrySet()) {
        String[] acl = StringUtils.split(String.valueOf(e.getKey()), ',');
        int pos = -1;
        List<AccessControlStatement> aclList = new ArrayList<AccessControlStatement>();
        if (acl != null && acl.length > 1) {
          aclList = aclLists.get(acl[1]);
          if (aclList == null) {
            aclList = Lists.newArrayList();
            aclLists.put(acl[1], aclList);
          }
          pos = Integer.parseInt(acl[0]);
        }
        while (pos >= 0 && aclList.size() <= pos) {
          aclList.add(null);
        }
        aclList.set(pos, new JcrAccessControlStatementImpl(String.valueOf(e
            .getValue())));
      }

      for (Entry<String, List<AccessControlStatement>> aclList : aclLists
          .entrySet()) {
        String path = aclList.getKey();
        listAcl(path,aclList.getValue());
        ReferencedObject ro = referenceResolverService.resolve(path);
        if (ro.isPermanent()) {
          List<AccessControlStatement> existingAcsList = ro
              .getAccessControlList();
          if (existingAcsList.size() == 0) {
            ro.setAccessControlList(aclList.getValue());
          }
        } else {
          throw new RepositoryStartupException(
              "Cant create ACL's on nodes that dont exist "+path);
        }

      }
    } catch (UpdateFailedException e) {
      throw new RepositoryStartupException(e.getMessage(), e);
    } catch (NumberFormatException e) {
      throw new RepositoryStartupException(e.getMessage(), e);
    }
  }

  /**
   * @param path
   * @param value
   */
  private void listAcl(String path, List<AccessControlStatement> acl) {
    for ( AccessControlStatement acs : acl ) {
      LOG.info( "ACL set, Path: " + path + " " + String.valueOf( acs ) );
    }
  }
}
