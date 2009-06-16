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
package org.sakaiproject.kernel.api.locking;

/**
 * Lock manager provides a mechanism for locking uniquely identified objects across the
 * cluster.
 */
public interface LockManager {

  /**
   * @param id
   * @return
   */
  Lock getLock(String id);

  /**
   * @param id
   * @param create
   * @return
   */
  Lock getLock(String id, boolean create);

  /**
   * @param id
   * @return
   * @throws LockTimeoutException
   *           indicates that a lock was not achieved within the a timeout (30s)
   */
  Lock waitForLock(String id) throws LockTimeoutException;

  /**
   * clear the locks associated with this request.
   */
  void clearLocks();

}
