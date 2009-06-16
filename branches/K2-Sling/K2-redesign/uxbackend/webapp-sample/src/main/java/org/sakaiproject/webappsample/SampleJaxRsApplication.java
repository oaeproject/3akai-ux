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

package org.sakaiproject.webappsample;

import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.core.Application;

/**
 * A sample JAXRS Application.
 */
public class SampleJaxRsApplication extends Application {
  /**
   * {@inheritDoc}
   * @see javax.ws.rs.core.Application#getSingletons()
   */
  @Override
  public Set<Object> getSingletons() {
    // Create JAX-RS annotated objects you like, injecting whatever
    // collaborating services you like, by any means you like.
    Set<Object> set = new HashSet<Object>();
    set.add(new SingletonHelloWorld());
    set.add(new SingletonGoodbyeWorld());
    return set;
  }

  /**
   * {@inheritDoc}
   * @see javax.ws.rs.core.Application#getClasses()
   */
  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> classes = new HashSet<Class<?>>();
    classes.add(PrototypeHelloWorld.class);
    classes.add(PrototypeGoodbyeWorld.class);
    return classes;
  }
}
