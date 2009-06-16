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
package org.sakaiproject.kernel.locking;

import org.sakaiproject.kernel.api.locking.Lock;
import org.sakaiproject.kernel.api.memory.ThreadBound;

/**
 * This implements a Lock to be serialized over the cluster. It must be serializable and
 * anything transient is injected as it comes out of the cache.
 */
public class LockImpl implements Lock, ThreadBound {

  /**
   * For serialization.
   */
  private static final long serialVersionUID = -4298509933496893595L;
  /**
   * The lockManager for this instance.
   */
  private transient LockManagerImpl currentLockManger;
  /**
   * The id of the object being locked.
   */
  private String id;
  /**
   * The owner of the lock.
   */
  private long ownerId;
  /**
   * The lock manager instance where this lock came from.
   */
  private long instanceId;
  /**
   * A flag to indicate if the Lock is open or closed, true means closed (locked)
   */
  private boolean locked;
  /**
   * The ID of the lock instance.
   */
  private long lockId;

  /**
   * Create a new lock on the item id, with owner ownerId for the lockmanage instanceId
   *
   * @param id
   *          the object being locked.
   * @param ownerId
   *          the owner of the lock.
   * @param instanceId
   *          the instance of the lock manager creating the lock.
   */
  public LockImpl(String id, long lockId, long ownerId, long instanceId) {
    this.locked = true;
    this.id = id;
    this.ownerId = ownerId;
    this.instanceId = instanceId;
    this.lockId = lockId;
  }

  /**
   * Bind this lock to a lock manager, this must be performed whenever the lock is taken
   * from the cache.
   *
   * @param currentLockManager the lock manager to bind to.
   */
  protected void bind(LockManagerImpl currentLockManager) {
    this.currentLockManger = currentLockManager;
  }

  /**
   * {@inheritDoc}
   * get the locked object id.
   * @see org.sakaiproject.kernel.api.locking.Lock#getLocked()
   */
  public String getLocked() {
    return id;
  }

  /**
   * {@inheritDoc}
   * get the owner of the lock.
   * @see org.sakaiproject.kernel.api.locking.Lock#getOwner()
   */
  public String getOwner() {
    return String.valueOf(ownerId);
  }

  /**
   * {@inheritDoc}
   * @return true if the lock is bound to the same lock manager as the orriginating manager.
   * @see org.sakaiproject.kernel.api.locking.Lock#isLocal()
   */
  public boolean isLocal() {
    return (instanceId == currentLockManger.getInstanceId());
  }

  /**
   * {@inheritDoc}
   * @return if the lock is local and bound to the current thread.
   * @see org.sakaiproject.kernel.api.locking.Lock#isOwner()
   */
  public boolean isOwner() {
    return isLocal()
    && (ownerId == currentLockManger.getThreadId());
  }

  /**
   * {@inheritDoc}
   * Perform an unlock, only if local to the current manager and owned by the current thread.
   * @see org.sakaiproject.kernel.api.locking.Lock#unlock()
   */
  public void unlock() {
    currentLockManger.unlock(this);
  }

  /**
   * @param b set the state as locked.
   */
  public void setLocked(boolean b) {
    locked = b;
  }

  /**
   * @return the locked state.
   */
  public boolean isLocked() {
    return locked;
  }

  /**
   * {@inheritDoc}
   * unbind this lock, performing an unlock in the process.
   * @see org.sakaiproject.kernel.api.memory.ThreadBound#unbind()
   */
  public void unbind() {
    unlock();
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.locking.Lock#getLockId()
   */
  public long getLockId() {
    return lockId;
  }
}
