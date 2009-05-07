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

import com.google.inject.Inject;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.sdata.tool.SDataAccessException;
import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.api.ResourceDefinition;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.model.JCRNodeMap;

import java.io.IOException;

import javax.jcr.AccessDeniedException;
import javax.jcr.ItemExistsException;
import javax.jcr.Node;
import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;
import javax.jcr.UnsupportedRepositoryOperationException;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.version.VersionException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Checks the target node in creating a new version of the node and its children. This can
 * be expensive if the node is the root of a large subtree.
 */
public class JCRRevertFunction extends JCRSDataFunction {
  private static final String KEY = "rv";
  private static final RestDescription DESCRIPTION = new RestDescription();
  private static final String VERSION = "v";
  static {
    DESCRIPTION.setTitle("Revert Function");
    DESCRIPTION.setBackUrl("?doc=1");
    DESCRIPTION.setShortDescription("Reverts the version by the " + VERSION
        + " property to become the current version." + KEY);
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "On POST, Reverts a previously checked in version to become the current working version. The version name should be taken from the version history.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_OK),
        "The node was reverted Ok, response will contain the meta data of the new node.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_NOT_FOUND),
        "If the file or folder cant be found.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_FORBIDDEN),
        "If the revert operation is denied.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
        "on any other error");

  }

  /**
   *
   */
  @Inject
  public JCRRevertFunction() {
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.sdata.tool.api.SDataFunction#call(org.sakaiproject.sdata.tool.api.Handler,
   *      javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse,
   *      javax.jcr.Node, org.sakaiproject.sdata.tool.api.ResourceDefinition)
   */
  public void call(Handler handler, HttpServletRequest request,
      HttpServletResponse response, Node target, ResourceDefinition rp)
      throws SDataException {
    try {
      SDataFunctionUtil.checkMethod(request.getMethod(), "POST");
      String revertVersion = request.getParameter(VERSION);
      if ( StringUtils.isEmpty(revertVersion)) {
        throw new SDataException(HttpServletResponse.SC_BAD_REQUEST,"You must provide a version to revert in the "+VERSION+" parameter");
      }

      if (target.isCheckedOut()) {
        try {
          target.restore(revertVersion, false);
          target.refresh(false);
        } catch (VersionException e) {
          throw new SDataException(HttpServletResponse.SC_CONFLICT,
              "The requested version is not a previous version of this node, or the node is " +
              "the root node, either way this operation is not possible. cause:" + e.getMessage());

        } catch (UnsupportedRepositoryOperationException e) {
          throw new SDataException(HttpServletResponse.SC_CONFLICT,
              "The resource cannot be versioned " + e.getMessage());

        }
        response.setStatus(HttpServletResponse.SC_OK);
        JCRNodeMap nm = new JCRNodeMap(target, rp.getDepth(), rp);
        try {
          handler.sendMap(request, response, nm);
        } catch (IOException e) {
          throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
              "IO Error " + e.getMessage());
        }
      } else {
        throw new SDataException(HttpServletResponse.SC_CONFLICT,
            "The resource is already checked in");

      }

    } catch (AccessDeniedException e) {
      throw new SDataAccessException(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
    } catch (ItemExistsException e) {
      throw new SDataAccessException(HttpServletResponse.SC_CONFLICT, e.getMessage());
    } catch (PathNotFoundException e) {
      throw new SDataAccessException(HttpServletResponse.SC_NOT_FOUND, e.getMessage());
    } catch (VersionException e) {
      throw new SDataAccessException(HttpServletResponse.SC_CONFLICT, e.getMessage());
    } catch (ConstraintViolationException e) {
      throw new SDataAccessException(HttpServletResponse.SC_CONFLICT, e.getMessage());
    } catch (LockException e) {
      throw new SDataAccessException(HttpServletResponse.SC_CONFLICT, e.getMessage());
    } catch (RepositoryException e) {
      throw new SDataAccessException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e
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
   *
   * @see org.sakaiproject.sdata.tool.api.SDataFunction#getDescription()
   */
  public RestDescription getDescription() {
    return DESCRIPTION;
  }

}
