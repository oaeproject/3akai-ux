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
package org.sakaiproject.kernel.rest;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.SubjectPermissionService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.AuthenticationManagerService;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserProfile;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.JCRIdPwEvidence;
import org.sakaiproject.kernel.model.UserEnvironmentBean;
import org.sakaiproject.kernel.user.jcr.JcrAuthenticationResolverProvider;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.util.user.AnonUser;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 */
public class RestUserProvider implements RestProvider {

  private static final RestDescription DESCRIPTION = new RestDescription();
  private static final String FIRST_NAME_PARAM = "firstName";
  private static final String LAST_NAME_PARAM = "lastName";
  private static final String EMAIL_PARAM = "email";
  private static final String EXTERNAL_USERID_PARAM = "eid";
  private static final String PASSWORD_PARAM = "password";
  private static final String LANGUAGE_PARAM = "language";
  private static final String TIMEZONE_PARAM = "timezone";
  private static final String USER_TYPE_PARAM = "userType";
  private static final String PASSWORD_OLD_PARAM = "oldPassword";
  private static final String EXISTS = "exists";
  private BeanConverter beanConverter;
  private UserResolverService userResolverService;
  private JCRNodeFactoryService jcrNodeFactoryService;
  private UserFactoryService userFactoryService;
  private UserEnvironmentResolverService userEnvironmentResolverService;
  private SessionManagerService sessionManagerService;
  private boolean anonymousAccounting;
  private AuthenticationManagerService authenticationManagerService;
  private ProfileResolverService profileResolverService;
  private AuthzResolverService authzResolverService;
  private SubjectPermissionService subjectPermissionService;
  private RegistryService registryService;
  /**
   * @param subjectPermissionService 
 * @param sessionManager
   *
   */
  @Inject
  public RestUserProvider(RegistryService registryService, BeanConverter beanConverter,
      UserResolverService userResolverService,
      UserEnvironmentResolverService userEnvironmentResolverService,
      JCRNodeFactoryService jcrNodeFactoryService, UserFactoryService userFactoryService,
      SessionManagerService sessionManagerService,
      AuthenticationManagerService authenticationManagerService,
      ProfileResolverService profileResolverService,
      @Named(KernelConstants.PROP_ANON_ACCOUNTING) boolean anonymousAccounting,
      AuthzResolverService authzResolverService, SubjectPermissionService subjectPermissionService) {
    Registry<String, RestProvider> restRegistry = registryService
        .getRegistry(RestProvider.REST_REGISTRY);
    restRegistry.add(this);
    this.beanConverter = beanConverter;
    this.userResolverService = userResolverService;
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.userFactoryService = userFactoryService;
    this.userEnvironmentResolverService = userEnvironmentResolverService;
    this.sessionManagerService = sessionManagerService;
    this.authenticationManagerService = authenticationManagerService;
    this.profileResolverService = profileResolverService;
    this.anonymousAccounting = anonymousAccounting;
    this.authzResolverService = authzResolverService;
    this.subjectPermissionService = subjectPermissionService;
    this.registryService = registryService;

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
      if ("POST".equals(request.getMethod())) {
        // Security is managed by the JCR
        Map<String, Object> map = null;
        if ("new".equals(elements[1])) {
          map = createUser(request, response);
        } else if ("changepassword".equals(elements[1])) {
          map = changePassword(request, response, elements.length > 2 ? elements[2]
              : null);
        } else if ("changelocale".equals(elements[1])) {
            map = changeLocale(request, response, elements.length > 2 ? elements[2]
                : null);
          }

        if (map != null) {
          String responseBody = beanConverter.convertToString(map);
          response.setContentType(RestProvider.CONTENT_TYPE);
          response.getOutputStream().print(responseBody);
        }

      } else {
        if ("GET".equals(request.getMethod()) && elements.length == 3
            && getKey().equals(elements[0]) && EXISTS.equals(elements[2])
            && elements[1].trim().length() > 0) {
          handleUserExists(elements[1].trim(), response);
        } else {
          throw new RestServiceFaultException(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
        }
      }
    } catch (SecurityException ex) {
      throw ex;
    } catch (RestServiceFaultException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new RestServiceFaultException(ex.getMessage(), ex);
    }
  }

