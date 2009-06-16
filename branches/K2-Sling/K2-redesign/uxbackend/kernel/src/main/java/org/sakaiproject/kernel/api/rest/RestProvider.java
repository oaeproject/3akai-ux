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
package org.sakaiproject.kernel.api.rest;

import org.sakaiproject.kernel.api.Provider;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 */
public interface RestProvider extends Provider<String> {

  public static final String REST_REGISTRY = "rest.registry";
  public static final String CONTENT_TYPE = "text/plain";

  /**
   * Produces the output for the rest request, as json.
   *
   * <p>
   * If Implementing this method the patter that is normally used is to wrap the
   * dispatch implementation in a try catch that forwards SecurityExceptions and
   * RestServiceFaults and encapsulates any other exceptions.
   * </p>
   * <pre>
   *     try {
   *     ...
   *     } catch (SecurityException ex) {
   *       throw ex;
   *     } catch (RestServiceFaultException ex) {
   *       throw ex;
   *     } catch (Exception ex) {
   *       throw new RestServiceFaultException(ex.getMessage(),ex);
   *     }
   *
   * </pre>
   *
   * @param elements
   *          the path elements of the request
   * @param request
   *          the request
   * @param response
   *          the response
   * @throws SecurityException
   *           if there is a security exception on the dispatch.
   * @throws RestServiceFaultException
   *           if there is an fault on the dispatch.
   */
  void dispatch(String[] elements, HttpServletRequest request,
      HttpServletResponse response);

  /**
   * @return get the description of the service.
   */
  RestDescription getDescription();

}
