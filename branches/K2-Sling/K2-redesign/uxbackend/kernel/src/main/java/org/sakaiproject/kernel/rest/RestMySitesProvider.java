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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.Session;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.SiteService;
import org.sakaiproject.kernel.api.user.User;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.model.SiteBean;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.RestServiceFaultException;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Implements the MySites service.
 *
 * This is coded according to OpenSocial API v.8.1
 * http://www.opensocial.org/Technical
 * -Resources/opensocial-spec-v081/restful-protocol#TOC-2.1-Responses
 *
 */
public class RestMySitesProvider implements RestProvider {

  public static final String SITES_ELEMENT = "sites";
  private static final RestDescription DESCRIPTION = new RestDescription();
  private static final Log LOG = LogFactory.getLog(RestMySitesProvider.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private SessionManagerService sessionManagerService;
  private BeanConverter beanConverter;


  public static final String OUTPUT_PARAM_NAME_STARTINDEX = "startIndex";
  public static final String OUTPUT_PARAM_NAME_ITEMSPERPAGE = "startIndex";

  public static final String INPUT_PARAM_NAME_STARTINDEX = "itemsPerPage";
  public static final String INPUT_PARAM_NAME_COUNT = "count";
  private static final String OUTPUT_PARAM_NAME_TOTALRESULTS = "totalResults";
  private static final String OUTPUT_SITES_KEY = "entry";

  private UserEnvironmentResolverService simpleJcrUserEnvironmentResolverService;
  private SiteService siteService;

  @Inject
  public RestMySitesProvider(
      RegistryService registryService,
      SessionManagerService sessionManagerService,
      UserEnvironmentResolverService simpleJcrUserEnvironmentResolverService,
      BeanConverter beanConverter,
      @Named(KernelConstants.JCR_USERENV_BASE) String userEnvironmentBase,
      SiteService siteService) {
    Registry<String, RestProvider> registry = registryService
        .getRegistry(RestProvider.REST_REGISTRY);
    registry.add(this);
    this.sessionManagerService = sessionManagerService;
    this.beanConverter = beanConverter;
    this.simpleJcrUserEnvironmentResolverService = simpleJcrUserEnvironmentResolverService;
    this.siteService = siteService;
  }

  static {
    DESCRIPTION.setTitle("MySites Service");
    DESCRIPTION.setBackUrl("../__describe__");
    DESCRIPTION
        .setShortDescription("The MySites service provides information about "
            + "sites associated with the current user");
    DESCRIPTION
        .addSection(
            1,
            "Introduction",
            "The MySites Service, when queried will respond with a json specific "
                + "to the logged in user. If no logged in user is present, then an "
                + "anonymous json response will be sent. In addition some headers "
                + "will be modified to reflect the locale preferences of the user.");
    DESCRIPTION.addSection(2, "Response: Anon User",
        "Where the user is an anon user the response will contain a list of sites "
            + "that are accessible anonymously.");
    DESCRIPTION.addSection(2, "Response: Authenticated User",
        "Where the user is an authenticaated user the response will contain a list of "
            + "sites associated wit the user including the role(s) in each.");
    DESCRIPTION.addParameter("count (optional) - TODO",
        "Number of items to return for paging");// TODO
    DESCRIPTION.addParameter("startIndex (optional) - TODO ",
        "Index (integer) of item starting page");// TODO
    DESCRIPTION.addParameter("itemsPerPage (optional) - TODO",
        "The number of items to display");// TODO
    DESCRIPTION
        .addHeader("none",
            "The service neither looks for headers nor sets any non standard headers");
    DESCRIPTION
        .addURLTemplate(
            "sites",
            "The service is selected by /rest/sites. If there is any training path the request will be ignored by this provider");
    DESCRIPTION
        .addResponse(
            "200",
            "The service returns a JSON body with a list of N 'items' structures. eg "

                + "    {"
                + "      \"entry\": ["
                + "          {"
                + "              \"type\": \"course\","
                + "              \"description\": \"An Example site definition. This is just the required fields that we might see inside a object that defines a site \","
                + "              \"roles\": ["
                + "                  {"
                + "                      \"permissions\": ["
                + "                          \"read\","
                + "                          \"write\","
                + "                          \"delete\""
                + "                      ],"
                + "                      \"name\": \"access\""
                + "                  },"
                + "                  {"
                + "                      \"permissions\": ["
                + "                          \"read\","
                + "                          \"write\","
                + "                          \"delete\""
                + "                      ],"
                + "                      \"name\": \"maintain\""
                + "                  }"
                + "              ],"
                + "              \"subjectTokens\": ["
                + "                  \"Site 2:access\","
                + "                  \"Site 2:maintain\""
                + "              ],"
                + "              \"name\": \"Site 2\","
                + "              \"id\": \"group2\""
                + "          },"
                + "          {"
                + "              \"type\": \"course\","
                + "              \"description\": \"An Example site definition. This is just the required fields that we might see inside a object that defines a site \","
                + "              \"roles\": ["
                + "                  {"
                + "                      \"permissions\": ["
                + "                          \"read\","
                + "                          \"write\","
                + "                          \"delete\""
                + "                      ],"
                + "                      \"name\": \"access\""
                + "                  },"
                + "                  {"
                + "                      \"permissions\": ["
                + "                          \"read\","
                + "                          \"write\","
                + "                          \"delete\""
                + "                      ],"
                + "                      \"name\": \"maintain\""
                + "                  }"
                + "              ],"
                + "              \"subjectTokens\": ["
                + "                  \"Site 1:access\","
                + "                  \"Site 1:maintain\""
                + "              ],"
                + "              \"name\": \"Site 1\","
                + "              \"id\": \"group1\""
                + "          },"
                + "          {"
                + "              \"type\": \"course\","
                + "              \"description\": \"An Example site definition. This is just the required fields that we might see inside a object that defines a site \","
                + "              \"roles\": [" + "                  {"
                + "                      \"permissions\": ["
                + "                          \"read\","
                + "                          \"write\","
                + "                          \"delete\""
                + "                      ],"
                + "                      \"name\": \"access\""
                + "                  }," + "                  {"
                + "                      \"permissions\": ["
                + "                          \"read\","
                + "                          \"write\","
                + "                          \"delete\""
                + "                      ],"
                + "                      \"name\": \"maintain\""
                + "                  }" + "              ],"
                + "              \"subjectTokens\": ["
                + "                  \"Site 2:access\","
                + "                  \"Site 2:maintain\"" + "              ],"
                + "              \"name\": \"Site 2\","
                + "              \"id\": \"group2\"" + "          }"
                + "      ]," + "      \"totalResults\": 3" + "  }");

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.RestProvider#dispatch(java.lang.String[],
   *      javax.servlet.http.HttpServletRequest,
   *      javax.servlet.http.HttpServletResponse)
   */
  public void dispatch(String[] elements, HttpServletRequest request,
      HttpServletResponse response) {
    try {
      if (elements.length == 1 && SITES_ELEMENT.equals(elements[0])) {

        KernelManager kernelManager = new KernelManager();
        Kernel kernel = kernelManager.getKernel();

        if (null == sessionManagerService) {
          sessionManagerService = kernel
              .getService(SessionManagerService.class);
        }

        Session session = sessionManagerService.getCurrentSession();
        User user = session.getUser();

        String uuid = null;

        if (user == null || user.getUuid() == null) {
          uuid = "anon";
        } else {
          uuid = user.getUuid();
        }
        UserEnvironment env = simpleJcrUserEnvironmentResolverService
            .resolve(user);

        LOG.info("getting subjects....");
        String[] subjects = env.getSubjects();
        LOG.info("list of subjects for user (" + uuid + ", "
            + subjects.length + " total):");
        for (int i = 0; i < subjects.length; ++i) {
          LOG.info("--> " + subjects[i]);
        }

        LOG.info("Parsing for startindex param from request ....." + request);

        /*
         * parse and handle the paging This is coded according to OpenSocial API
         * v.8.1
         * http://www.opensocial.org/Technical-Resources/opensocial-spec-v081
         * /restful -protocol#TOC-2.1-Responses
         */
        Map<String, Object> pagingEnvelope = new HashMap<String, Object>();

        // check for startIndex param
        try {
          String param = request.getParameter(INPUT_PARAM_NAME_STARTINDEX);
          int startIndex = Integer.parseInt(param);
          pagingEnvelope.put(OUTPUT_PARAM_NAME_STARTINDEX, startIndex);
        } catch (NumberFormatException e) {// just skip it
        } catch (Exception e) {
          LOG.error("General Exception thrown parsing request for startIndex");
        }

        // / check for 'count' param
        try {
          // /set to 'count' until we know how many values we have left to
          // display
          int itemsPerPage = Integer.parseInt(request
              .getParameter(INPUT_PARAM_NAME_COUNT));
          pagingEnvelope.put(OUTPUT_PARAM_NAME_ITEMSPERPAGE, itemsPerPage);
        } catch (NumberFormatException e) {
          // just skip it
        } catch (Exception e) {
          LOG
              .error("General Exception thrown parsing request for itemsPerPage");
        }

        if (debug) {
          LOG.debug("getting subjects as sites....");
        }

        SiteBean memSite = null;
        Set<SiteBean> sites = new HashSet<SiteBean>();

        for (String s : subjects) {
          if (s != null) {
            String[] parts = s.split(":");
            if (parts.length == 2) {
              memSite = siteService.getSiteById(parts[0]);

              if (null == memSite) {
                LOG.warn("group id not found as a site id... subject token: "
                    + s);
              } else {
                if (debug) {
                  LOG.debug("Site found: " + memSite.getName());
                }
                if (!sites.contains(memSite)) {
                  sites.add(memSite);
                }
              }
            } else {
              LOG.error("malformed subject in userenvronment (user: " + uuid
                  + ")");
            }
          } else {
            LOG.error("null subject found in userenvironment (user: " + uuid
                + ")");
          }
        }
        pagingEnvelope.put(OUTPUT_PARAM_NAME_TOTALRESULTS, sites.size());
        pagingEnvelope.put(OUTPUT_SITES_KEY, sites.toArray());
        sendOutput(response, pagingEnvelope);
      }
    } catch ( SecurityException ex ) {
      throw ex;
    } catch (RestServiceFaultException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new RestServiceFaultException(ex.getMessage(), ex);
    }

  }

  /**
   * @param response
   * @param itemMap
   * @throws IOException
   */
  private void sendOutput(HttpServletResponse response,
      Map<String, Object> itemMap) throws IOException {
    response.setContentType(RestProvider.CONTENT_TYPE);
    ServletOutputStream outputStream = response.getOutputStream();

    outputStream.print(beanConverter.convertToString(itemMap));

    outputStream.flush();
    outputStream.close();

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
    return "sites";
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
