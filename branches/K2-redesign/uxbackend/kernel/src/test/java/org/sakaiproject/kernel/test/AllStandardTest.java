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
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.test.JCRIdPwEvidenceUT;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.test.SakaiUserPrincipalUT;
import org.sakaiproject.kernel.jcr.jackrabbit.test.JCRAnonymousPrincipalUT;
import org.sakaiproject.kernel.model.test.FriendsBeanUT;
import org.sakaiproject.kernel.model.test.GroupBeanUT;
import org.sakaiproject.kernel.model.test.UserEnvironmentBeanUT;
import org.sakaiproject.kernel.persistence.DataSourceServiceUT;
import org.sakaiproject.kernel.registry.test.RegistryServiceUT;
import org.sakaiproject.kernel.rest.test.RestAuthenticationProviderUT;
import org.sakaiproject.kernel.rest.test.UserLocaleUT;
import org.sakaiproject.kernel.serialization.json.test.BeanJsonLibConverterUT;
import org.sakaiproject.kernel.user.test.UserObjectUT;
import org.sakaiproject.kernel.webapp.test.SakaiServletRequestUT;
import org.sakaiproject.kernel.webapp.test.SakaiServletResponseUT;

/**
 * 
 */
@RunWith(Suite.class)
@SuiteClasses( { PathUtilsUT.class, SakaiServletRequestUT.class,
    ExceptionUT.class, GroupBeanUT.class, BeanJsonLibConverterUT.class,
    UserObjectUT.class, SakaiServletResponseUT.class,
    UserEnvironmentBeanUT.class, JCRIdPwEvidenceUT.class,
    RegistryServiceUT.class, DataSourceServiceUT.class, UserLocaleUT.class,
    SakaiUserPrincipalUT.class, JCRAnonymousPrincipalUT.class,
    RestAuthenticationProviderUT.class, FriendsBeanUT.class })
public class AllStandardTest {
}
