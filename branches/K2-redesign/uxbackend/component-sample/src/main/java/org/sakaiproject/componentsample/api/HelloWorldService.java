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
package org.sakaiproject.componentsample.api;

import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

/**
 * This is a simple service interface, it will say HelloWorld.
 */
@Path("/hello")
public interface HelloWorldService {

  /**
   * @return a greeting.
   */
  @GET
  @Path("/greeting")
  String getGreeting();

  /**
   * @return some interesting info about JCR
   */
  Map<String, String> getJCRInfo();

  /**
   * @return some info about JPA
   */
  Map<String, String> getJPAInfo();
}
