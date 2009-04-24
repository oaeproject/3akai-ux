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

import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.internal.api.InitializationAction;
import org.sakaiproject.kernel.internal.api.KernelInitializtionException;

import javax.jcr.LoginException;
import javax.jcr.RepositoryException;
import javax.transaction.HeuristicMixedException;
import javax.transaction.HeuristicRollbackException;
import javax.transaction.RollbackException;
import javax.transaction.SystemException;
import javax.transaction.TransactionManager;

/**
 *
 */
public class KernelSessionStop implements InitializationAction {

  private JCRService jcrService;
  private TransactionManager transactionManager;

  /**
   *
   */
  @Inject
  public KernelSessionStop(JCRService jcrService, TransactionManager transactionManager) {
    this.jcrService = jcrService;
    this.transactionManager = transactionManager;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.internal.api.InitializationAction#init()
   */
  public void init() throws KernelInitializtionException {
    try {
      jcrService.getSession().save();
      transactionManager.commit();
      jcrService.logout();
    } catch (LoginException e) {
      throw new KernelInitializtionException(e.getMessage(), e);
    } catch (RepositoryException e) {
      throw new KernelInitializtionException(e.getMessage(), e);
    } catch (SecurityException e) {
      throw new KernelInitializtionException(e.getMessage(), e);
    } catch (IllegalStateException e) {
      throw new KernelInitializtionException(e.getMessage(), e);
    } catch (RollbackException e) {
      throw new KernelInitializtionException(e.getMessage(), e);
    } catch (HeuristicMixedException e) {
      throw new KernelInitializtionException(e.getMessage(), e);
    } catch (HeuristicRollbackException e) {
      throw new KernelInitializtionException(e.getMessage(), e);
    } catch (SystemException e) {
      throw new KernelInitializtionException(e.getMessage(), e);
    }
  }

}