  private void handleUserExists(String eid, HttpServletResponse response)
      throws ServletException, IOException {

    Session session = sessionManagerService.getCurrentSession();
    User user = session.getUser();

    if ((user == null || user.getUuid() == null) && !anonymousAccounting) {
      throw new RestServiceFaultException(HttpServletResponse.SC_UNAUTHORIZED);
    } else {

      UserEnvironment env = userEnvironmentResolverService.resolve(user);

      if (!anonymousAccounting && (null == env || !env.isSuperUser())) {
        throw new RestServiceFaultException(HttpServletResponse.SC_FORBIDDEN);
      } else {
        if (userResolverService.resolve(eid) != null) {
          response.reset();
          Map<String, String> body = new HashMap<String, String>();
          body.put("response", "OK");
          body.put("eid", eid);
          body.put("exists", "true");
          String json = beanConverter.convertToString(body);
          response.setContentType(RestProvider.CONTENT_TYPE);
          response.getOutputStream().print(json);
          response.getOutputStream().flush();
          response.getOutputStream().close();
        } else {
          throw new RestServiceFaultException(HttpServletResponse.SC_NOT_FOUND);
        }
      }
    }

  }
  
  private Map<String, Object> changeLocale(HttpServletRequest request,
		  HttpServletResponse response, String externalId)
		  throws UnsupportedEncodingException, NoSuchAlgorithmException, IOException,
	      RepositoryException, JCRNodeFactoryServiceException{
	  Session session = sessionManagerService.getCurrentSession();
	    if (session == null) {
	      throw new RestServiceFaultException(HttpServletResponse.SC_UNAUTHORIZED);
	    }
	    UserEnvironment ue = userEnvironmentResolverService.resolve(session);
	    if (ue == null) {
	      throw new RestServiceFaultException(HttpServletResponse.SC_UNAUTHORIZED);
	    }
	    User thisUser = ue.getUser();
	    if (thisUser == null || thisUser instanceof AnonUser) {
	      throw new RestServiceFaultException(HttpServletResponse.SC_UNAUTHORIZED);
	    }
	    UserEnvironmentBean newUserEnvironment = new UserEnvironmentBean(subjectPermissionService, 0, registryService);
	    newUserEnvironment.copyFrom(ue);
	    newUserEnvironment.setLocale(request.getParameter(LANGUAGE_PARAM));
	    newUserEnvironment.setTimezone(request.getParameter(TIMEZONE_PARAM));
	    userEnvironmentResolverService.save(newUserEnvironment);
		Map<String, Object> r = new HashMap<String, Object>();
		r.put("response", "OK");
		return r;
  }

