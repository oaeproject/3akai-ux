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

import java.io.Serializable;

/**
 * The Lock on the object.
 */
public interface Lock extends Serializable {
  /**
   * @return true if the lock is held by this thread
   */
  boolean isOwner();

  /**
   * @return true if the lock is from this node in the cluster.
   */
  boolean isLocal();
  /**
   * @return the owner of the lock
   */
  String getOwner();
  /**
   * @return the ID of the object that has been locked.
   */
  String getLocked();
  /**
   * Unlock the item and dispose of the lock.
   */
  void unlock();

  /**
   * @return true if the lock is locked.
   */
  boolean isLocked();

  /**
   * @return the id of the lock.
   */
  long getLockId();
}
