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
package org.sakaiproject.kernel.api.authz;


/**
 * The Reference resolver server resolves reference URI's into ReferenceObjects.
 */
public interface ReferenceResolverService {

  /**
   * Resolve the ReferenceObject.
   *
   * @param resourceReference
   *          the reference URI. If this is native, it will contain no domain.
   * @return the ReferenceObject after resolution, null if no reference object
   *         is present.
   */
  ReferencedObject resolve(String resourceReference);

  /**
   * Create an access control statement from a specification.
   * @param acs The acs in string form
   * @return an Acs
   * @throws IllegalArgumentException if the acs is not parsable.
   */
  AccessControlStatement newAccessControlStatement(String acs);

}
