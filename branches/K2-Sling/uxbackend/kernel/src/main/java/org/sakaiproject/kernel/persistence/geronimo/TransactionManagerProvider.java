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
package org.sakaiproject.kernel.persistence.geronimo;

import javax.transaction.TransactionManager;
import javax.transaction.xa.XAException;

import org.apache.geronimo.transaction.manager.GeronimoTransactionManager;
import org.sakaiproject.kernel.KernelConstants;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.name.Named;

public class TransactionManagerProvider implements Provider<TransactionManager> {
  private GeronimoTransactionManager transMgr;

  @Inject
  public TransactionManagerProvider(
      @Named(KernelConstants.TRANSACTION_TIMEOUT_SECONDS) int defaultTransactionTimeoutSeconds)
      throws XAException {
    transMgr = new GeronimoTransactionManager(defaultTransactionTimeoutSeconds);
  }

  public TransactionManager get() {
    return transMgr;
  }

}
