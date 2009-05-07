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

import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.util.rest.RestDescription;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.Date;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;

/**
 * Sample singleton Hello World.
 */
@Path("/singletonhello")
public class SingletonHelloWorld implements Documentable {
  /**
   *
   */
  private static final RestDescription REST_DOCS;
  static {
    REST_DOCS = new RestDescription();
    REST_DOCS
        .setTitle("This is the rest interface to the singleton hello world service, hosted "
            + "in a webapp.");
    REST_DOCS.setShortDescription("Sample rest service");
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.Documentable#getRestDocumentation()
   */
  public RestDescription getRestDocumentation() {
    return REST_DOCS;
  }

  /**
   * @return the greeting as a string.
   */
  @GET
  @Path("/greeting")
  public String getGreeting() {
    return "This is hello from a singleton resource, located in a webapp";
  }

  /**
   * @return the model as json.
   */
  @GET
  @Path("/model.json")
  @Produces(MediaType.APPLICATION_JSON)
  public MyModel getModelAsJson() {
    return new MyModel();
  }

  /**
   * @return the model as xml.
   */
  @GET
  @Path("/model.xml")
  @Produces(MediaType.APPLICATION_XML)
  public MyModel getModelAsXml() {
    return new MyModel();
  }

  /**
   * @return the model as a stream.
   */
  @GET
  @Path("/stream")
  public InputStream getModelAsStream() {
    String s = "{ \"keyFromJcr\" : \"valueFromJcr\" }";
    try {
      return new ByteArrayInputStream(s.getBytes("UTF-8"));
    } catch (UnsupportedEncodingException e) {
      throw new WebApplicationException(e);
    }
  }

  /**
   * A sample object to be returned by the methods in this resource.
   */
  public static class MyModel {

    /**
     * The model.
     */
    public MyModel() {
      d = new Date();
      s = "A MyModel delivered via a JAX-RS resource";
      l = Long.MAX_VALUE;
    }

    /**
     *
     */
    private String s;
    /**
     *
     */
    private Date d;
    /**
     *
     */
    private Long l;

    /**
     * @return the value of s
     */
    public String getS() {
      return s;
    }

    /**
     * @param newS
     *          the new value of s.
     */
    public void setS(String newS) {
      this.s = newS;
    }

    /**
     * @return the value of D.
     */
    public Date getD() {
      return d;
    }

    /**
     * @param newD
     *          the new value of d.
     */
    public void setD(Date newD) {
      this.d = newD;
    }

    /**
     * @return the value of l.
     */
    public Long getL() {
      return l;
    }

    /**
     * @param newl
     *          the new value of L.
     */
    public void setL(Long newl) {
      this.l = newl;
    }
  }
}
