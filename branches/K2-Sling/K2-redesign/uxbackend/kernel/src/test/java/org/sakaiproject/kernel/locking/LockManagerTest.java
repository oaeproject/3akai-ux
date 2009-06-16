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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.google.common.collect.Lists;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.locking.Lock;
import org.sakaiproject.kernel.api.locking.LockTimeoutException;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.locking.LockManagerImpl;
import org.sakaiproject.kernel.memory.CacheManagerServiceImpl;

import java.util.List;
import java.util.Random;

/**
 * Tests the lock manager
 */
public class LockManagerTest {

  private static final String CACHE_CONFIG = "res://org/sakaiproject/kernel/memory/ehcacheConfig.xml";
  private LockManagerImpl lockManager;
  private CacheManagerServiceImpl cacheManagerService;
  protected int running;

  /**
   * @throws java.lang.Exception
   */
  @Before
  public void setUp() throws Exception {
    cacheManagerService = new CacheManagerServiceImpl(CACHE_CONFIG, "true");
    lockManager = new LockManagerImpl(cacheManagerService);
  }

  /**
   * @throws java.lang.Exception
   */
  @After
  public void tearDown() throws Exception {
    cacheManagerService.unbind(CacheScope.REQUEST);
  }

  @Test
  public void testLocking() {
    Lock lock = lockManager.getLock("testid");
    assertNotNull(lock);
    assertTrue(lock.isLocal());
    assertTrue(lock.isOwner());
    assertTrue(lock.isLocked());
    Lock lock2 = lockManager.getLock("testid", false);
    assertNotNull(lock);
    assertEquals(lock.getLockId(), lock2.getLockId());
  }

  @Test
  public void testRequestScopeLocking() {
    Lock lock = lockManager.getLock("testid");
    assertNotNull(lock);
    assertTrue(lock.isLocal());
    assertTrue(lock.isOwner());
    assertTrue(lock.isLocked());
    long lockId = lock.getLockId();
    cacheManagerService.unbind(CacheScope.REQUEST);
    assertFalse(lock.isLocked());
    lock = lockManager.getLock("testid");
    assertTrue(lock.isLocal());
    assertTrue(lock.isOwner());
    assertTrue(lock.isLocked());
    assertFalse(lockId == lock.getLockId());
  }

  @Test
  public void testMultiLock() {
    Random random = new Random();
    Lock[] locks = new Lock[100000];
    long start = System.currentTimeMillis();
    for (int i = 0; i < locks.length; i++) {
      locks[i] = lockManager.getLock(String.valueOf(random.nextInt(5)));
    }
    long end = System.currentTimeMillis();
    double t = end - start;
    t = t / locks.length;
    System.err.println("Time per lock = " + t + " ms");
    for (int i = 0; i < locks.length; i++) {
      assertNotNull(locks[i]);
      assertTrue(locks[i].isLocal());
      assertTrue(locks[i].isOwner());
      assertTrue(locks[i].isLocked());
    }
    cacheManagerService.unbind(CacheScope.REQUEST);
  }

  @Test
  public void doTestMultiLock() throws LockTimeoutException {
    testMultiLockAndWait();
  }

  public double[] testMultiLockAndWait() throws LockTimeoutException {
    Random random = new Random();
    Lock[] locks = new Lock[100];
    long start = System.currentTimeMillis();
    long waitingTotal = 0;
    for (int i = 0; i < locks.length; i++) {
      locks[i] = lockManager.waitForLock(String.valueOf(i));
      try {
        int waiting = random.nextInt(100);
        waitingTotal += waiting;
        Thread.sleep(waiting);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
      locks[i].unlock();
    }
    long end = System.currentTimeMillis();
    double t = end - start - waitingTotal;
    t = t / locks.length;
    System.err.println("Time per lock = " + t + " ms");
    for (int i = 0; i < locks.length; i++) {
      assertNotNull(locks[i]);
      assertTrue(locks[i].isLocal());
      assertTrue(locks[i].isOwner());
    }
    long cstart = System.currentTimeMillis();
    cacheManagerService.unbind(CacheScope.REQUEST);
    long cend = System.currentTimeMillis();
    double ct = cend - cstart;
    ct = ct / locks.length;
    System.err.println("Time reqeust end = " + ct + " ms");
    return new double[] { t, ct };
  }

  @Test
  public void concurrentTest() {
    Thread[] thread = new Thread[20];
    running = 0;
    final List<Throwable> errors = Lists.newArrayList();
    final List<double[]> timings = Lists.newArrayList();
    for ( int i = 0; i < thread.length; i++ ) {
      thread[i] = new Thread(new Runnable() {

        public void run() {
          running++;
          try {
            timings.add(testMultiLockAndWait());
          } catch ( Exception e) {
            errors.add(e);
          } finally {
            running--;
          }
        }

      });
    }
    for ( int i = 0; i < thread.length; i++ ) {
      thread[i].start();
    }
    try {
      Thread.sleep(100);
    } catch (InterruptedException e1) {
    }
    while(running>0) {
      try {
        Thread.sleep(500);
      } catch (InterruptedException e) {
      }
    }
    for ( Throwable t : errors ) {
      t.printStackTrace();
    }
    double[] average = new double[2];
    for ( double[] t : timings) {
      System.err.println(" Locking:"+t[0]+" clearing:"+t[1]);
      average[0] = average[0]+t[0];
      average[1] = average[1]+t[1];
    }
    average[0] = average[0]/timings.size();
    average[1] = average[1]/timings.size();
    System.err.println("Average Locking:"+average[0]+"ms clearing:"+average[1]);
    assertEquals(0,errors.size());
  }

}
