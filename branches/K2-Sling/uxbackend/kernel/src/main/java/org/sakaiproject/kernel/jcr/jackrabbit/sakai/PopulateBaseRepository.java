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
package org.sakaiproject.kernel.jcr.jackrabbit.sakai;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.inject.Inject;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.jcr.api.internal.RepositoryStartupException;
import org.sakaiproject.kernel.jcr.api.internal.StartupAction;
import org.sakaiproject.kernel.util.ResourceLoader;

import java.io.IOException;
import java.io.InputStream;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Map.Entry;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;

/**
 * Populate the repository with some basic files, by reading a properties file.
 */
public class PopulateBaseRepository implements StartupAction {

  private static final Log LOG = LogFactory
      .getLog(PopulateBaseRepository.class);
  private static final String RESOURCES_TO_LOAD = "res://org/sakaiproject/kernel/jcr/jackrabbit/populate_repository.properties";
  private JCRNodeFactoryService jcrNodeFactoryService;
  private UserFactoryService userFactoryService;

  /**
   * Construct the populate action, injecting the {@link JCRNodeFactoryService}
   */
  @Inject
  public PopulateBaseRepository(JCRNodeFactoryService jFactoryService,
      UserFactoryService userFactoryService) {
    this.jcrNodeFactoryService = jFactoryService;
    this.userFactoryService = userFactoryService;
  }

  /**
   * {@inheritDoc}
   *
   * Processes a set of items to add to the repository, taken from
   * propulate_repository.properties. These are structured as follows, the key
   * specifies the location and the value specifies the content. The key may
   * optionally be split by a @ character, and if it is, after the @ defines a
   * function to be applied to the key before the @ to generate the path.
   * Currently there is only a user environment function that will convert the
   * key into a path inside the user environment space.
   *
   * The content is split onto content specifications separated by ';'. Each
   * content spec may be delimited by =, the first element defining the type of
   * content. There are 3 types, 'body' where the second element of the content
   * spec is a resource reference resolvable by the ResourceLoader. If the first
   * element is property, the second element is the name of the property and the
   * third the value of the property. If the first element is property-sha1,
   * then the value of the property is encoded with a SHA1 message digest.
   *
   * @throws RepositoryStartupException
   *
   * @see org.sakaiproject.kernel.jcr.api.internal.StartupAction#startup(javax.jcr.Session)
   */
  public void startup(Session s) throws RepositoryStartupException {
    try {
      InputStream in = ResourceLoader.openResource(RESOURCES_TO_LOAD, this
          .getClass().getClassLoader());

      Properties p = new Properties();
      try {
        p.load(in);
      } finally {
        in.close();
      }
      for (Entry<?, ?> r : p.entrySet()) {
        String[] pathSpec = StringUtils.split((String) r.getKey(), '@');
        String path = null;
        String parentOwner = null;
        if (pathSpec != null && pathSpec.length > 1) {
          if ("userenv".equals(pathSpec[1])) {
            path = userFactoryService.getUserEnvPath(pathSpec[0]);
          } else if ("profile".equals(pathSpec[1])) {
            path = userFactoryService.getUserProfilePath(pathSpec[0]);
            parentOwner = pathSpec[0];
          } else {
            path = pathSpec[0];
          }
        } else {
          path = pathSpec[0];
        }


        Node n = jcrNodeFactoryService.getNode(path);
        if (n == null) {
          String[] content = StringUtils.split((String) r.getValue(), ';');
          // create a map of the parameters
          Map<String, List<String[]>> map = Maps.newHashMap();
          if (content != null) {
            for (String c : content) {
              String[] b = StringUtils.split(c, '=');
              if (b != null && b.length > 0) {
                List<String[]> l = map.get(b[0]);
                if (l == null) {
                  l = Lists.newArrayList();
                  map.put(b[0], l);
                }
                l.add(b);
              }
            }
          }
          List<String[]> l = map.get("mimeType");
          String mimeType = JCRConstants.JCR_CONTENT;
          if (l != null) {
            for (String[] lv : l) {
              mimeType = lv[1];
            }
          }
          // process the parameters
          n = jcrNodeFactoryService.createFile(path, mimeType);
          l = map.get("property");
          if (l != null) {
            for (String[] lv : l) {
              n.setProperty(lv[1], lv[2]);
            }
          }
          l = map.get("property-sha1");
          if (l != null) {
            for (String[] lv : l) {
              n.setProperty(lv[1], org.sakaiproject.kernel.util.StringUtils
                  .sha1Hash(lv[2]));
            }
          }
          l = map.get("content-property");
          if (l != null) {
            for (String[] lv : l) {
              Node dataNode = n.getNode(JCRConstants.JCR_CONTENT);
              dataNode.setProperty(lv[1], lv[2]);
            }
          }
          l = map.get("body");
          if (l != null) {
            for (String[] lv : l) {
              InputStream resoruceStream = ResourceLoader.openResource(lv[1],
                  this.getClass().getClassLoader());
              try {
                jcrNodeFactoryService.setInputStream(path, resoruceStream, mimeType);
              } finally {
                resoruceStream.close();
              }
            }
          }
          // set the owner of the parent node to the current used and safe the whole lot.
          if ( parentOwner != null ) {
            n = n.getParent();
            n.setProperty(JCRConstants.ACL_OWNER, parentOwner);
          }
          LOG.info("Added Startup File at "+n.getPath());

        }
      }

    } catch (IOException e) {
      throw new RepositoryStartupException("Failed to populate Repository ", e);
    } catch (RepositoryException e) {
      throw new RepositoryStartupException("Failed to populate Repository ", e);
    } catch (JCRNodeFactoryServiceException e) {
      throw new RepositoryStartupException("Failed to populate Repository ", e);
    } catch (NoSuchAlgorithmException e) {
      throw new RepositoryStartupException("Failed to populate Repository ", e);
    }
  }


}
