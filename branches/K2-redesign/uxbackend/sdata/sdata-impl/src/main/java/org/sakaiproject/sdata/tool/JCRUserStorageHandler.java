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

package org.sakaiproject.sdata.tool;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.inject.Inject;
import com.google.inject.name.Named;

import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.sdata.tool.api.HandlerSerialzer;
import org.sakaiproject.sdata.tool.api.ResourceDefinitionFactory;
import org.sakaiproject.sdata.tool.api.SDataFunction;

import java.util.Map;
import java.util.Map.Entry;

/**
 * A user storage servlet performs storage based on the logged in user, as
 * defined by the Sakai session. It uses the UserResourceDefinitionFactory to
 * locate the location of the users storage within the underlying jcr
 * repository. This servlet extends the JCRServlet and uses its methods and
 * handling to respond to the content.
 *
 * @author ieb
 */
public class JCRUserStorageHandler extends JCRHandler {

  /**
   *
   */
  private static final long serialVersionUID = -7527973143563221845L;

  private static final String BASE_NAME = "jcruserhandler";

  public static final String BASE_REPOSITORY_PATH = BASE_NAME
      + ".baseRepositoryPath";

  public static final String RESOURCE_DEFINITION_FACTORY = BASE_NAME
      + ".resourceDefinitionFactory";

  public static final String RESOURCE_FUNCTION_FACTORY = BASE_NAME
      + ".resourceFuntionFactory";

  public static final String RESOURCE_SERIALIZER = BASE_NAME
      + ".resourceSerialzer";

  public static final String SECURITY_ASSERTION = BASE_NAME
      + ".securityAssertion";

  public static final String LOCK_DEFINITION = BASE_NAME + ".lockDefinition";

  private static final String KEY = "p";

  private static final RestDescription DESCRIPTION = new RestDescription();

  static {
    DESCRIPTION.setTitle("User SData JCR Handler");
    DESCRIPTION.setBackUrl("../?doc=1");
    DESCRIPTION
        .setShortDescription("Manages content in the personal space of the JCR according rfc2616");
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "JCR User Storage Service give access to the users personal storage space in the JCR returning the content "
                + "of files within the jcr or a map response (directories). The resource is "
                + "pointed to using the URI/URL requested (the path info part), and the standard "
                + "Http methods do what they are expected to in the http standard. GET gets the "
                + "content of the file, PUT put puts a new file, the content coming from the "
                + "stream of the PUT. DELETE deleted the file. HEAD gets the headers that would "
                + "come from a full GET. ");
    DESCRIPTION
        .addSection(
            2,
            "GET, HEAD, PUT",
            "The content type and content encoding headers are honored "
                + "for GET,HEAD and PUT, but other headers are not honored completely at the moment "
                + "(range-*) etc, ");
    DESCRIPTION
        .addSection(
            2,
            "POST",
            "POST takes multipart uploads of content, the URL pointing to a folder and "
                + "each upload being the name of the file being uploaded to that folder. The "
                + "upload uses a streaming api, and expects that form fields are ordered, such "
                + "that a field starting with mimetype before the upload stream will specify the "
                + "mimetype associated with the stream.");
  }

  /**
   * Construct a JCRUserStorageHandler, and use a Resource Definition factory to
   * translate the request URL into the repository location.
   *
   * @param jcrNodeFactory
   * @param resourceDefinitionFactory
   * @param resourceFunctionFactory
   */
  @Inject
  public JCRUserStorageHandler(
      JCRNodeFactoryService jcrNodeFactory,
      @Named(RESOURCE_DEFINITION_FACTORY) ResourceDefinitionFactory resourceDefinitionFactory,
      @Named(RESOURCE_FUNCTION_FACTORY) Map<String, SDataFunction> resourceFunctionFactory,
      @Named(RESOURCE_SERIALIZER) HandlerSerialzer serializer,
      RegistryService registryService) {
    super(jcrNodeFactory, resourceDefinitionFactory, resourceFunctionFactory,
        serializer, registryService);
    System.err.println(this + " Resource Defintion Factory is "
        + resourceDefinitionFactory);
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.sdata.tool.JCRHandler#initDescription()
   */
  @Override
  public void initDescription() {

    Map<String, RestDescription> map = Maps.newLinkedHashMap();
    for (Entry<String, SDataFunction> e : resourceFunctionFactory.entrySet()) {
      map.put(e.getKey(), e.getValue().getDescription());
    }
    DESCRIPTION.addSection(2, "Functions",
        "The following functions are activated with a ?f=key, where key is "
            + "the function key");
    for (String s : Lists.sortedCopy(map.keySet())) {
      RestDescription description = map.get(s);
      DESCRIPTION.addSection(3, "URL " + KEY + "/<resource>?f=" + s + "  "
          + description.getTitle(), description.getShortDescription(),
          "?doc=1&f=" + s);
    }

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.sdata.tool.JCRHandler#getKey()
   */
  @Override
  public String getKey() {
    return KEY;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.sdata.tool.JCRHandler#getDescription()
   */
  @Override
  public RestDescription getDescription() {
    return DESCRIPTION;
  }

}
