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
package org.sakaiproject.kernel.webapp.filter;

import javax.transaction.NotSupportedException;
import javax.transaction.SystemException;

/**
 * Provides a request filter, but assumes that the application manages its own
 * transactions. This Filter should only ever be used where in very special circumstances
 * or where it is known that the application never writes to the DB or JCR.
 */
public class NonTransactionalSakaiRequestFilter extends SakaiRequestFilter {

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.webapp.filter.SakaiRequestFilter#begin()
   */
  @Override
  protected void begin() throws NotSupportedException, SystemException {
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.webapp.filter.SakaiRequestFilter#commit()
   */
  @Override
  protected void commit() throws SecurityException, SystemException {
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.webapp.filter.SakaiRequestFilter#rollback()
   */
  @Override
  protected void rollback() {
  }
}
