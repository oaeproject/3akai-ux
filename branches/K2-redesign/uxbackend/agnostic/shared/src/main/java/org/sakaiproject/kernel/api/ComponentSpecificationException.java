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
package org.sakaiproject.kernel.api;

/**
 * Thrown when there is a problem with the component specification.
 */
public class ComponentSpecificationException extends Exception {


  /**
   *  the object ID should this ever need to be serialized.
   */
  private static final long serialVersionUID = -8837553837359676249L;

  /**
   * {@inheritDoc}
   */
  public ComponentSpecificationException() {
  }

  /**
   * {@inheritDoc}
   */
  public ComponentSpecificationException(String arg0) {
    super(arg0);
  }

  /**
   * {@inheritDoc}
   */
  public ComponentSpecificationException(Throwable arg0) {
    super(arg0);
  }

  /**
   * {@inheritDoc}
   */
  public ComponentSpecificationException(String arg0, Throwable arg1) {
    super(arg0, arg1);
  }

}
