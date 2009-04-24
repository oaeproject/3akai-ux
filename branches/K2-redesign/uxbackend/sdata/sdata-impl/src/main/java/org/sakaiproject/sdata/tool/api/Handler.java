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

package org.sakaiproject.sdata.tool.api;

import org.sakaiproject.kernel.util.rest.RestDescription;

import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A Handler handles http method request, without the addional weight of a
 * servlet. Implementaitons of this interface should obej rfc2616 and releated
 * rfcs as closely as possible. The relevant parts of the standard are listed
 * against each method.
 * 
 * @author ieb
 */
public interface Handler extends Serializable {

  /**
   * <p>
   * The http DELETE method delete the resource at pointed to by the request. If
   * sucessfull, it will 204 (no content), if not found 404, if error 500.
   * Extract from the RFC on delete follows.
   * </p>
   * <p>
   * The DELETE method requests that the origin server delete the resource
   * identified by the Request-URI. This method MAY be overridden by human
   * intervention (or other means) on the origin server. The client cannot be
   * guaranteed that the operation has been carried out, even if the status code
   * returned from the origin server indicates that the action has been
   * completed successfully. However, the server SHOULD NOT indicate success
   * unless, at the time the response is given, it intends to delete the
   * resource or move it to an inaccessible location.
   * </p>
   * <p>
   * A successful response SHOULD be 200 (OK) if the response includes an entity
   * describing the status, 202 (Accepted) if the action has not yet been
   * enacted, or 204 (No Content) if the action has been enacted but the
   * response does not include an entity.
   * </p>
   * <p>
   * If the request passes through a cache and the Request-URI identifies one or
   * more currently cached entities, those entries SHOULD be treated as stale.
   * Responses to this method are not cacheable.
   * </p>
   * 
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  void doDelete(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException;

  /**
   * <p>
   * The GET method means retrieve whatever information (in the form of an
   * entity) is identified by the Request-URI. If the Request-URI refers to a
   * data-producing process, it is the produced data which shall be returned as
   * the entity in the response and not the source text of the process, unless
   * that text happens to be the output of the process.
   * </p>
   * <p>
   * The semantics of the GET method change to a "conditional GET" if the
   * request message includes an If-Modified-Since, If-Unmodified-Since,
   * If-Match, If-None-Match, or If-Range header field. A conditional GET method
   * requests that the entity be transferred only under the circumstances
   * described by the conditional header field(s). The conditional GET method is
   * intended to reduce unnecessary network usage by allowing cached entities to
   * be refreshed without requiring multiple requests or transferring data
   * already held by the client.
   * </p>
   * <p>
   * The semantics of the GET method change to a "partial GET" if the request
   * message includes a Range header field. A partial GET requests that only
   * part of the entity be transferred, as described in section <a rel="xref"
   * href="rfc2616-sec14.html#sec14.35">14.35</a>. The partial GET method is
   * intended to reduce unnecessary network usage by allowing
   * partially-retrieved entities to be completed without transferring data
   * already held by the client.
   * </p>
   * <p>
   * The response to a GET request is cacheable if and only if it meets the
   * requirements for HTTP caching described in section 13.
   * </p>
   * <p>
   * See section <a
   * href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec15.html#sec15.1.3"
   * >15.1.3</a> for security considerations when used for forms.
   * </p>
   * <p>
   * Section <a
   * href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9"
   * >14.9</a> specifies cache control headers.
   * </p>
   * 
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException;

  /**
   * <a id="sec9.4">9.4</a> HEAD</h3>
   * <p>
   * The HEAD method is identical to GET except that the server MUST NOT return
   * a message-body in the response. The metainformation contained in the HTTP
   * headers in response to a HEAD request SHOULD be identical to the
   * information sent in response to a GET request. This method can be used for
   * obtaining metainformation about the entity implied by the request without
   * transferring the entity-body itself. This method is often used for testing
   * hypertext links for validity, accessibility, and recent modification.
   * </p>
   * <p>
   * The response to a HEAD request MAY be cacheable in the sense that the
   * information contained in the response MAY be used to update a previously
   * cached entity from that resource. If the new field values indicate that the
   * cached entity differs from the current entity (as would be indicated by a
   * change in Content-Length, Content-MD5, ETag or Last-Modified), then the
   * cache MUST treat the cache entry as stale.
   * </p>
   * 
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  void doHead(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException;

  /**
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException;

  /**
   * /**
   * <p>
   * The PUT method requests that the enclosed entity be stored under the
   * supplied Request-URI. If the Request-URI refers to an already existing
   * resource, the enclosed entity SHOULD be considered as a modified version of
   * the one residing on the origin server. If the Request-URI does not point to
   * an existing resource, and that URI is capable of being defined as a new
   * resource by the requesting user agent, the origin server can create the
   * resource with that URI. If a new resource is created, the origin server
   * MUST inform the user agent via the 201 (Created) response. If an existing
   * resource is modified, either the 200 (OK) or 204 (No Content) response
   * codes SHOULD be sent to indicate successful completion of the request. If
   * the resource could not be created or modified with the Request-URI, an
   * appropriate error response SHOULD be given that reflects the nature of the
   * problem. The recipient of the entity MUST NOT ignore any Content-* (e.g.
   * Content-Range) headers that it does not understand or implement and MUST
   * return a 501 (Not Implemented) response in such cases.
   * </p>
   * <p>
   * If the request passes through a cache and the Request-URI identifies one or
   * more currently cached entities, those entries SHOULD be treated as stale.
   * Responses to this method are not cacheable.
   * </p>
   * <p>
   * The fundamental difference between the POST and PUT requests is reflected
   * in the different meaning of the Request-URI. The URI in a POST request
   * identifies the resource that will handle the enclosed entity. That resource
   * might be a data-accepting process, a gateway to some other protocol, or a
   * separate entity that accepts annotations. In contrast, the URI in a PUT
   * request identifies the entity enclosed with the request -- the user agent
   * knows what URI is intended and the server MUST NOT attempt to apply the
   * request to some other resource. If the server desires that the request be
   * applied to a different URI,
   * </p>
   * <p>
   * it MUST send a 301 (Moved Permanently) response; the user agent MAY then
   * make its own decision regarding whether or not to redirect the request.
   * </p>
   * <p>
   * A single resource MAY be identified by many different URIs. For example, an
   * article might have a URI for identifying "the current version" which is
   * separate from the URI identifying each particular version. In this case, a
   * PUT request on a general URI might result in several other URIs being
   * defined by the origin server.
   * </p>
   * <p>
   * HTTP/1.1 does not define how a PUT method affects the state of an origin
   * server.
   * </p>
   * <p>
   * PUT requests MUST obey the message transmission requirements set out in
   * section 8.2.
   * </p>
   * <p>
   * Unless otherwise specified for a particular entity-header, the
   * entity-headers in the PUT request SHOULD be applied to the resource created
   * or modified by the PUT.
   * </p>
   * 
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  void doPut(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException;

  /**
   * @param response
   */
  void setHandlerHeaders(HttpServletRequest request,
      HttpServletResponse response);

  /**
   * Sends an error to the client
   * 
   * @param ex
   * @throws IOException
   */
  void sendError(HttpServletRequest request, HttpServletResponse response,
      Throwable ex) throws IOException;

  /**
   * Serailize a Map strucutre to the output stream
   * 
   * @param uploads
   * @throws IOException
   */
  void sendMap(HttpServletRequest request, HttpServletResponse response,
      Map<String, Object> contetMap) throws IOException;

  /**
   * The key the handler is mapped with.
   * 
   * @return
   */
  String getKey();
  
  RestDescription getDescription();
}
