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

package org.sakaiproject.kernel.authz;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.authz.AccessControlStatement;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.authz.ReferencedObject;
import org.sakaiproject.kernel.api.authz.SubjectStatement;
import org.sakaiproject.kernel.api.authz.SubjectStatement.SubjectType;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.authz.simple.JcrAccessControlStatementImpl;
import org.sakaiproject.kernel.authz.simple.JcrSubjectStatement;
import org.sakaiproject.kernel.model.AclIndexBean;
import org.sakaiproject.kernel.test.KernelIntegrationBase;
import org.sakaiproject.kernel.util.PathUtils;

import java.util.List;

import javax.jcr.Node;
import javax.persistence.EntityManager;
import javax.persistence.Query;

/**
 *
 */
public class AclListenerT {

  private static Kernel kernel;
  private static JCRNodeFactoryService jcrService;
  private static EntityManager entityManager;
  private static ReferenceResolverService referenceResolverService;
  private static final String TEST_FILE = "testFile.txt";

  private static boolean shutdown;

  @BeforeClass
  public static void beforeMyClass() throws ComponentActivatorException {
    shutdown = KernelIntegrationBase.beforeClass();

    KernelManager manager = new KernelManager();
    kernel = manager.getKernel();

    jcrService = kernel.getService(JCRNodeFactoryService.class);
    entityManager = kernel.getService(EntityManager.class);
    referenceResolverService = kernel
        .getService(ReferenceResolverService.class);
  }

  @AfterClass
  public static void afterMyClass() {
    KernelIntegrationBase.afterClass(shutdown);
  }

  @Test
  // Placeholder for passing massive test runs until createAcl is not ignored
  public void doNothing() {

  }

  @Ignore
  // ignoring until synchronous index updates are possible
  public void createAcl() throws Exception {
    String path = PathUtils.getUserPrefix("testUser1") + TEST_FILE;
    Node node = jcrService.createFile(path, RestProvider.CONTENT_TYPE);
    node.getSession().save();

    Query query = entityManager
        .createNamedQuery(AclIndexBean.Queries.FINDBY_PATH);
    query.setParameter(AclIndexBean.QueryParams.FINDBY_PATH_PATH, path);
    List<?> results = query.getResultList();
    assertTrue(results.size() == 0);

    ReferencedObject ro = referenceResolverService.resolve(path);
    ReferencedObject parent = ro.getParent();
    parent = parent.getParent();

    SubjectStatement subjectStatement = new JcrSubjectStatement(
        SubjectType.GR, "group1:maintain", "read");
    AccessControlStatement grantReadToHttpGetInheritable = new JcrAccessControlStatementImpl(
        subjectStatement, "httpget", true, true);
    parent.addAccessControlStatement(grantReadToHttpGetInheritable);

    results = query.getResultList();

    assertEquals(1, results.size());
  }
}
