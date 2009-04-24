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
package org.sakaiproject.kernel.util;

import org.sakaiproject.kernel.api.ComponentSpecification;
import org.sakaiproject.kernel.api.Artifact;

/**
 * 
 */
public class ComponentSpecificationUtil {
  /**
   * @param componentSpecificationImpl
   */
  public static String formatDescription(ComponentSpecification cs) {
    StringBuilder sb = new StringBuilder();
    sb.append(cs.getName()).append("->(");
    Artifact[] componentDependencies = cs.getComponentDependencies();
    for (int i = 0; i < componentDependencies.length - 1; i++) {
      sb.append(componentDependencies[i].toString()).append(",");
    }
    if (componentDependencies.length > 0) {
      sb.append(componentDependencies[componentDependencies.length - 1]
          .toString());
    }
    sb.append("),(");
    Artifact[] dependencies = cs.getDependencies();
    for (int i = 0; i < dependencies.length - 1; i++) {
      sb.append(dependencies[i]).append(",");
    }
    if (dependencies.length > 0) {
      sb.append(dependencies[dependencies.length - 1]);
    }
    sb.append(")");
    return sb.toString();

  }

}
