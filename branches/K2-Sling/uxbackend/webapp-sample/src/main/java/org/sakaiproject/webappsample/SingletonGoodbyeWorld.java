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

import javax.ws.rs.GET;
import javax.ws.rs.Path;

import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.util.rest.RestDescription;

/**
 * An example of a JAXRS Singleton.
 */
@Path("/singletongoodbye")
public class SingletonGoodbyeWorld implements Documentable {
  /**
   * Description of the rest api.
   */
  private static final RestDescription REST_DOCS;
  static {
    REST_DOCS = new RestDescription();
    REST_DOCS.setTitle("This is the rest interface to the singleton goodbye world service, hosted "
        + "in a webapp.");
    REST_DOCS.setShortDescription("Sample rest service");
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.rest.Documentable#getRestDocumentation()
   */
  public RestDescription getRestDocumentation() {
    return REST_DOCS;
  }

  /**
   * @return sample greeting.
   */
  @GET
  @Path("/greeting")
  public String getGreeting() {
    return "This is goodbye from a singleton resource, located in a webapp";
  }
}
