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

package org.sakaiproject.sdata.tool.functions;

import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.api.ResourceDefinition;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.model.JCRNodeMap;

import java.io.IOException;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This has not been implemented as yet.
 * 
 * @author ieb
 */
public class JCRNodeMetadata extends JCRSDataFunction {

  private static final String KEY = "m";
  private static final RestDescription DESCRIPTION = new RestDescription();
  static {
    DESCRIPTION.setTitle("Metadata Function");
    DESCRIPTION.setBackUrl("?doc=1");
    DESCRIPTION
        .setShortDescription("Returns the metadata on a node and the child " +
        		"tree, mapped to function  " + KEY);
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "On GET, Returns structured medata data on the node identified by the URL." +
            "The metadata is controlled by the hander managing this function.");
    DESCRIPTION.addResponse(String
        .valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
        "on any other error");

  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.sakaiproject.sdata.tool.api.SDataFunction#call(org.sakaiproject.sdata
   * .tool.api.Handler, javax.servlet.http.HttpServletRequest,
   * javax.servlet.http.HttpServletResponse, java.lang.Object)
   */
  public void call(Handler handler, HttpServletRequest request,
      HttpServletResponse response, Node target, ResourceDefinition rp)
      throws SDataException {
    SDataFunctionUtil.checkMethod(request.getMethod(), "GET");
    try {
      Node n = (Node) target;
      JCRNodeMap nm = new JCRNodeMap(n, rp.getDepth(), rp);
      handler.sendMap(request, response, nm);
    } catch (RepositoryException rex) {
      throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
          rex.getMessage());
    } catch (IOException e) {
      throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e
          .getMessage());
    }

  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.sdata.tool.api.SDataFunction#getKey()
   */
  public String getKey() {
    return KEY;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.sdata.tool.api.SDataFunction#getDescription()
   */
  public RestDescription getDescription() {
    return DESCRIPTION;
  }

}
