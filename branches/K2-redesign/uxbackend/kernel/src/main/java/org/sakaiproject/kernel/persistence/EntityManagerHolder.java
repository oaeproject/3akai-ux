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

package org.sakaiproject.kernel.persistence;

import org.sakaiproject.kernel.api.memory.ThreadBound;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;

/**
 * A Thread bound entity manager that closes when its unbound.
 */
public class EntityManagerHolder implements ThreadBound {

  private EntityManager entityManager;
  private String sourceThread;

  /**
   *
   */
  public EntityManagerHolder(EntityManager entityManager) {
    this.entityManager = entityManager;
    this.sourceThread = String.valueOf(Thread.currentThread());
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.memory.ThreadBound#unbind()
   */
  public void unbind() {
    if (entityManager.isOpen()) {
      EntityTransaction transaction = entityManager.getTransaction();
      if (transaction.isActive()) {
        transaction.commit();
      }
      entityManager.close();
      System.err.println("==========================Entity Manager is Closed=================");
    } else {
      System.err.println("==========================Entity Manager Already Closed=================");

    }
  }

  /**
   * @return the entityManager
   */
  public EntityManager getEntityManager() {
    return entityManager;
  }

  /**
   * @return
   */
  public String getSourceThread() {
    return sourceThread;
  }
}
