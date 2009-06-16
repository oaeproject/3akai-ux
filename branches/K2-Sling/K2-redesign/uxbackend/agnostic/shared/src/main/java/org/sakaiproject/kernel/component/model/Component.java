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
package org.sakaiproject.kernel.component.model;

import com.thoughtworks.xstream.annotations.XStreamAlias;

import org.sakaiproject.kernel.api.Artifact;
import org.sakaiproject.kernel.api.DependencyScope;
import org.sakaiproject.kernel.api.PackageExport;

import java.util.ArrayList;
import java.util.List;

/**
 * The model for a component, mapped to the xml definition of a component.
 * Mapped to the component element.
 */
@XStreamAlias("component")
public class Component implements Artifact {

  static final Class<?>[] CLASSES = { Component.class,
      DependencyImpl.class, DependencyScope.class, PackageExportImpl.class };
  /**
   * The name of activator class.
   */
  private String activator;

  /**
   * A list of component dependencies mapped to the component-dependencies
   * element.
   */
  @XStreamAlias(value = "componentDependencies", impl = ArrayList.class)
  private List<Artifact> componentDependencies;

  /**
   * A list of classpath dependencies mapped to the classpath-dependencies
   * element.
   */
  @XStreamAlias(value = "dependencies", impl = ArrayList.class)
  private List<Artifact> classpathDependencies;

  /**
   * A list of classpath dependencies mapped to the classpath-dependencies
   * element.
   */
  @XStreamAlias(value = "exports", impl = ArrayList.class)
  private List<PackageExport> exports;

  /**
   * Some documentation about the component
   */
  private String documentation;

  /**
   * The group ID of the component.
   */
  private String groupId;
  /**
   * The artifact ID of the component.
   */
  private String artifactId;
  /**
   * The version of the component.
   */
  private String version;
  /**
   * The classifier of the component.
   */
  private String classifier;

  /**
   * true if the component is not managed
   */
  private boolean unmanaged = false;

  /**
   * @return the activator class name
   */
  public String getActivator() {
    return activator;
  }

  /**
   * @param activator
   *          the activator to set
   */
  public void setActivator(String activator) {
    this.activator = activator;
  }

  /**
   * @return a list of component dependencies.
   */
  public List<Artifact> getComponentDependencies() {
    return componentDependencies;
  }

  /**
   * @param componentDependencies
   *          the componentDependencies to set
   */
  public void setComponentDependencies(List<Artifact> componentDependencies) {
    this.componentDependencies = componentDependencies;
  }

  /**
   * @param documentation
   *          the documentation to set
   */
  public void setDocumentation(String documentation) {
    this.documentation = documentation;
  }

  /**
   * @return the documentation
   */
  public String getDocumentation() {
    return documentation;
  }

  /**
   * @return the classpathDependencies
   */
  public List<Artifact> getDependencies() {
    return classpathDependencies;
  }

  /**
   * @param classpathDependencies
   *          the classpathDependencies to set
   */
  public void setDependencies(List<Artifact> classpathDependencies) {
    this.classpathDependencies = classpathDependencies;
  }

  /**
   * @return the exports
   */
  public List<PackageExport> getExports() {
    return exports;
  }

  /**
   * @param exports
   *          the exports to set
   */
  public void setExports(List<PackageExport> exports) {
    this.exports = exports;
  }

  /**
   * @return the groupId
   */
  public String getGroupId() {
    return groupId;
  }

  /**
   * @param groupId
   *          the groupId to set
   */
  public void setGroupId(String groupId) {
    this.groupId = groupId;
  }

  /**
   * @return the artifactId
   */
  public String getArtifactId() {
    return artifactId;
  }

  /**
   * @param artifactId
   *          the artifactId to set
   */
  public void setArtifactId(String artifactId) {
    this.artifactId = artifactId;
  }

  /**
   * @return the version
   */
  public String getVersion() {
    return version;
  }

  /**
   * @param version
   *          the version to set
   */
  public void setVersion(String version) {
    this.version = version;
  }

  /**
   * @return the classifier
   */
  public String getClassifier() {
    return classifier;
  }

  /**
   * @param classifier
   *          the classifier to set
   */
  public void setClassifier(String classifier) {
    this.classifier = classifier;
  }

  public String getName() {
    return DependencyImpl
        .toString(this);
  }

  /**
   * @param unmanaged
   *          the unmanaged to set
   */
  public void setUnmanaged(boolean unmanaged) {
    this.unmanaged = unmanaged;
  }

  /**
   * @return the unmanaged
   */
  public boolean isUnmanaged() {
    return unmanaged;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.Artifact#getScope()
   */
  public DependencyScope getScope() {
    return DependencyScope.LOCAL;
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.Artifact#getType()
   */
  public String getType() {
    return "";
  }

  /**
   * {@inheritDoc}
   * @see org.sakaiproject.kernel.api.Artifact#isManaged()
   */
  public boolean isManaged() {
    return !isUnmanaged();
  }

  /**
   * @return
   */
  public static Class<?>[] getComponentClasses() {
    return CLASSES.clone();
  }

}
