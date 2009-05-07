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
package org.sakaiproject.kernel.rest.friends;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.model.FriendStatus;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.util.Arrays;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A parameter parser and validator.
 */
public class FriendsParams {
  static final String FRIENDUUID = "friendUuid";

  static final String FRIENDTYPE = "friendType";
  static final String FRIENDSTATUS = "friendStatus";

  static final String MESSAGE = "message";

  static final String NRESUTS_PER_PAGE = "n";
  static final String PAGE = "p";
  static final String SORT = "s";

  public static final String SORTORDER = "o";

  String friendUuid;
  String message;
  String uuid;
  String type;
  int page;
  int numberPerPage;
  FriendsSortField[] sort;
  FriendsSortOrder[] sortOrder;
  FriendStatus filterStatus;
  PathElement major;
  PathElement minor;

  int start;

  int end;

  /**
   * @param request
   */
  public FriendsParams(String[] elements, HttpServletRequest request,
      SessionManagerService sessionManagerService,
      UserEnvironmentResolverService userEnvironmentResolverService) {
    if (elements.length < 2) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          "The request is invalid, expected more than 2 path elements, got "+elements.length);
    }
    try {
      major = PathElement.valueOf(elements[1]);
    } catch (IllegalArgumentException ex) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          "The is invalid /" + StringUtils.join(elements, '/'));
    }
    if (elements.length < major.nelements) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          "The request is invalid expecting "+major.nelements+" path elements, found "+Arrays.toString(elements));
    }
    if (major.nelements > 2) {
      try {
        minor = PathElement.valueOf(elements[2]);
      } catch (IllegalArgumentException ex) {
        throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
            "The is invalid /" + StringUtils.join(elements, '/'));
      }
    } else {
      minor = PathElement.UNDEFINED;
    }
    if (elements.length < minor.nelements) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          "The request is invalid "+major.nelements+" path elements, found "+Arrays.toString(elements));
    }
    for (String p : major.required) {
      if (StringUtils.isEmpty(p)) {
        throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
            p + " must be specified");

      }
    }
    for (String p : minor.required) {
      if (StringUtils.isEmpty(p)) {
        throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
            p + " must be specified");

      }
    }
    uuid = request.getRemoteUser();
    if (elements.length > 3) {
      Session session = sessionManagerService.getCurrentSession();
      UserEnvironment userEnvironment = userEnvironmentResolverService
          .resolve(session);
      if (userEnvironment.isSuperUser()) {
        uuid = elements[3];
      } else {
        throw new RestServiceFaultException(HttpServletResponse.SC_FORBIDDEN,
            "Only a super user is allowed to perform friends operations on other users.");
      }
    }

    friendUuid = request.getParameter(FRIENDUUID);
    type = request.getParameter(FRIENDTYPE);
    String friendStatusParam = request.getParameter(FRIENDSTATUS);
    message = request.getParameter(MESSAGE);
    String pageParam = request.getParameter(PAGE);
    String nperPageParam = request.getParameter(NRESUTS_PER_PAGE);
    String[] sortParam = request.getParameterValues(SORT);
    String[] sortOrderParam = request.getParameterValues(SORTORDER);
    page = 0;
    numberPerPage = 10;
    try {
      page = Integer.parseInt(pageParam);
    } catch (Exception ex) {
      page = 0;
    }
    try {
      numberPerPage = Integer.parseInt(nperPageParam);
    } catch (Exception ex) {
      numberPerPage = 10;
    }

    start = page * numberPerPage;
    end = (page + 1) * numberPerPage;

    if (friendStatusParam != null && friendStatusParam.trim().length() > 0) {
      try {
        filterStatus = FriendStatus.valueOf(friendStatusParam);
      } catch (IllegalArgumentException ex) {
        throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
            "Invalid friendStatus parameter " + friendStatusParam
                + " should be one of " + Arrays.toString(FriendStatus.values()));
      }
    }

    if (sortParam != null && sortParam.length > 0) {
      sort = new FriendsSortField[sortParam.length];
      for (int i = 0; i < sortParam.length; i++) {
        try {
          sort[i] = FriendsSortField.valueOf(sortParam[i]);
        } catch (IllegalArgumentException ex) {
          throw new RestServiceFaultException(
              HttpServletResponse.SC_BAD_REQUEST, "Invalid sort field "
                  + sortParam[i] + " should be one of "
                  + Arrays.toString(FriendsSortField.values()));
        }
      }
    }

    if (sortOrderParam != null && sortOrderParam.length > 0) {
      if (sortOrderParam.length != sort.length) {
        throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
            "If specified the sort order directoin array"
                + " must be the same size as the number of fields.");
      }
      sortOrder = new FriendsSortOrder[sortParam.length];
      for (int i = 0; i < sortOrderParam.length; i++) {
        try {
          sortOrder[i] = FriendsSortOrder.valueOf(sortOrderParam[i]);
        } catch (IllegalArgumentException ex) {
          throw new RestServiceFaultException(
              HttpServletResponse.SC_BAD_REQUEST, "Invalid sort order field "
                  + sortOrderParam[i] + " should be one of "
                  + Arrays.toString(FriendsSortOrder.values()));
        }
      }

    }

  }
}
