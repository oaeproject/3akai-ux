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
package org.sakaiproject.kernel.test;

import org.junit.Test;
import org.sakaiproject.kernel.api.UpdateFailedException;
import org.sakaiproject.kernel.api.authz.PermissionDeniedException;
import org.sakaiproject.kernel.api.authz.UnauthorizedException;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.internal.api.KernelInitializtionException;
import org.sakaiproject.kernel.jcr.api.internal.RepositoryStartupException;

/**
 * This class binds and tests exceptions, mainly to ensure that they can be
 * constructed.
 */
public class ExceptionUT {

  @Test
  public void testRepositroyStartupException() {
    RepositoryStartupException e = new RepositoryStartupException();
    RepositoryStartupException e1 = new RepositoryStartupException(
        "Startup Test");
    RepositoryStartupException e2 = new RepositoryStartupException(e);
    RepositoryStartupException e3 = new RepositoryStartupException(
        "Startup Test", e);
    e.printStackTrace();
    e1.printStackTrace();
    e2.printStackTrace();
    e3.printStackTrace();
  }

  @Test
  public void testKernelInitializationException() {
    KernelInitializtionException e = new KernelInitializtionException();
    KernelInitializtionException e1 = new KernelInitializtionException(
        "Startup Test");
    KernelInitializtionException e2 = new KernelInitializtionException(e);
    KernelInitializtionException e3 = new KernelInitializtionException(
        "Startup Test", e);
    e.printStackTrace();
    e1.printStackTrace();
    e2.printStackTrace();
    e3.printStackTrace();
  }

  @Test
  public void testJCRNodeFactoryServiceException() {
    JCRNodeFactoryServiceException e = new JCRNodeFactoryServiceException();
    JCRNodeFactoryServiceException e1 = new JCRNodeFactoryServiceException(
        "Startup Test");
    JCRNodeFactoryServiceException e2 = new JCRNodeFactoryServiceException(e);
    JCRNodeFactoryServiceException e3 = new JCRNodeFactoryServiceException(
        "Startup Test", e);
    e.printStackTrace();
    e1.printStackTrace();
    e2.printStackTrace();
    e3.printStackTrace();
  }

  @Test
  public void testPermissionDeniedException() {
    PermissionDeniedException e = new PermissionDeniedException();
    PermissionDeniedException e1 = new PermissionDeniedException("Startup Test");
    PermissionDeniedException e2 = new PermissionDeniedException(e);
    PermissionDeniedException e3 = new PermissionDeniedException(
        "Startup Test", e);
    e.printStackTrace();
    e1.printStackTrace();
    e2.printStackTrace();
    e3.printStackTrace();
  }

  @Test
  public void testUnauthorizedException() {
    UnauthorizedException e = new UnauthorizedException();
    UnauthorizedException e1 = new UnauthorizedException("Startup Test");
    UnauthorizedException e2 = new UnauthorizedException(e);
    UnauthorizedException e3 = new UnauthorizedException("Startup Test", e);
    e.printStackTrace();
    e1.printStackTrace();
    e2.printStackTrace();
    e3.printStackTrace();
  }

  @Test
  public void testUpdateFailedException() {
    UpdateFailedException e = new UpdateFailedException();
    UpdateFailedException e1 = new UpdateFailedException("Startup Test");
    UpdateFailedException e2 = new UpdateFailedException(e);
    UpdateFailedException e3 = new UpdateFailedException("Startup Test", e);
    e.printStackTrace();
    e1.printStackTrace();
    e2.printStackTrace();
    e3.printStackTrace();
  }
}
