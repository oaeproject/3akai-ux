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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.inject.Inject;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.social.FriendsResolverService;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserProfile;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.model.FriendBean;
import org.sakaiproject.kernel.model.FriendStatus;
import org.sakaiproject.kernel.model.FriendsBean;
import org.sakaiproject.kernel.model.FriendsIndexBean;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.jcr.RepositoryException;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * The rest friends provider provides management of friends lists. These are stored in a
 * known place with metadata, as a json file. The service works on the basis of adding and
 * removing friends records from a json file.
 */
public class RestFriendsProvider implements RestProvider, Initialisable {

  private static final RestDescription DESC = new RestDescription();

  private static final String KEY = "friend";

  static {
    DESC.setTitle("Friends");
    DESC.setBackUrl("../__describe__");
    DESC.setShortDescription("Managed Friend Pairs");
    DESC.addSection(1, "Introduction",
        "This service allows the management of a friends list.");
    DESC
        .addSection(
            2,
            "Connect ",
            "A client may request a connection to a friend, with with the connect/request service. This starts a simple workflow"
                + "between the users. Once requesting, the requesting user may cancel the request. The invited friend may accept, reject or ignore"
                + "the request. For all these actions the response status code is "
                + HttpServletResponse.SC_OK
                + ", if the operation is denied "
                + "as a result of a conflicting record the response status code is  "
                + HttpServletResponse.SC_CONFLICT);
    DESC
        .addSection(
            2,
            "Status ",
            "Responds with the current users friends records. Super admins may request other users friends records.  ");

    DESC
        .addURLTemplate(
            "/rest/" + KEY + "/" + PathElement.status + "/" + "/<userid>",
            "Accepts GET to remove get the friend list for a user. A super user may specify the user who is performing the "
                + "accept, otherwise its the current user. ");
    DESC
        .addURLTemplate(
            "/rest/" + KEY + "/" + PathElement.connect + "/" + PathElement.request
                + "/<userid>",
            "Accepts POST to invite a friend to this user id. A super user may specify the user who is performing the "
                + "invite, otherwise its the current user. The post must be accompanied by a text message and a friend to invite.");
    DESC
        .addURLTemplate(
            "/rest/" + KEY + "/" + PathElement.connect + "/" + PathElement.accept
                + "/<userid>",
            "Accepts POST to accept an earlier invitation. A super user may specify the user who is performing the "
                + "accept, otherwise its the current user. The post must be accompanied by friend to accept.");
    DESC
        .addURLTemplate(
            "/rest/" + KEY + "/" + PathElement.connect + "/" + PathElement.reject
                + "/<userid>",
            "Accepts POST to reject an earlier invitation. A super user may specify the user who is performing the "
                + "reject, otherwise its the current user. The post must be accompanied by friend to reject, the target user will be notified.");
    DESC
        .addURLTemplate(
            "/rest/" + KEY + "/" + PathElement.connect + "/" + PathElement.ignore
                + "/<userid>",
            "Accepts POST to ignore an earlier invitation. A super user may specify the user who is performing the "
                + "ignore, otherwise its the current user. The post must be accompanied by friend to reject, the target user will not be notified.");
    DESC
        .addURLTemplate(
            "/rest/" + KEY + "/" + PathElement.connect + "/" + PathElement.cancel
                + "/<userid>",
            "Accepts POST to cancel an earlier invitation. A super user may specify the user who is performing the "
                + "accept, otherwise its the current user. The post must be accompanied by friend to cancel.");
    DESC
        .addURLTemplate(
            "/rest/" + KEY + "/" + PathElement.connect + "/" + PathElement.remove
                + "/<userid>",
            "Accepts POST to remove an earlier connection. A super user may specify the user who is performing the "
                + "accept, otherwise its the current user. The post must be accompanied by friend to cancel.");
    DESC.addSection(2, "POST", "");
    DESC.addParameter(FriendsParams.FRIENDUUID, "the UUID of the friend");
    DESC.addParameter(FriendsParams.FRIENDTYPE,
        "the type of the friend, a string associated with the connection.");
    DESC.addParameter(FriendsParams.FRIENDSTATUS,
        "filter a status request to only retrune the type requested.");
    DESC.addParameter(FriendsParams.MESSAGE,
        "the message associated with the request, required for requests");
    DESC.addParameter(FriendsParams.PAGE,
        "the page of friends to respond with. (optional, default all)");
    DESC.addParameter(FriendsParams.NRESUTS_PER_PAGE,
        "the number of friends per page. (optional, default 10)");
    DESC.addParameter(FriendsParams.SORT, "an array of fields to sort on from "
        + Arrays.toString(FriendsSortField.values()) + " (optional)");
    DESC.addParameter(FriendsParams.SORTORDER, "an array of directions to sort, from "
        + Arrays.toString(FriendsSortOrder.values()) + " (optional)");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_OK),
        "If the action completed Ok");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_CONFLICT),
        "If the request could not be compelted at this time");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_FORBIDDEN),
        "If permission to manage the connection is denied");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
        " Any other error");
  }

  private BeanConverter beanConverter;

  private SessionManagerService sessionManagerService;

  private UserEnvironmentResolverService userEnvironmentResolverService;

  private Map<String, Object> OK = ImmutableMap.of("response", (Object) "OK");

  private EntityManager entityManager;

  private ProfileResolverService profileResolverService;

  private FriendsResolverService friendsResolverService;

  private UserFactoryService userFactoryService;

  private Registry<String, RestProvider> registry;

  private AuthzResolverService authzResolverService;

  private JCRService jcrService;

  @Inject
  public RestFriendsProvider(RegistryService registryService,
      SessionManagerService sessionManagerService,
      UserEnvironmentResolverService userEnvironmentResolverService,
      ProfileResolverService profileResolverService, EntityManager entityManager,
      FriendsResolverService friendsResolverService,
      UserFactoryService userFactoryService, BeanConverter beanConverter,
      AuthzResolverService authzResolverService,
      JCRService jcrService) {
    this.registry = registryService.getRegistry(RestProvider.REST_REGISTRY);
    this.registry.add(this);
    this.beanConverter = beanConverter;
    this.sessionManagerService = sessionManagerService;
    this.userEnvironmentResolverService = userEnvironmentResolverService;
    this.entityManager = entityManager;
    this.profileResolverService = profileResolverService;
    this.friendsResolverService = friendsResolverService;
    this.userFactoryService = userFactoryService;
    this.authzResolverService = authzResolverService;
    this.jcrService = jcrService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.webapp.Initialisable#init()
   */
  public void init() {
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.webapp.Initialisable#destroy()
   */
  public void destroy() {
    registry.remove(this);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestProvider#dispatch(java.lang.String[],
   *      javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void dispatch(String[] elements, HttpServletRequest request,
      HttpServletResponse response) {
    try {
      FriendsParams params = new FriendsParams(elements, request, sessionManagerService,
          userEnvironmentResolverService);
      Map<String, Object> map = Maps.newHashMap();
      switch (params.major) {
      case connect:
        if (!"POST".equals(request.getMethod())) {
          throw new RestServiceFaultException(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
        }
        switch (params.minor) {
        case request:
          map = doRequestConnect(params, request, response);
          break;
        case accept:
          map = doAcceptConnect(params, request, response);
          break;
        case cancel:
          map = doCancelConnect(params, request, response);
          break;
        case reject:
          map = doRejectConnect(params, request, response);
          break;
        case ignore:
          map = doIgnoreConnect(params, request, response);
          break;
        case remove:
          map = doRemoveConnect(params, request, response);
          break;
        default:
          doRequestError();
          break;
        }
        break;
      case status:
        if (!"GET".equals(request.getMethod())) {
          throw new RestServiceFaultException(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
        }
        map = doStatus(params, request, response);
        break;
      default:
        doRequestError();
        break;
      }

      if (map != null) {
        String responseBody = beanConverter.convertToString(map);
        response.setContentType(RestProvider.CONTENT_TYPE);
        response.getOutputStream().print(responseBody);
      }
    } catch (SecurityException ex) {
      throw ex;
    } catch (RestServiceFaultException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new RestServiceFaultException(ex.getMessage(), ex);
    }
  }

  /**
   * @param params
   * @param request
   * @param response
   * @return
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   * @throws IOException
   */
  private Map<String, Object> doRemoveConnect(FriendsParams params,
      HttpServletRequest request, HttpServletResponse response)
      throws JCRNodeFactoryServiceException, RepositoryException, IOException {
    FriendsBean myFriends = friendsResolverService.resolve(params.uuid);
    FriendsBean friendFriends = friendsResolverService.resolve(params.friendUuid);
    if (!myFriends.hasFriend(params.friendUuid) || !friendFriends.hasFriend(params.uuid)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_NOT_FOUND,
          " The friend connection is missing ");
    }
    myFriends.removeFriend(params.friendUuid);
    friendFriends.removeFriend(params.uuid);

    authzResolverService.setRequestGrant("Saving Remove Connect");
    try {
      myFriends.save();
      friendFriends.save();
      jcrService.getSession().save();
    } finally {
      authzResolverService.clearRequestGrant();
    }
    return OK;
  }

  /**
   * @param params
   * @param request
   * @param response
   * @return
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   * @throws IOException
   */
  private Map<String, Object> doRequestConnect(FriendsParams params,
      HttpServletRequest request, HttpServletResponse response)
      throws JCRNodeFactoryServiceException, RepositoryException, IOException {
    FriendsBean myFriends = friendsResolverService.resolve(params.uuid);
    FriendsBean friendFriends = friendsResolverService.resolve(params.friendUuid);
    if (myFriends.hasFriend(params.friendUuid) || friendFriends.hasFriend(params.uuid)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_CONFLICT,
          "There is already a connection invited, pending or accepted ");
    }
    FriendBean friend = new FriendBean(params.uuid, params.friendUuid,
        FriendStatus.PENDING);
    FriendBean me = new FriendBean(params.friendUuid, params.uuid, FriendStatus.INVITED);
    if (!StringUtils.isEmpty(params.type)) {
      me.setProperties(ImmutableMap.of("type", params.type, "message", params.message));
      friend.setProperties(ImmutableMap
          .of("type", params.type, "message", params.message));
    }
    myFriends.addFriend(friend);
    friendFriends.addFriend(me);
    authzResolverService.setRequestGrant("Saving Request Connect");
    try {
      myFriends.save();
      friendFriends.save();
      jcrService.getSession().save();
    } finally {
      authzResolverService.clearRequestGrant();
    }
    return OK;
  }

  /**
   * @param params
   * @param request
   * @param response
   * @return
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   * @throws IOException
   */
  private Map<String, Object> doAcceptConnect(FriendsParams params,
      HttpServletRequest request, HttpServletResponse response)
      throws JCRNodeFactoryServiceException, RepositoryException, IOException {
    FriendsBean myFriends = friendsResolverService.resolve(params.uuid);
    FriendsBean friendFriends = friendsResolverService.resolve(params.friendUuid);
    if (!myFriends.hasFriend(params.friendUuid) || !friendFriends.hasFriend(params.uuid)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_NOT_FOUND,
          " The friend connection is missing ");
    }
    FriendBean myFriendBean = myFriends.getFriend(params.friendUuid);
    FriendBean friendFriendBean = friendFriends.getFriend(params.uuid);
    if (!myFriendBean.isInState(FriendStatus.INVITED)
        || !friendFriendBean.isInState(FriendStatus.PENDING)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_CONFLICT,
          "The invitation to connect is not current");
    }

    myFriendBean.updateStatus(FriendStatus.ACCEPTED);
    friendFriendBean.updateStatus(FriendStatus.ACCEPTED);
    authzResolverService.setRequestGrant("Saving Accept Connect");
    try {
      myFriends.save();
      friendFriends.save();
      jcrService.getSession().save();
    } finally {
      authzResolverService.clearRequestGrant();
    }
    return OK;
  }

  /**
   * @param params
   * @param request
   * @param response
   * @return
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   * @throws IOException
   */
  private Map<String, Object> doCancelConnect(FriendsParams params,
      HttpServletRequest request, HttpServletResponse response)
      throws JCRNodeFactoryServiceException, RepositoryException, IOException {
    FriendsBean myFriends = friendsResolverService.resolve(params.uuid);
    FriendsBean friendFriends = friendsResolverService.resolve(params.friendUuid);
    if (!myFriends.hasFriend(params.friendUuid) || !friendFriends.hasFriend(params.uuid)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_NOT_FOUND,
          " The friend connection is missing ");
    }
    FriendBean myFriendBean = myFriends.getFriend(params.friendUuid);
    FriendBean friendFriendBean = friendFriends.getFriend(params.uuid);
    if (!myFriendBean.isInState(FriendStatus.PENDING)
        || !friendFriendBean.isInState(FriendStatus.INVITED)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_CONFLICT,
          "The invitation to connect is not current");
    }

    myFriends.removeFriend(params.friendUuid);
    friendFriends.removeFriend(params.uuid);
    authzResolverService.setRequestGrant("Saving Cancel Connect");
    try {
      myFriends.save();
      friendFriends.save();
      jcrService.getSession().save();
    } finally {
      authzResolverService.clearRequestGrant();
    }
    return OK;
  }

  /**
   * @param params
   * @param request
   * @param response
   * @return
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   * @throws IOException
   */
  private Map<String, Object> doRejectConnect(FriendsParams params,
      HttpServletRequest request, HttpServletResponse response)
      throws JCRNodeFactoryServiceException, RepositoryException, IOException {
    FriendsBean myFriends = friendsResolverService.resolve(params.uuid);
    FriendsBean friendFriends = friendsResolverService.resolve(params.friendUuid);
    if (!myFriends.hasFriend(params.friendUuid) || !friendFriends.hasFriend(params.uuid)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_NOT_FOUND,
          " The friend connection is missing ");
    }
    FriendBean myFriendBean = myFriends.getFriend(params.friendUuid);
    FriendBean friendFriendBean = friendFriends.getFriend(params.uuid);
    if (!myFriendBean.isInState(FriendStatus.INVITED)
        || !friendFriendBean.isInState(FriendStatus.PENDING)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_CONFLICT,
          "The invitation to connect is not current");
    }

    myFriends.removeFriend(params.friendUuid);
    friendFriends.removeFriend(params.uuid);
    authzResolverService.setRequestGrant("Saving Reject Connect");
    try {
      myFriends.save();
      friendFriends.save();
      jcrService.getSession().save();
    } finally {
      authzResolverService.clearRequestGrant();
    }
    return OK;
  }

  /**
   * @param params
   * @param request
   * @param response
   * @return
   * @throws RepositoryException
   * @throws JCRNodeFactoryServiceException
   * @throws IOException
   */
  private Map<String, Object> doIgnoreConnect(FriendsParams params,
      HttpServletRequest request, HttpServletResponse response)
      throws JCRNodeFactoryServiceException, RepositoryException, IOException {
    FriendsBean myFriends = friendsResolverService.resolve(params.uuid);
    FriendsBean friendFriends = friendsResolverService.resolve(params.friendUuid);
    if (!myFriends.hasFriend(params.friendUuid) || !friendFriends.hasFriend(params.uuid)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_NOT_FOUND,
          " The friend connection is missing ");
    }
    FriendBean myFriendBean = myFriends.getFriend(params.friendUuid);
    FriendBean friendFriendBean = friendFriends.getFriend(params.uuid);
    if (!myFriendBean.isInState(FriendStatus.INVITED)
        || !friendFriendBean.isInState(FriendStatus.PENDING)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_CONFLICT,
          "The invitation to connect is not current");
    }

    myFriends.removeFriend(params.friendUuid);
    friendFriends.removeFriend(params.uuid);
    authzResolverService.setRequestGrant("Saving Ignore Connect");
    try {
      myFriends.save();
      friendFriends.save();
      jcrService.getSession().save();
    } finally {
      authzResolverService.clearRequestGrant();
    }
    return OK;
  }

  /**
   * @param params
   * @param request
   * @param response
   * @return
   * @throws IOException
   * @throws RepositoryException
   * @throws UnsupportedEncodingException
   */
  private Map<String, Object> doStatus(FriendsParams params, HttpServletRequest request,
      HttpServletResponse response) throws UnsupportedEncodingException,
      RepositoryException, IOException {
    FriendsBean myFriends = friendsResolverService.resolve(params.uuid);

    Query query = null;
    StringBuilder sb = new StringBuilder();
    sb.append(FriendsIndexBean.FINDBY_UUID_WITH_SORT);
    if (params.filterStatus != null) {
      sb.append(" and ").append(FriendsIndexBean.FRIENDS_STATUS_FIELD).append(" = :")
          .append(FriendsIndexBean.PARAM_FRIENDSTATUS);
    }
    if (params.sort != null && params.sort.length > 0) {
      sb.append(" order by ");
      for (int i = 0; i < params.sort.length; i++) {
        if (i != 0) {
          sb.append(",");
        }
        sb.append(" s.").append(params.sort[i]);
        if (params.sortOrder != null && params.sortOrder.length == params.sort.length) {
          sb.append(" ").append(params.sortOrder[i]);
        }
      }
    }
    query = entityManager.createQuery(sb.toString());

    query.setFirstResult(params.start);
    query.setMaxResults(params.end);
    query.setParameter(FriendsIndexBean.PARAM_UUID, params.uuid);
    if (params.filterStatus != null) {
      query.setParameter(FriendsIndexBean.PARAM_FRIENDSTATUS, params.filterStatus
          .toString());
    }

    List<?> results = query.getResultList();
    System.err.println(" Results: " + results.size());

    Map<String, FriendBean> myFriendMap = myFriends.friendsMap();
    Map<String, FriendBean> sortedFriendMap = Maps.newLinkedHashMap();
    for (Object fio : results) {
      FriendsIndexBean fi = (FriendsIndexBean) fio;
      FriendBean fb = myFriendMap.get(fi.getFriendUuid());
      if (fb != null) {
        sortedFriendMap.put(fb.getFriendUuid(), fb);
        UserProfile profile = profileResolverService.resolve(fb.getFriendUuid());
        fb.setProfile(profile.getProperties());
        Map<String, String> properties = fb.getProperties();
        properties.put("userStoragePrefix", userFactoryService.getUserPathPrefix(fb
            .getFriendUuid()));
        fb.setProperties(properties);
      }
    }
    myFriends.setFriends(Lists.newArrayList(sortedFriendMap.values()));

    return ImmutableMap.of("response", "OK", "status", myFriends);
  }

  /**
   *
   */
  private void doRequestError() {
    throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestProvider#getDescription()
   */
  public RestDescription getDescription() {
    return DESC;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return KEY;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getPriority()
   */
  public int getPriority() {
    return 0;
  }

}