  /**
   * @param request
   * @param response
   * @return
   * @throws IOException
   * @throws NoSuchAlgorithmException
   * @throws UnsupportedEncodingException
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   */
  private Map<String, Object> changePassword(HttpServletRequest request,
      HttpServletResponse response, String externalId)
      throws UnsupportedEncodingException, NoSuchAlgorithmException, IOException,
      RepositoryException, JCRNodeFactoryServiceException {
    Session session = sessionManagerService.getCurrentSession();
    if (session == null) {
      throw new RestServiceFaultException(HttpServletResponse.SC_UNAUTHORIZED);
    }
    UserEnvironment ue = userEnvironmentResolverService.resolve(session);
    if (ue == null) {
      throw new RestServiceFaultException(HttpServletResponse.SC_UNAUTHORIZED);
    }
    User thisUser = ue.getUser();
    if (thisUser == null || thisUser instanceof AnonUser) {
      throw new RestServiceFaultException(HttpServletResponse.SC_UNAUTHORIZED);
    }

    User user = thisUser;

    boolean superUser = false;
    if (externalId != null) {
      if (ue.isSuperUser()) {
        user = userResolverService.resolve(externalId);
        if (user == null) {
          throw new SecurityException("Specified user cant be found ");
        }
        superUser = true;
      } else {
        throw new SecurityException(
            "User does not have permission to change others passwords");
      }
    } else {
      externalId = ((UserEnvironmentBean) ue).getEid();
    }
    if (thisUser.getUuid().equals(user.getUuid())) {
      superUser = false;
    }
    String password = request.getParameter(PASSWORD_PARAM);

    String passwordOld = request.getParameter(PASSWORD_OLD_PARAM);

    if (password == null || password.trim().length() < 5) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          "Passwords are too short, minimum 5 characters");
    }
    String userEnvironmentPath = userFactoryService.getUserEnvPath(user.getUuid());
    Node userEnvNode = jcrNodeFactoryService.getNode(userEnvironmentPath);
    if (userEnvNode == null) {
      throw new RestServiceFaultException(HttpServletResponse.SC_NOT_FOUND,
          "User does not exist");
    }
    if (!superUser) {
      if (passwordOld == null) {
        throw new RestServiceFaultException(HttpServletResponse.SC_FORBIDDEN,
            "You must specify the old password in order to change the password.");
      }
      // set the password
      Property storedPassword = userEnvNode
          .getProperty(JcrAuthenticationResolverProvider.JCRPASSWORDHASH);
      if (storedPassword != null) {
        String storedPasswordString = storedPassword.getString();
        String oldPasswordHash = org.sakaiproject.kernel.util.StringUtils
            .sha1Hash(passwordOld);
        if (storedPasswordString != null) {
          if (!oldPasswordHash.equals(storedPasswordString)) {
            throw new RestServiceFaultException(HttpServletResponse.SC_CONFLICT,
                "Old Password does not match ");
          }
        }
      }
    }

    JCRIdPwEvidence oldPrincipal = new JCRIdPwEvidence(externalId, passwordOld);
    JCRIdPwEvidence newPrincipal = new JCRIdPwEvidence(externalId, password);

    // Although the authentication manager service does perform the above tests,
    // providers could be outside the kernel, and so they may not be so strict.
    authenticationManagerService.setAuthentication(oldPrincipal, newPrincipal);

    Map<String, Object> r = new HashMap<String, Object>();
    r.put("response", "OK");
    r.put("uuid", user.getUuid());
    return r;

  }

  /**
   * @param request
   * @return
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   * @throws IOException
   * @throws NoSuchAlgorithmException
   */
  private Map<String, Object> createUser(HttpServletRequest request,
      HttpServletResponse response) throws RepositoryException,
      JCRNodeFactoryServiceException, IOException, NoSuchAlgorithmException {
    String firstName = request.getParameter(FIRST_NAME_PARAM);
    String lastName = request.getParameter(LAST_NAME_PARAM);
    String email = request.getParameter(EMAIL_PARAM);
    String externalId = request.getParameter(EXTERNAL_USERID_PARAM);
    String password = request.getParameter(PASSWORD_PARAM);
    String userType = request.getParameter(USER_TYPE_PARAM);

    if (StringUtils.isEmpty(firstName)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          FIRST_NAME_PARAM + " is empty");
    }
    if (StringUtils.isEmpty(lastName)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          LAST_NAME_PARAM + " is empty");
    }
    if (StringUtils.isEmpty(email)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST, EMAIL_PARAM
          + " is empty");
    }
    if (StringUtils.isEmpty(externalId)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          EXTERNAL_USERID_PARAM + " is empty");
    }
    if (StringUtils.isEmpty(password)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          PASSWORD_PARAM + " is empty");
    }
    if (StringUtils.isEmpty(userType)) {
      throw new RestServiceFaultException(HttpServletResponse.SC_BAD_REQUEST,
          USER_TYPE_PARAM + " is empty");
    }

    if (anonymousAccounting) {
      authzResolverService.setRequestGrant("Creating User For Anon User");
    } else {
      String loggedInUser = request.getRemoteUser();
      if (loggedInUser == null || "anon".equals(loggedInUser)) {
        throw new RestServiceFaultException(HttpServletResponse.SC_FORBIDDEN,"User Creation is not allowed");
      } else {
        UserEnvironment ue = userEnvironmentResolverService.resolve(loggedInUser);
        if ( ue.isSuperUser() ) {
          authzResolverService.setRequestGrant("Creating User For Super User");
        } else {
          throw new RestServiceFaultException(HttpServletResponse.SC_FORBIDDEN,"User Creation is only allowed by Super Users");
        }
      }
    }

      User u = userResolverService.resolve(externalId);
      if (u != null) {
        throw new RestServiceFaultException(HttpServletResponse.SC_CONFLICT,
            "Conflict, unable to create new user. Perhaps user already exists?");
      }

      u = userFactoryService.createNewUser(externalId);

      UserEnvironment ue = userEnvironmentResolverService.create(u, externalId, password,
          userType);
      if (ue == null) {
        throw new RestServiceFaultException(HttpServletResponse.SC_CONFLICT,
            "Unable to create new user");
      }

      UserProfile userProfile = profileResolverService.create(u.getUuid(), userType);
      Map<String, Object> profileMap = userProfile.getProperties();

      profileMap.put("firstName", firstName);
      profileMap.put("lastName", lastName);
      profileMap.put("email", email);

      userProfile.setProperties(profileMap);
      userProfile.save();


      Map<String, Object> r = new HashMap<String, Object>();
      r.put("response", "OK");
      r.put("uuid", u.getUuid());
      return r;

  }

  static {
    DESCRIPTION.setTitle("User Rest Service");
    DESCRIPTION.setBackUrl("../__describe__");
    DESCRIPTION
        .setShortDescription("The User service creates users, and sets the users password ");
    DESCRIPTION.addSection(1, "Create User",
        "Create a new user by POST ing to the /rest/user/new url with the "
            + " following parameters " + FIRST_NAME_PARAM + "," + LAST_NAME_PARAM + ","
            + EMAIL_PARAM + "," + EXTERNAL_USERID_PARAM + "," + PASSWORD_PARAM + ","
            + USER_TYPE_PARAM + " as described below");
    DESCRIPTION.addURLTemplate("/user/new",
        "POST to create a new user, firstname, lastname, email, userid and password).");
    DESCRIPTION
        .addURLTemplate(
            "/user/changepassword/<user eid>",
            "POST to change the users password, and optionally specify which user. If the "
                + "user is not specified, the action is applied to the current user, if the user "
                + "is specified on the path as an EID, and the current user has super user "
                + "privalages the password will be changed. If an attempt is made to change the "
                + "current users password, super user or not, the old password must also be "
                + "supplied.).");
    DESCRIPTION.addParameter(FIRST_NAME_PARAM, "The first name of the User");
    DESCRIPTION.addParameter(LAST_NAME_PARAM, "The last name of the User");
    DESCRIPTION.addParameter(EMAIL_PARAM, "The email for the user User");
    DESCRIPTION.addParameter(EXTERNAL_USERID_PARAM,
        "The external user ID for the user User");
    DESCRIPTION.addParameter(PASSWORD_PARAM,
        "The initial or replacement password for the User");
    DESCRIPTION.addParameter(PASSWORD_OLD_PARAM, "the old password for the User");
    DESCRIPTION.addParameter(USER_TYPE_PARAM, "The type of the user User");
    DESCRIPTION.addURLTemplate("/user/<user eid>/exists",
        "GET to test for existence of a user");

    DESCRIPTION
        .addResponse(String.valueOf(HttpServletResponse.SC_OK),
            "On New { \"response\" : \"OK\", \"uuid\" : \"AAAA\" }, where AAAA is the new user UUID ");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_FORBIDDEN),
        "If the user does not have permission to perform the action");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_METHOD_NOT_ALLOWED),
        "If the method is used");

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestProvider#getDescription()
   */
  public RestDescription getDescription() {
    return DESCRIPTION;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.Provider#getKey()
   */
  public String getKey() {
    return "user";
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
