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
package org.sakaiproject.componentsample.core;

import org.sakaiproject.componentsample.api.HelloWorldService;
import org.sakaiproject.componentsample.api.InternalDateService;
import org.sakaiproject.kernel.api.jcr.JCRService;

import java.util.HashMap;
import java.util.Map;

import javax.jcr.Repository;

/**
 * This is the service implementation.
 */
public class HelloWorldServiceImpl implements HelloWorldService {

  /**
   * The internal service that will provide dates.
   */
  private InternalDateService internalDateService;
  /**
   *
   */
  private JCRService jcrService;

  /**
   * A constructor that supports injection, so I know that when the class is
   * created, it is complete and ready for use.
   *
   * @param pInternalDateService
   *          an instance of the InternalDateService that I want this to use.
   * @param pJcrService
   *          the JCRService instance from the kernel.
   */
  public HelloWorldServiceImpl(InternalDateService pInternalDateService,
      JCRService pJcrService) {
    this.internalDateService = pInternalDateService;
    this.jcrService = pJcrService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.componentsample.api.HelloWorldService#getGreeting()
   */
  public String getGreeting() {
    return "Hi there, the time is " + internalDateService.getDate();
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.componentsample.api.HelloWorldService#getJCRInfo()
   */
  public Map<String, String> getJCRInfo() {
    // Get some info about the JCR Repository
    Repository repo = jcrService.getRepository();
    String[] jcrDesKeys = repo.getDescriptorKeys();
    Map<String, String> jcrInfo = new HashMap<String, String>();
    for (String key : jcrDesKeys) {
      jcrInfo.put(key, repo.getDescriptor(key));
    }
    return jcrInfo;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.componentsample.api.HelloWorldService#getJPAInfo()
   */
  public Map<String, String> getJPAInfo() {
    // The EntityManager can't be constructor injected, see the
    // HelloWorldServiceGuicedImpl
    Map<String, String> unimplimented = new HashMap<String, String>();
    unimplimented.put("Try the", "Guice version");
    return unimplimented;
  }

}
