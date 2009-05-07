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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.util.PathUtils;
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
import javax.jcr.Session;
import javax.jcr.Workspace;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.version.VersionException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Performs a move operation on the url in the request, the target is given by
 * the TO parameter, only accepts post.
 */
public class JCRCopyFunction extends JCRSDataFunction {
  public static final String TO = "to";
  private static final Log LOG = LogFactory.getLog(JCRCopyFunction.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private static final String KEY = "cp";
  private static final RestDescription DESCRIPTION = new RestDescription();
  static {
    DESCRIPTION.setTitle("Copy Function");
    DESCRIPTION.setBackUrl("?doc=1");
    DESCRIPTION
        .setShortDescription("Copy the resource identified by the URL from one location "
            + "to annother, mapped to function  " + KEY);
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "On POST, Performs a copy operation on the url in the request, the target is given by the 'to' parameter");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_OK),
        "A Node map of the location after the copy");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_CONFLICT),
        "If the target already exists, or is locked");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_NOT_FOUND),
        "If the source cant be found");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_FORBIDDEN),
        "If the move operation is denied");
    DESCRIPTION.addResponse(String
        .valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
        "on any other error");

  }
  private JCRService jcrService;
  private JCRNodeFactoryService jcrNodeFactoryService;

  /**
   * 
   */
  @Inject
  public JCRCopyFunction(JCRService jcrService,
      JCRNodeFactoryService jcrNodeFactoryService) {
    this.jcrService = jcrService;
    this.jcrNodeFactoryService = jcrNodeFactoryService;
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.sakaiproject.sdata.tool.api.SDataFunction#call(org.sakaiproject.sdata
   * .tool.api.Handler, javax.servlet.http.HttpServletRequest,
   * javax.servlet.http.HttpServletResponse, java.lang.Object,
   * org.sakaiproject.sdata.tool.api.ResourceDefinition)
   */
  public void call(Handler handler, HttpServletRequest request,
      HttpServletResponse response, Node target, ResourceDefinition rp)
      throws SDataException {
    try {
      SDataFunctionUtil.checkMethod(request.getMethod(), "POST");
      String targetPath = request.getParameter(TO);
      if (targetPath == null || targetPath.trim().length() == 0) {
        throw new SDataException(HttpServletResponse.SC_BAD_REQUEST,
            "No Target folder for the copy specified ");
      }
      String repositoryTargetPath = targetPath;
      String repositorySourcePath = rp.getRepositoryPath();

      LOG.info("Copying " + repositorySourcePath + " to " + repositoryTargetPath
          + " specified by " + targetPath);

      Session session = jcrService.getSession();
      
      // create the parent if it doesnt exist.
      String targetParent = PathUtils.getParentReference(targetPath);
      Node targetNode = null;
      try {
        targetNode = jcrNodeFactoryService.getNode(targetPath);
      } catch ( JCRNodeFactoryServiceException e) {
        if (debug)
          LOG.debug("Node Does not exist ");
      }
      if ( targetNode == null ) {
        targetNode = jcrNodeFactoryService.createFolder(targetParent);
        // the node *must* be saved to make it available to the move.
        targetNode.getParent().save();
      }

      
      Workspace workspace = session.getWorkspace();
      workspace.copy(repositorySourcePath, repositoryTargetPath);
      Node n = jcrNodeFactoryService.getNode(repositoryTargetPath);
      response.setStatus(HttpServletResponse.SC_OK);

      JCRNodeMap nm = new JCRNodeMap(n, rp.getDepth(), rp);
      try {
        handler.sendMap(request, response, nm);
      } catch (IOException e) {
        throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
            "IO Error " + e.getMessage());
      }

    } catch (AccessDeniedException e) {
      throw new SDataAccessException(HttpServletResponse.SC_FORBIDDEN, e
          .getMessage());
    } catch (ItemExistsException e) {
      throw new SDataAccessException(HttpServletResponse.SC_CONFLICT, e
          .getMessage());
    } catch (PathNotFoundException e) {
      throw new SDataAccessException(HttpServletResponse.SC_NOT_FOUND, e
          .getMessage());
    } catch (VersionException e) {
      throw new SDataAccessException(HttpServletResponse.SC_CONFLICT, e
          .getMessage());
    } catch (ConstraintViolationException e) {
      throw new SDataAccessException(HttpServletResponse.SC_CONFLICT, e
          .getMessage());
    } catch (LockException e) {
      throw new SDataAccessException(HttpServletResponse.SC_CONFLICT, e
          .getMessage());
    } catch (RepositoryException e) {
      throw new SDataAccessException(
          HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
    } catch (JCRNodeFactoryServiceException e) {
      throw new SDataAccessException(HttpServletResponse.SC_NOT_FOUND, e
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
