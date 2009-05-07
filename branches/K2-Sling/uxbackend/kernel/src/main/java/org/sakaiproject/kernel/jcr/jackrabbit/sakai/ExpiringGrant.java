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
package org.sakaiproject.kernel.jcr.jackrabbit.sakai;

import java.io.Serializable;

/**
 * A Cache element with its own expiration time.
 */
public class ExpiringGrant<T> implements Serializable {
  /**
   *
   */
  private static final long serialVersionUID = 5749381087886040007L;
  private T payload;
  private long end;

  /**
   *
   */
  public ExpiringGrant(T payload, long ttl) {
    this.payload = payload;
    this.end = System.currentTimeMillis()+ttl;
  }

  /**
   * @return true if it has expired.
   */
  public boolean hasExpired() {
    return System.currentTimeMillis() > end;
  }

  /**
   * @return the payload
   */
  public T getPayload() {
    return payload;
  }

}
