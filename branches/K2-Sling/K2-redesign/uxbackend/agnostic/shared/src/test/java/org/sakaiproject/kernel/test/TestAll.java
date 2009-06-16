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
package org.sakaiproject.kernel.test;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;
import org.sakaiproject.kernel.component.core.test.ClassLoaderServiceTest;
import org.sakaiproject.kernel.component.core.test.ComponentClassloaderTest;
import org.sakaiproject.kernel.component.core.test.ComponentLoaderServiceImplTest;
import org.sakaiproject.kernel.component.core.test.Maven2DependencyResolverTest;
import org.sakaiproject.kernel.component.core.test.PackageRegistryServiceTest;
import org.sakaiproject.kernel.component.core.test.SharedClassloaderTest;
import org.sakaiproject.kernel.component.test.ComponentManagerImplTest;
import org.sakaiproject.kernel.component.test.KernelImplTest;
import org.sakaiproject.kernel.component.test.KernelLifecycleTest;
import org.sakaiproject.kernel.component.test.ServiceManagerImplTest;
import org.sakaiproject.kernel.component.test.URLComponentSpecificationImplTest;
import org.sakaiproject.kernel.util.test.FileUtilTest;
import org.sakaiproject.kernel.util.test.ResourceLoaderTest;
import org.sakaiproject.kernel.util.test.StringUtilsTest;

/**
 *
 */
@RunWith(Suite.class)
@SuiteClasses( { StringUtilsTest.class, FileUtilTest.class,
    ResourceLoaderTest.class,
    Maven2DependencyResolverTest.class,
    ComponentClassloaderTest.class,
    ComponentManagerImplTest.class, KernelImplTest.class,
    ServiceManagerImplTest.class, KernelLifecycleTest.class,
    URLComponentSpecificationImplTest.class,
    PackageRegistryServiceTest.class,
    ComponentLoaderServiceImplTest.class,
    ClassLoaderServiceTest.class,
    SharedClassloaderTest.class

})
public class TestAll {

}
