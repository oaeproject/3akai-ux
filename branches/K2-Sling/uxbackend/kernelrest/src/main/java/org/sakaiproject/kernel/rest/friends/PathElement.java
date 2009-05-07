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
package org.sakaiproject.kernel.rest.friends;

/**
 * The path elements that might be expected in a request.
 */
public enum PathElement {

  /**
   * major path element, always requires friendUuid
   */
  connect(3, new String[] { FriendsParams.FRIENDUUID }),
  /**
   * minor path element, request a connection, requires a message
   */
  request(3, new String[] { FriendsParams.MESSAGE }),
  /**
   * minor path element, accept a connection
   */
  accept(3, new String[] {}),
  /**
   * minor path element, cancel a connection request
   */
  cancel(3, new String[] {}),
  /**
   * Undefined element
   */
  UNDEFINED(0, new String[] {}),
  /**
   * reject a connection request
   */
  reject(3, new String[] {}),
  /**
   * ignore a connection request
   */
  ignore(3, new String[] {}),
  /**
   * major element, get my connections
   */
  status(2, new String[] {}),
  /**
   * remove a connection
   */
  remove(3, new String[] {});

  protected String[] required;
  protected int nelements;

  /**
   * 
   */
  private PathElement(int nelements, String[] required) {
    this.nelements = nelements;
    this.required = required;
  }
}
