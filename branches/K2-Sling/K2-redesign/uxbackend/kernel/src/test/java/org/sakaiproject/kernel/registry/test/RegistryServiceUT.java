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
package org.sakaiproject.kernel.registry.test;


import static org.junit.Assert.*;

import com.google.common.collect.Lists;

import org.junit.Test;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryListener;
import org.sakaiproject.kernel.registry.RegistryServiceImpl;

import java.util.List;

/**
 * 
 */
public class RegistryServiceUT {

  @Test
  public void testRegistryServiceAddForward() {
    RegistryServiceImpl registryServiceImpl = new RegistryServiceImpl();
    Registry<String,TProvider<String>> r = registryServiceImpl.getRegistry("testRegistry");
    List<TProvider<String>> providerStore = Lists.newArrayList();
    for ( int i = 0; i < 100; i++ ) {
      TProvider<String> p = new TProvider<String>(i,String.valueOf(i));
      providerStore.add(p); // store so it doesnt get gc'd
      r.add(p);
    }
    List<TProvider<String>> p = r.getList();
    for ( int i = 0; i < 100; i++ ) {
      assertEquals(i, p.get(i).getPriority());
    }
  }
  @Test
  public void testRegistryServiceAddReverse() {
    RegistryServiceImpl registryServiceImpl = new RegistryServiceImpl();
    Registry<String,TProvider<String>> r = registryServiceImpl.getRegistry("testRegistry");
    List<TProvider<String>> providerStore = Lists.newArrayList();
    for ( int i = 99; i >= 0; i-- ) {
      TProvider<String> p = new TProvider<String>(i,String.valueOf(i));
      providerStore.add(p); // store so it doesnt get gc'd
      r.add(p);
    }
    List<TProvider<String>> p = r.getList();
    for ( int i = 0; i < 100; i++ ) {
      assertEquals(i, p.get(i).getPriority());
    }
  }
  
  @Test
  public void testRegistryServiceRemove() {
    RegistryServiceImpl registryServiceImpl = new RegistryServiceImpl();
    Registry<String,TProvider<String>> r = registryServiceImpl.getRegistry("testRegistry");
    TProvider<String> tp = new TProvider<String>(-2,String.valueOf(-2));
    r.add(tp);
    List<TProvider<String>> providerStore = Lists.newArrayList();
    for ( int i = 99; i >= 0; i-- ) {
      TProvider<String> p = new TProvider<String>(i,String.valueOf(i));
      providerStore.add(p); // store so it doesnt get gc'd
      r.add(p);
    }
    r.remove(tp);
    List<TProvider<String>> p = r.getList();
    assertEquals(100, p.size());
    for ( int i = 0; i < 100; i++ ) {
      assertEquals(i, p.get(i).getPriority());
    }
  }

  @Test
  public void testRegistryServiceRemoveAndListen() {
    RegistryServiceImpl registryServiceImpl = new RegistryServiceImpl();
    Registry<String,TProvider<String>> r = registryServiceImpl.getRegistry("testRegistry");
    final List<TProvider<String>> added = Lists.newArrayList();
    final List<TProvider<String>> removed = Lists.newArrayList();
    final List<TProvider<String>> updated = Lists.newArrayList();
    List<TProvider<String>> addedTest = Lists.newArrayList();
    List<TProvider<String>> removedTest = Lists.newArrayList();
    List<TProvider<String>> updatedTest = Lists.newArrayList();
    RegistryListener<TProvider<String>> listener1 = new RegistryListener<TProvider<String>>() {

      public void added(TProvider<String> wasAdded) {
        added.add(wasAdded);
      }

      public void removed(TProvider<String> wasRemoved) {
        removed.add(wasRemoved);
      }

      public void updated(TProvider<String> wasUpdated) {
        updated.add(wasUpdated);
      }
    };
    RegistryListener<TProvider<String>> listener2 = new RegistryListener<TProvider<String>>() {

      public void added(TProvider<String> wasAdded) {
        added.add(wasAdded);
      }

      public void removed(TProvider<String> wasRemoved) {
        removed.add(wasRemoved);
      }

      public void updated(TProvider<String> wasUpdated) {
        updated.add(wasUpdated);
      }
    };
    r.addListener(listener1);
    r.addListener(listener2);
    TProvider<String> tp = new TProvider<String>(-2,String.valueOf(-2));
    r.add(tp);
    addedTest.add(tp);
    addedTest.add(tp);
    for ( int i = 99; i >= 0; i-- ) {
      TProvider<String> tpa = new TProvider<String>(i,String.valueOf(i));
      r.add(tpa);
      addedTest.add(tpa);
      addedTest.add(tpa);
    }
    r.add(tp);
    updatedTest.add(tp);
    updatedTest.add(tp);
    r.remove(tp);
    removedTest.add(tp);
    removedTest.add(tp);
    List<TProvider<String>> p = r.getList();
    assertEquals(100, p.size());
    for ( int i = 0; i < 100; i++ ) {
      assertEquals(i, p.get(i).getPriority());
    }
    
    assertArrayEquals(addedTest.toArray(),added.toArray());
    assertArrayEquals(updatedTest.toArray(),updated.toArray());
    assertArrayEquals(removedTest.toArray(),removed.toArray());
    
    r.removeListener(listener2);
    
    // check that the remove worked.
    r.add(tp);
    addedTest.add(tp);
    for ( int i = 99; i >= 0; i-- ) {
      TProvider<String> tpa = new TProvider<String>(i,String.valueOf(i));
      r.add(tpa);
      updatedTest.add(tpa);
    }
    r.add(tp);
    updatedTest.add(tp);
    r.remove(tp);
    removedTest.add(tp);
    p = r.getList();
    assertEquals(100, p.size());
    for ( int i = 0; i < 100; i++ ) {
      assertEquals(i, p.get(i).getPriority());
    }
    
    assertArrayEquals(addedTest.toArray(),added.toArray());
    assertArrayEquals(updatedTest.toArray(),updated.toArray());
    assertArrayEquals(removedTest.toArray(),removed.toArray());

    
    
    
  }

}
