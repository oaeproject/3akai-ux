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
public class JCRCheckInFunction extends JCRSDataFunction {
  private static final String KEY = "ci";
  private static final RestDescription DESCRIPTION = new RestDescription();
  static {
    DESCRIPTION.setTitle("CheckIn Function");
    DESCRIPTION.setBackUrl("?doc=1");
    DESCRIPTION
        .setShortDescription("Checkin the current node creating a new version, mapped to function  "
            + KEY);
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "On POST, Performs a checking operation. In the underlying storage, all nodes are created in a"
                + " checked out state where they can be writen to. On checking, a checked in read only version of "
                + "the node and its subtree is created and copied to the versioning store. That node cant be "
                + "modified in a checked in state. A new node is checked out to replace the old node. If this "
                + "operation is performed on a folder, then the folder and all its decendents are checked in. "
                + "The user performing the request needs to have write access over the entire subtree being "
                + "checked in.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_OK),
        "The node was checked in Ok.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_NOT_FOUND),
        "If the file or folder cant be found.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_FORBIDDEN),
        "If the checkin operation is denied.");
    DESCRIPTION
        .addResponse(
            String.valueOf(HttpServletResponse.SC_CONFLICT),
            "The node is not versionable or the node is already checked in, or there is a decendent node "
                + "that is preventing the checkin operation.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
        "on any other error");

  }

  /**
   * 
   */
  @Inject
  public JCRCheckInFunction() {
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

      if (target.isCheckedOut()) {
        try {
          target.checkin();
          // check the new node out again
          target.checkout();
        } catch (VersionException e) {
          throw new SDataException(HttpServletResponse.SC_CONFLICT,
              "The resource or one of its decendents has a conflict that "
                  + "prevents it from being versioned, cause:" + e.getMessage());

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
