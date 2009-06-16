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

import org.sakaiproject.kernel.api.authz.AccessControlStatement;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.authz.ReferencedObject;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.api.ResourceDefinition;
import org.sakaiproject.sdata.tool.api.SDataException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.jcr.AccessDeniedException;
import javax.jcr.Node;
import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This has not been implemented as yet.
 * 
 * @author ieb
 */
public class JCRPermissionsFunction extends JCRSDataFunction {
  private static final String KEY = "pe";
  private static final RestDescription DESCRIPTION = new RestDescription();
  private static final String ACTION_PARAM = "action";
  private static final String ACS_PARAM = "acl";
  static {
    DESCRIPTION.setTitle("Permissions Function");
    DESCRIPTION.setBackUrl("?doc=1");
    DESCRIPTION
        .setShortDescription("Manages permissions on a node , mapped to function  "
            + KEY);
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "This function lists the permissions on a node, in two parts. The permission on the node, and "
                + "then the permissions"
                + "inherited acls listed in order of decreasing significance. On POST, the "
                + "function will update the ACL based on the "
                + ACTION_PARAM
                + " parameter. ACS statements are implementation dependant, but the current format is of the "
                + "form k:*,s:SU,g:1,p:1 ");
    DESCRIPTION
        .addSection(
            3,
            "ACS Format",
            "The values are a , seperated list of key value pairs seperated by  "
                + "<ul><li><em>k:</em> is the Key Prefix which is used to select the set of ACS's in the ACL, "
                + "* is a wildcard matching all tokens. </li>"
                + "<li><em>s:</em> is the subject identifying the group that the ACS eg group"
                + "<ul>"
                + "<li><em>g:1</em> means granted,</li>"
                + "<li><em>g:0</em> means denied</li>"
                + "<li><em>p:1</em> means propagating (to child nodes)</li>"
                + "<li><em>p:0</em> means non propagating or blocking.</li>"
                + "</ul></li></ul>"
                + "<p>There are several types of subject see SubjectStatement.SubjectType for an uptodate list</p>"
                + "<ul><li><em>US</em> The subject represents a user, the permission token will be ignored and the "
                + "subject token will be used for matching. eg s:US:ib236</li>"
                + "<li><em>SU</em> The Super user</li>"
                + "<li><em>OW</em> The owner of the node.</li>"
                + "<li><em>GR</em> The subject represents a group, the subject token and the permission "
                + "token will be consulted during resolution. eg s:GROUP:group22:maintain</li>"
                + "<li><em>AN</em> Indicates the statement represents all users in all contexts. eg s:AN</li>"
                + "<li><em>AU</em> Indicates the statement represents all authenticated users. eg s:AU</li>"
                + "<li><em>UN</em> Indicates and undefined subject statement that should be ignored.</li>"
                + "<li><em>PR</em> Provided come from external providers. s:PR:providerKey:additional_provider_data "
                + "The provider, identified by providerKey in the Registry <em>subjectstatement.provider</em> will "
                + "be invoked to resolve the authz check. </li></ul>", true);
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_OK),
        "A map of arrays for the permissions at each node");
    DESCRIPTION.addResponse(String
        .valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
        "on any other error");
    DESCRIPTION.addParameter(ACTION_PARAM,
        "A single value indicating what the POST should do, add, remove or replace. "
            + "'add' will add a new ACS to the end of the ACL."
            + "'replace' will replace the enture ACS and "
            + "'remove' will remove the ACS's listed, if they match"
            + "'clear' will remove the ACL alltogether");
    DESCRIPTION
        .addParameter(
            ACS_PARAM,
            "An ACL to be applied to the target location in the content store according to the action requested ");

  }

  private ReferenceResolverService referenceResolverService;

  /**
   * 
   */
  @Inject
  public JCRPermissionsFunction(
      ReferenceResolverService referenceResolverService) {
    this.referenceResolverService = referenceResolverService;
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
    SDataFunctionUtil.checkMethod(request.getMethod(), "POST|GET");
    try {
      if ("GET".equals(request.getMethod())) {
        ReferencedObject referenceObject = referenceResolverService
            .resolve(target.getPath());
        Map<String, Object> accessControlListMap = getAclMap(referenceObject);

        handler.sendMap(request, response, accessControlListMap);
      } else {

        // post and update
        AclAction action = AclAction
            .valueOf(request.getParameter(ACTION_PARAM));
        String[] acss = request.getParameterValues(ACS_PARAM);
        List<AccessControlStatement> acsList = Lists.newArrayList();
        for (String acs : acss) {
          acsList.add(referenceResolverService.newAccessControlStatement(acs));
        }
        ReferencedObject referenceObject = referenceResolverService
            .resolve(target.getPath());
        List<AccessControlStatement> acl = referenceObject
            .getAccessControlList();
        switch (action) {
        case add:
          acl.addAll(acsList);
          break;
        case clear:
          acl.clear();
          break;
        case remove:
          acl.removeAll(acsList);
          break;
        case replace:
          acl.clear();
          acl.addAll(acsList);
          break;
        }
        referenceObject.setAccessControlList(acl);

        Map<String, Object> accessControlListMap = getAclMap(referenceObject);

        handler.sendMap(request, response, accessControlListMap);

      }

    } catch (IllegalArgumentException e) {
      throw new SDataException(HttpServletResponse.SC_BAD_REQUEST, e
          .getMessage());
    } catch (AccessDeniedException e) {
      throw new SDataException(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
    } catch (PathNotFoundException e) {
      throw new SDataException(HttpServletResponse.SC_NOT_FOUND, e.getMessage());
    } catch (RepositoryException e) {
      throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e
          .getMessage());
    } catch (IOException e) {
      throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e
          .getMessage());
    }
  }

  /**
   * @param referenceObject
   * @return
   */
  private Map<String, Object> getAclMap(ReferencedObject referenceObject) {
    Map<String, Object> accessControlListMap = Maps.newLinkedHashMap();
    while (referenceObject != null && !referenceObject.isRoot()) {
      List<String> accessControlList = Lists.newArrayList();
      for (AccessControlStatement acs : referenceObject.getAccessControlList()) {
        accessControlList.add(acs.toString());
      }
      accessControlListMap.put(referenceObject.getKey(), accessControlList);
      referenceObject = referenceObject.getParent();
    }
    return accessControlListMap;
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
