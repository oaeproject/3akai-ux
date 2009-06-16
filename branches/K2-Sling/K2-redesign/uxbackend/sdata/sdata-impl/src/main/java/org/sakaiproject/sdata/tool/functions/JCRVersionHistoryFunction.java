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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.inject.Inject;

import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.sdata.tool.SDataAccessException;
import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.api.ResourceDefinition;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.model.JCRNodeMap;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.jcr.AccessDeniedException;
import javax.jcr.ItemExistsException;
import javax.jcr.Node;
import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.version.Version;
import javax.jcr.version.VersionException;
import javax.jcr.version.VersionHistory;
import javax.jcr.version.VersionIterator;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Performs a move operation on the url in the request, the target is given by the TO
 * parameter, only accepts post.
 */
public class JCRVersionHistoryFunction extends JCRSDataFunction {
  private static final String KEY = "vh";
  private static final RestDescription DESCRIPTION = new RestDescription();
  static {
    DESCRIPTION.setTitle("Version History Function");
    DESCRIPTION.setBackUrl("?doc=1");
    DESCRIPTION
        .setShortDescription("List the version history of a file." + KEY);
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "On GET, lists the version histroy identified by the resource.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_OK),
        "A Node map of the location after the move");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_CONFLICT),
        "If the target already exists, or is locked");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_NOT_FOUND),
        "If the source cant be found");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_FORBIDDEN),
        "If the move operation is denied");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
        "on any other error");

  }
  /**
   * 
   */
  @Inject
  public JCRVersionHistoryFunction() {
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.sakaiproject.sdata.tool.api.SDataFunction#call(org.sakaiproject.sdata
   * .tool.api.Handler, javax.servlet.http.HttpServletRequest,
   * javax.servlet.http.HttpServletResponse, java.lang.Object,
   * org.sakaiproject.sdata.tool.api.ResourceDefinition)
   */
  public void call(Handler handler, HttpServletRequest request,
      HttpServletResponse response, Node target, ResourceDefinition rp)
      throws SDataException {
    try {
      SDataFunctionUtil.checkMethod(request.getMethod(), "GET");

      VersionHistory vh = target.getVersionHistory();
      Map<String, Object> resultMap = Maps.newHashMap();
      List<JCRNodeMap> versions = Lists.newArrayList();
      for (VersionIterator vi = vh.getAllVersions(); vi.hasNext();) {
        Version v = vi.nextVersion();
        JCRNodeMap nm = new JCRNodeMap(v, 1, rp);
        versions.add(nm);
      }
      resultMap.put("versions", versions);
      handler.sendMap(request, response, resultMap);

    } catch (IOException e) {
      throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "IO Error "
          + e.getMessage());
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
