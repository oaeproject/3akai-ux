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
package org.sakaiproject.kernel.component.test.mock;

import org.sakaiproject.kernel.api.ComponentSpecification;
import org.sakaiproject.kernel.api.Artifact;
import org.sakaiproject.kernel.api.PackageExport;
import org.sakaiproject.kernel.util.ComponentSpecificationUtil;

import java.net.URL;

/**
 *
 */
public class MockComponentSpecificationImpl implements ComponentSpecification {

  private static final String SPECIFICATION = "<name>"
      + MockComponentSpecificationImpl.class.getName() + "</name>"
      + "<classpath>test</classpath>" + "<dependencies/>";
  private Artifact artifact = new MockArtifact("mock-component-spec");

  /*
   * (non-Javadoc)
   * 
   * @see org.sakaiproject.kernel.api.ComponentSpecification#getClassPathURLs()
   */
  public URL[] getClassPathURLs() {
    return new URL[0];
  }

  /*
   * (non-Javadoc)
   * 
   * @seeorg.sakaiproject.kernel.api.ComponentSpecification#
   * getComponentActivatorClassName()
   */
  public String getComponentActivatorClassName() {
    return MockComponentActivator.class.getName();
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.sakaiproject.kernel.api.ComponentSpecification#getDefinition()
   */
  public String getDefinition() {
    return SPECIFICATION;
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.sakaiproject.kernel.api.ComponentSpecification#getName()
   */
  public String getName() {
    return MockComponentSpecificationImpl.class.getName();
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.sakaiproject.kernel.api.ComponentSpecification#getDependencyDescription
   * ()
   */
  public String getDependencyDescription() {
    return ComponentSpecificationUtil.formatDescription(this);
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.ComponentSpecification#getComponentDependencies()
   */
  public Artifact[] getComponentDependencies() {
    return new Artifact[0];
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.ComponentSpecification#getDependencies()
   */
  public Artifact[] getDependencies() {
    return new Artifact[0];
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.ComponentSpecification#getExports()
   */
  public PackageExport[] getExports() {
    return new PackageExport[0];
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.ComponentSpecification#getComponentClasspath()
   */
  public URL getComponentClasspath() {
    return null;
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.ComponentSpecification#isKernelBootstrap()
   */
  public boolean isKernelBootstrap() {
    return false;
  }

  /**
   * {@inheritDoc}
   * 
   * @see org.sakaiproject.kernel.api.ComponentSpecification#getComponentArtifact()
   */
  public Artifact getComponentArtifact() {
    return artifact;
  }

}
