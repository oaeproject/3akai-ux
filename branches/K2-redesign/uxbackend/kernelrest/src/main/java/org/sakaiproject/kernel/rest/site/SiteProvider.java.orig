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
package org.sakaiproject.kernel.rest.site;

import com.google.inject.Inject;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionDeniedException;
import org.sakaiproject.kernel.api.authz.PermissionQuery;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;
import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.MembershipHandler;
import org.sakaiproject.kernel.api.site.SiteException;
import org.sakaiproject.kernel.api.site.SiteService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.model.SiteBean;
import org.sakaiproject.kernel.util.PathUtils;
import org.sakaiproject.kernel.util.rest.CollectionOptions;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.util.user.AnonUser;
import org.sakaiproject.kernel.webapp.Initialisable;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

/**
 *
 */
@Path("/site")
public class SiteProvider implements Documentable, JaxRsSingletonProvider, Initialisable {

  private static final String OK = "{\"response\", \"OK\"}";
  private SessionManagerService sessionManagerService;
  private Registry<String, JaxRsSingletonProvider> jaxRsSingletonRegistry;
  private SiteService siteService;
  private UserEnvironmentResolverService userEnvironmentResolverService;
  private BeanConverter beanConverter;
  private AuthzResolverService authzResolverService;
  private PermissionQueryService permissionQueryService;
  private Registry<String, MembershipHandler> membershipHandlerRegistry;
  private static final RestDescription DESC = new RestDescription();
  private static final String SITE_PATH_PARAM = "sitePath";
  private static final String SITE_TYPE_PARAM = "siteType";
  private static final String OWNER_PARAM = "owner";
  private static final String USER_PARAM = "uuserid";
  private static final String MEMBERSHIP_PARAM = "membertoken";
  private static final String NAME_PARAM = "name";
  private static final String DESCRIPTION_PARAM = "description";
  private static final String ROLES_ADD_PARAM = "addrole";
  private static final String ROLES_REMOVE_PARAM = "removerole";
  private static final String JOINABLE_PARAM = "joinas";
  static {
    DESC.setTitle("Site Service");
    DESC.setShortDescription("The rest service to support site management");
    DESC.setTitle("Site");
    DESC.setShortDescription("Creates a site and adds the current user as the owner.");
    DESC.addSection(1, "Introduction", "");
    DESC.addSection(2, "Check ID", "Checks to see if the site ID exists, if it does a "
        + HttpServletResponse.SC_OK
        + " is returned and the site object as json, if it does not exist a "
        + HttpServletResponse.SC_NOT_FOUND + " is returned ");
    DESC
        .addSection(
            3,
            "Create",
            "Create a Site, returns {response: 'OK'} if the creation worked with a response code of 200. "
                + "If permission is denied a 403 will be returned, if the site exists a 409 will be returned, "
                + "any other error will be a 500. When the site is created at the location it will be allocated"
                + "a permanent ID that will stay with the site whereever its moved to in the future."
                + "The call expects the following parameters:"
                + " Path, the remainder of the URL "
                + ","
                + NAME_PARAM
                + ","
                + DESCRIPTION_PARAM
                + ","
                + SITE_TYPE_PARAM
                + ","
                + ROLES_ADD_PARAM
                + " (optional)," + JOINABLE_PARAM + " (optional) ");
    DESC.addURLTemplate("/_rest/site/create",
        "Accepts POST to create a site, see the section on Create for details");
    DESC
        .addURLTemplate(
            "/_rest/site/update",
            "Accepts POST to update a site. If the site does not exist a 404 is returned. THe parameters are "
                + "the same as for the create operation with the addition that all parameters are optional, and "
                + "where they are not supplied no change is made. There is an additional parameter "
                + ROLES_REMOVE_PARAM
                + " a list of role:permissions that are removed from the site");
    DESC.addURLTemplate("/_rest/site/get/<siteId>",
        "Accepts GET to check if a site exists, see the secion on Check ID");
    DESC.addURLTemplate("/_rest/site/members/add/<siteId>",
        "Accepts POST to add the specified user ids (in the uuserid parameter (as an array)), "
            + "with the membership specified in a corresponding array (membertoken). "
            + " The member token is usually the role within a site.");
    DESC
        .addURLTemplate(
            "/_rest/site/members/remove/<siteId>",
            "Accepts POST to remove the specified user ids (in the uuserid parameter (as an array)), "
                + "with the membership specified in a corresponding array (membertoken). "
                + " The member token is usually the role within a site.");
    DESC
        .addURLTemplate(
            "/_rest/site/owner/add/<siteId>",
            "Accepts POST to add the specified user id (in the owner paramerer) as an owner to the site id, "
                + "the current user must be a owner of the site.");
    DESC
        .addURLTemplate(
            "/_rest/site/owner/remove/<siteId>",
            "Accepts POST to remove the specified user id (in the owner parameter) as an owner to the site id, "
                + "the current user must be a owner of the site, and there must be at least 1 owner after the specified user"
                + "is removed from the list of owners.");
    DESC
        .addURLTemplate(
            "/_rest/site/join/<siteId>",
            "On POST, if the user is logged in, and the site has a joining role defined the user is joined "
                + "in that role. Otherwise a 404 is returned as the site is not joinable and we should not "
                + "publicise the site by this means.");
    DESC
        .addURLTemplate(
            "/_rest/site/unjoin/<siteId>",
            "On POST, if the user is logged in, and the site has a joining role defined the user is un-joined "
                + " from the role specified in the "
                + MEMBERSHIP_PARAM
                + " parameter. If the site was not joinable, then the user "
                + " may not unjoin");
    DESC.addParameter(NAME_PARAM, "The Site Name");
    DESC.addParameter(DESCRIPTION_PARAM, "The Site Description");
    DESC.addParameter(SITE_TYPE_PARAM, "The Site Type");
    DESC
        .addParameter(OWNER_PARAM, "The Site Owner, only available to owners of the site");
    DESC.addParameter(USER_PARAM, "An array of unique user ids");
    DESC
        .addParameter(MEMBERSHIP_PARAM,
            "An array of membership types, or in the case of unjoin a single membership token");
    DESC.addParameter(ROLES_ADD_PARAM,
        "An array of role permissions to add in the form role:permission ");
    DESC.addParameter(ROLES_REMOVE_PARAM,
        "An array of role permissions in to remove the form role:permission ");
    DESC
        .addParameter(
            JOINABLE_PARAM,
            "The membership type of new members, if null or empty then the site may not be joined or unjoined.");
    DESC.addParameter(CollectionOptions.START_INDEX,
        "A single value parameter used to page lists of memembers.");
    DESC.addParameter(CollectionOptions.COUNT,
        "A single value parameter, the number of items to return.");
    DESC.addParameter(CollectionOptions.SORT_BY, "An array of fields to sort by");
    DESC
        .addParameter(CollectionOptions.SORT_ORDER,
            "An array of 'asc' or 'desc' denoting the sort order of each corresponding field.");
    DESC.addParameter(CollectionOptions.FILTER_BY,
        "An array of filter fields, an and operation is performed on multiple fields.");
    DESC.addParameter(CollectionOptions.FILTER_OPERATION,
        "An array of filter operations, '=', '<', '>' and 'like' are supported.");
    DESC.addParameter(CollectionOptions.FILTER_VALUE, "An array of filter values.");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_OK),
        "If the action completed Ok, or if the site exits");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_CONFLICT),
        "If a site exists when trying to create a site");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_FORBIDDEN),
        "If permission to create the site is denied");
    DESC.addResponse(String.valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR),
        " Any other error");

  }

  /**
   *
   */
  @Inject
  public SiteProvider(RegistryService registryService, SiteService siteService,
      UserEnvironmentResolverService userEnvironmentResolverService,
      SessionManagerService sessionManagerService, BeanConverter beanConverter,
      AuthzResolverService authzResolverService,
      PermissionQueryService permissionQueryService) {
    jaxRsSingletonRegistry = registryService
        .getRegistry(JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY);

    jaxRsSingletonRegistry.add(this);

    membershipHandlerRegistry = registryService
        .getRegistry(MembershipHandler.MEMBERSHIP_HANDLER_REGISTRY);
    this.siteService = siteService;
    this.userEnvironmentResolverService = userEnvironmentResolverService;
    this.sessionManagerService = sessionManagerService;
    this.beanConverter = beanConverter;
    this.authzResolverService = authzResolverService;
    this.permissionQueryService = permissionQueryService;
  }

  /**
   * @param path
   * @param type
   * @return
   */
  @POST
  @Path("/create/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String createSite(@PathParam(SITE_PATH_PARAM) String path,
      @FormParam(SITE_TYPE_PARAM) String type, @FormParam(NAME_PARAM) String name,
      @FormParam(DESCRIPTION_PARAM) String description,
      @FormParam(ROLES_ADD_PARAM) String[] roles,
      @FormParam(JOINABLE_PARAM) String joningMembershipType) {
    try {
      User u = getAuthenticatedUser();
      path = PathUtils.normalizePath(path);

      authzResolverService.check(path, permissionQueryService
          .getPermission(PermissionQuery.CREATE_SITE));
      authzResolverService.setRequestGrant("Create Site Granted");

      SiteBean siteBean = siteService.createSite(path, type);
      siteBean.addOwner(u.getUuid());
      siteBean.setDescription(description);
      siteBean.setName(name);
      siteBean.addRoles(roles);
      siteBean.setJoiningMembership(joningMembershipType);

      userEnvironmentResolverService
          .addMembership(u.getUuid(), siteBean.getId(), "owner");
      siteBean.save();

    } catch (SiteException e) {
      throw new WebApplicationException(e, Status.CONFLICT);
    } catch (WebApplicationException e) {
      throw e;
    } catch (PermissionDeniedException e) {
      throw new WebApplicationException(e, Status.FORBIDDEN);
    } catch (Exception e) {
      throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
    }
    return OK;
  }

  /**
   * @param path
   * @param type
   * @return
   */
  @POST
  @Path("/update/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String updateSite(@PathParam(SITE_PATH_PARAM) String path,
      @FormParam(SITE_TYPE_PARAM) String type, @FormParam(NAME_PARAM) String name,
      @FormParam(DESCRIPTION_PARAM) String description,
      @FormParam(ROLES_ADD_PARAM) String[] toAdd,
      @FormParam(ROLES_REMOVE_PARAM) String[] toRemove,
      @FormParam(JOINABLE_PARAM) String joiningMembershipType) {
    try {
      path = PathUtils.normalizePath(path);
      authzResolverService.check(path + SiteService.PATH_SITE, permissionQueryService
          .getPermission(PermissionQuery.WRITE));
      if (siteService.siteExists(path)) {
        SiteBean siteBean = siteService.getSite(path);
        if (description != null) {
          siteBean.setDescription(description);
        }
        if (name != null) {
          siteBean.setName(name);
        }
        if (toRemove != null && toRemove.length > 0) {
          siteBean.removeRoles(toRemove);
        }
        if (toAdd != null && toAdd.length > 0) {
          siteBean.addRoles(toAdd);
        }
        if (joiningMembershipType != null) {
          siteBean.setJoiningMembership(joiningMembershipType);
        }
        siteBean.save();
      } else {
        throw new WebApplicationException(Status.NOT_FOUND);
      }
    } catch (SiteException e) {
      throw new WebApplicationException(e, Status.CONFLICT);
    } catch (WebApplicationException e) {
      throw e;
    } catch (Exception e) {
      throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
    }
    return OK;
  }

  /**
   * @param path
   * @return
   */
  @GET
  @Path("/get/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String getSite(@PathParam(SITE_PATH_PARAM) String path) {
    path = PathUtils.normalizePath(path);
    System.err.println("--------------/get/---- " + path);
    String[] siteObjects = new String[path.split(",").length];
    String[] sites = path.substring(1, path.length()).split(",");
    for(int i = 0 ; i < sites.length ; i++){
    	if (siteService.siteExists("/" + sites[i])) {
    	      SiteBean siteBean = siteService.getSite("/" + sites[i]);
    	      if(sites.length == 1){
    	    	  return beanConverter.convertToString(siteBean);
    	      }
    	      siteObjects[i] = beanConverter.convertToString(siteBean);
	    }
    	else{
    		siteObjects[i] = "404";
    	}
    	if(sites.length == 1){
    		throw new WebApplicationException(Response.status(Status.NOT_FOUND).build());
    	}
    }
    return beanConverter.convertToString(siteObjects);
    
  }

  /**
   * @param path
   * @param ownerId
   * @return
   */
  @POST
  @Path("/owner/add/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String addOwner(@PathParam(SITE_PATH_PARAM) String path,
      @FormParam(OWNER_PARAM) String ownerId) {
    path = PathUtils.normalizePath(path);
    if (siteService.siteExists(path)) {
      try {
        // to add a member you need write on the site config space.
        authzResolverService.check(path + SiteService.PATH_SITE, permissionQueryService
            .getPermission(PermissionQuery.WRITE));
        SiteBean siteBean = siteService.getSite(path);
        checkIsOwner(siteBean);
        siteBean.addOwner(ownerId);

        authzResolverService.setRequestGrant("add Owner");
        try {
          userEnvironmentResolverService
              .addMembership(ownerId, siteBean.getId(), "owner");
          siteBean.save();
        } finally {
          authzResolverService.clearRequestGrant();
        }
        return OK;
      } catch (SiteException e) {
        throw new WebApplicationException(e, Status.CONFLICT);
      }
    }
    throw new WebApplicationException(Response.status(Status.NOT_FOUND).build());
  }

  /**
   * @param path
   * @param ownerId
   * @return
   */
  @POST
  @Path("/owner/remove/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String removeOwner(@PathParam(SITE_PATH_PARAM) String path,
      @FormParam(OWNER_PARAM) String ownerId) {
    path = PathUtils.normalizePath(path);
    if (siteService.siteExists(path)) {
      try {
        // to add a member you need write on the site config space.
        authzResolverService.check(path + SiteService.PATH_SITE, permissionQueryService
            .getPermission(PermissionQuery.WRITE));
        SiteBean siteBean = siteService.getSite(path);
        checkIsOwner(siteBean);
        if (siteBean.getOwners().length == 1) {
          throw new WebApplicationException(new RuntimeException(
              "Cant remove the last owner, transfer ownership first"), Status.CONFLICT);
        }
        siteBean.removeOwner(ownerId);

        authzResolverService.setRequestGrant("remove Owner");
        try {
          userEnvironmentResolverService.removeMembership(ownerId, siteBean.getId(),
              "owner");
          siteBean.save();
        } finally {
          authzResolverService.clearRequestGrant();
        }
        return OK;
      } catch (SiteException e) {
        throw new WebApplicationException(e, Status.CONFLICT);
      }
    }
    throw new WebApplicationException(Response.status(Status.NOT_FOUND).build());
  }

  @POST
  @Path("/members/add/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String addMember(@PathParam(SITE_PATH_PARAM) String path,
      @FormParam(USER_PARAM) String[] userIds,
      @FormParam(MEMBERSHIP_PARAM) String[] membershipType) {
    path = PathUtils.normalizePath(path);
    if (siteService.siteExists(path)) {
      if (userIds == null || membershipType == null) {
        throw new WebApplicationException(new RuntimeException("Bad Parameters"),
            Status.BAD_REQUEST);
      }
      if (userIds.length != membershipType.length) {
        throw new WebApplicationException(new RuntimeException(
            "UserIDs and Membership Token arrays must be the same length"),
            Status.BAD_REQUEST);
      }
      // to add a member you need write on the site config space.
      authzResolverService.check(path + SiteService.PATH_SITE, permissionQueryService
          .getPermission(PermissionQuery.WRITE));
      SiteBean siteBean = siteService.getSite(path);
      String membershipHandlerName = siteBean.getMembershipHandler();
      MembershipHandler membershipHandler = null;
      if (membershipHandlerName != null) {
        membershipHandlerRegistry.getMap().get(membershipHandlerName);
      }

      if (membershipHandler == null) {

        authzResolverService.setRequestGrant("Adding Membership");
        try {
          for (int i = 0; i < userIds.length; i++) {
            userEnvironmentResolverService.addMembership(userIds[i], siteBean.getId(),
                membershipType[i]);
          }
        } finally {
          authzResolverService.clearRequestGrant();
        }
      } else {
        membershipHandler.addMembership(siteBean, userIds, membershipType);
      }
      return OK;
    }
    throw new WebApplicationException(Response.status(Status.NOT_FOUND).build());
  }

  @POST
  @Path("/members/remove/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String removeMember(@PathParam(SITE_PATH_PARAM) String path,
      @FormParam(USER_PARAM) String[] userIds,
      @FormParam(MEMBERSHIP_PARAM) String[] membershipType) {
    path = PathUtils.normalizePath(path);
    if (siteService.siteExists(path)) {
      if (userIds == null || membershipType == null) {
        throw new WebApplicationException(new RuntimeException("Bad Parameters"),
            Status.BAD_REQUEST);
      }
      if (userIds.length != membershipType.length) {
        throw new WebApplicationException(new RuntimeException(
            "UserIDs and Membership Token arrays must be the same length"),
            Status.BAD_REQUEST);
      }

      // to add a member you need write on the site config space.
      authzResolverService.check(path + SiteService.PATH_SITE, permissionQueryService
          .getPermission(PermissionQuery.WRITE));

      SiteBean siteBean = siteService.getSite(path);
      String membershipHandlerName = siteBean.getMembershipHandler();
      MembershipHandler membershipHandler = null;
      if (membershipHandlerName != null) {
        membershipHandlerRegistry.getMap().get(membershipHandlerName);
      }

      if (membershipHandler == null) {

        authzResolverService.setRequestGrant("Revoking Membership");
        try {
          for (int i = 0; i < userIds.length; i++) {
            userEnvironmentResolverService.removeMembership(userIds[i], siteBean.getId(),
                membershipType[i]);
          }
        } finally {
          authzResolverService.clearRequestGrant();
        }
      } else {
        membershipHandler.removeMembership(siteBean, userIds, membershipType);
      }
      return OK;
    }
    throw new WebApplicationException(Response.status(Status.NOT_FOUND).build());
  }

  @POST
  @Path("/join/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String join(@PathParam(SITE_PATH_PARAM) String path) {
    path = PathUtils.normalizePath(path);
    User user = getAuthenticatedUser();
    if (siteService.siteExists(path)) {
      SiteBean siteBean = siteService.getSite(path);

      String membershipHandlerName = siteBean.getMembershipHandler();
      MembershipHandler membershipHandler = null;
      if (membershipHandlerName != null) {
        membershipHandlerRegistry.getMap().get(membershipHandlerName);
      }

      if (membershipHandler == null) {
        String joiningRole = siteBean.getJoiningMembership();

        if (!StringUtils.isEmpty(joiningRole)) {
          userEnvironmentResolverService.addMembership(user.getUuid(), siteBean.getId(),
              joiningRole);
          return OK;
        }
      } else {
        membershipHandler.addMembership(siteBean, user.getUuid());
        return OK;
      }

    }
    throw new WebApplicationException(Response.status(Status.NOT_FOUND).build());
  }

  @POST
  @Path("/unjoin/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String unjoin(@PathParam(SITE_PATH_PARAM) String path,
      @PathParam(MEMBERSHIP_PARAM) String membershipType) {
    path = PathUtils.normalizePath(path);
    User user = getAuthenticatedUser();
    if (siteService.siteExists(path)) {
      SiteBean siteBean = siteService.getSite(path);
      String membershipHandlerName = siteBean.getMembershipHandler();
      MembershipHandler membershipHandler = null;
      if (membershipHandlerName != null) {
        membershipHandlerRegistry.getMap().get(membershipHandlerName);
      }

      if (membershipHandler == null) {

        // if the site was joinable I can unjoin, otherwise I have to ask.
        String joiningRole = siteBean.getJoiningMembership();
        if (!StringUtils.isEmpty(joiningRole)) {
          userEnvironmentResolverService.removeMembership(user.getUuid(), siteBean
              .getId(), membershipType);
          return OK;
        }
      } else {
        membershipHandler.removeMembership(siteBean, user.getUuid(), membershipType);
        return OK;
      }
      throw new WebApplicationException(Status.FORBIDDEN);
    }
    throw new WebApplicationException(Status.NOT_FOUND);
  }

  @GET
  @Path("/members/list/{" + SITE_PATH_PARAM + ":.*}")
  @Produces(MediaType.TEXT_PLAIN)
  public String list(@PathParam(SITE_PATH_PARAM) String path) {
    path = PathUtils.normalizePath(path);
	    if (siteService.siteExists(path)) {
	  //MultivaluedMap<String, String> requestParameters = new MultivaluedMap<String, String>() ;
	  CollectionOptions collectionOptions = new CollectionOptions(0,20);
	  
      Map<String, Object> members = siteService.getMemberList(path, collectionOptions);
     //PagingOptions pagingOptions = collectionOptions.getPagingOptions();
     // Map<String, Object> response = ImmutableMap.of("startIndex", pagingOptions
       //   .getStartIndex(), "count", pagingOptions.getCount(), "size", pagingOptions
         // .size(), "members", members);
      return beanConverter.convertToString(members);
    }
    throw new WebApplicationException(Status.NOT_FOUND);
  }

  /**
   * @param siteBean
   */
  private void checkIsOwner(SiteBean siteBean) {
    User u = getAuthenticatedUser();
    String userId = u.getUuid();
    boolean isOwner = false;
    for (String owner : siteBean.getOwners()) {
      if (userId.equals(owner)) {
        isOwner = true;
      }
    }
    if (!isOwner) {
      throw new WebApplicationException(new RuntimeException("Not a site owner"),
          Status.FORBIDDEN);
    }

  }

  /**
   * @param request
   * @param response
   * @return
   * @throws IOException
   */
  private User getAuthenticatedUser() {
    Session session = sessionManagerService.getCurrentSession();
    System.err.println("Session is " + session);
    if (session == null) {
      throw new WebApplicationException(Status.UNAUTHORIZED);
    }
    User user = session.getUser();
    if (user == null || user instanceof AnonUser || user.getUuid() == null) {
      throw new WebApplicationException(Status.UNAUTHORIZED);
    }
    return user;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.Documentable#getRestDocumentation()
   */
  public RestDescription getRestDocumentation() {
    return DESC;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider#getJaxRsSingleton()
   */
  public Documentable getJaxRsSingleton() {
    return this;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return "presence";
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getPriority()
   */
  public int getPriority() {
    return 0;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.webapp.Initialisable#destroy()
   */
  public void destroy() {
    jaxRsSingletonRegistry.remove(this);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.webapp.Initialisable#init()
   */
  public void init() {
  }
}
