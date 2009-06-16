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
package org.sakaiproject.kernel.api;

/**
 * The artifact interface represents an artifact. This may be an component
 * dependency or a classpath dependency or a component. The model closely
 * follows Maven 2's artifact model.
 */
public interface Artifact {

  /**
   * @return the group ID of the artifact
   */
  String getGroupId();

  /**
   * @return the artifact ID
   */
  String getArtifactId();

  /**
   * @return the version of the artifact
   */
  String getVersion();

  /**
   * @return the type of the artifact, eg jar
   */
  String getType();

  /**
   * @return scope of the dependency in this context
   */
  DependencyScope getScope();

  /**
   * @return true if the dependency is a managed dependency indicating it should
   *         be started
   */
  boolean isManaged();

  /**
   * @return the classifier for the version eg jdk15
   */
  String getClassifier();

}
