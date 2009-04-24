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
package org.sakaiproject.kernel.memory;

import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.ThreadBound;

import java.util.HashMap;
import java.util.Set;

/**
 *
 */
public class MapCacheImpl<V> extends HashMap<String, V>implements Cache<V>  {


  /**
   *
   */
  private static final long serialVersionUID = -5400056532743570231L;

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.memory.Cache#containsKey(java.lang.String)
   */
  public boolean containsKey(String key) {
    return super.containsKey(key);
 }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.memory.Cache#get(java.lang.String)
   */
  public V get(String key) {
    return super.get(key);
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.memory.Cache#remove(java.lang.String)
   */
  public void remove(String key) {
    V o = super.remove(key);
    if ( o instanceof ThreadBound ) {
      ((ThreadBound) o).unbind();
    }
  }


  /**
   * {@inheritDoc}
   * @see java.util.HashMap#clear()
   */
  @Override
  public void clear() {
    for ( String k : super.keySet() ) {
      Object o = get(k);
      if( o instanceof ThreadBound ) {
        ((ThreadBound) o).unbind();
      }
    }
    super.clear();
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.memory.Cache#removeChildren(java.lang.String)
   */
  public void removeChildren(String key) {
    super.remove(key);
    if ( !key.endsWith("/") ) {
      key = key + "/";
    }
    Set<String> keys = super.keySet();
    for ( String k : keys) {
      if ( (k).startsWith(key) ) {
        super.remove(k);
      }
    }
  }





}
