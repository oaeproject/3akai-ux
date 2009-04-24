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
package org.sakaiproject.kernel.serialization.json;

import com.google.inject.Injector;

import java.lang.reflect.InvocationTargetException;

import net.sf.json.JSONObject;
import net.sf.json.util.NewBeanInstanceStrategy;

/**
 * An Injector based NewBeanInstance strategy that will use Guice to create new
 * beans.
 */
public class InjectorBeanInstanceStrategy extends NewBeanInstanceStrategy {
  /**
   * The injector to use to create beans.
   */
  private Injector injector;

  /**
   * Constructor.
   *
   * @param injector
   *                The injector to use.
   */
  public InjectorBeanInstanceStrategy(Injector injector) {
    this.injector = injector;
  }

  /**
   * create a new instance of the requested bean using Guice.
   *
   * @param beanClass
   *                The bean class to create and instance of
   * @param jsonObject
   *                the json object to base that instance on
   * @return a new instance of the request class
   * @throws InstantiationException when the object cant be created
   * @throws IllegalAccessException when permission is denied to the class
   * @throws NoSuchMethodException when the constructor or one of the injectors has gone missing
   * @throws InvocationTargetException when the invocation method fails to invoke
   */
  @SuppressWarnings("unchecked")
  @Override
  public Object newInstance(Class beanClass, JSONObject jsonObject) throws InstantiationException,
      IllegalAccessException, NoSuchMethodException, InvocationTargetException {
    if (beanClass != null) {
      return injector.getInstance(beanClass);
    }
    return DEFAULT.newInstance(null, jsonObject);
  }

}
