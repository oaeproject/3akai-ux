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
package org.sakaiproject.resteasy;

import com.google.inject.util.ReferenceMap;
import com.google.inject.util.ReferenceType;

import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.util.PathUtils;
import org.sakaiproject.kernel.util.rest.RestDescription;

import java.util.Map;
import java.util.Map.Entry;

import javax.ws.rs.Path;

/**
 * Provides a root documentation for the rest services.
 */
public class RootRestEasyDocumentation implements Documentable {

  /**
   * The map of paths for documentation.
   */
  private Map<String, Documentable> paths = new ReferenceMap<String, Documentable>(
      ReferenceType.STRONG, ReferenceType.WEAK);

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.rest.Documentable#getRestDocumentation()
   */
  public RestDescription getRestDocumentation() {

    RestDescription description = new RestDescription();
    description.setShortDescription("All Rest Services in the system");
    description.setTitle("List of rest Services");
    description.setBackUrl("?doc=1");
    for (Entry<String, Documentable> de : paths.entrySet()) {
      Documentable d = de.getValue();
      RestDescription desc = d.getRestDocumentation();
      String p = de.getKey();
      if (p.startsWith("/")) {
        p = p.substring(1);
      }
      description.addSection(2, "Provider " + p, desc.getShortDescription(), p
          + "/?doc=1");
    }
    return description;
  }

  /**
   * @param class1
   */
  public void removeRegistration(Class<?> beanClass) {
    Path path = beanClass.getAnnotation(Path.class);
    if (path != null) {
      paths.remove(path.value());
    }

  }

  /**
   * @param jaxRsPrototype
   */
  public void addRegistration(Object documentatable) {
    Path path = documentatable.getClass().getAnnotation(Path.class);
    if (path != null) {
      String pathFragment = PathUtils.normalizePath(path.value());
      paths.put(pathFragment, (Documentable) documentatable);
    }
  }


  /**
   * Get the documentable bean for a path.
   *
   * @param path
   * @return
   */
  public Documentable getDocumentable(String path) {
    path = PathUtils.normalizePath(path);
    if (path == null || "/".equals(path)) {
      return this;
    } else {
      return paths.get(path);
    }
  }

}
