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

package org.sakaiproject.kernel.model.test;

import static org.junit.Assert.*;
import com.google.inject.Guice;
import com.google.inject.Injector;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.Test;
import org.sakaiproject.kernel.model.GroupBean;
import org.sakaiproject.kernel.model.RoleBean;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConverter;
import org.sakaiproject.kernel.util.ResourceLoader;

import java.io.IOException;


/**
 * 
 */
public class GroupBeanUT {

  private static final Log LOG = LogFactory
      .getLog(GroupBeanUT.class);
  private static final String[] GROUPS = { "group1" };
  private static final String TEST_GROUP = "res://org/sakaiproject/kernel/test/samplegroup/";

  @Test
  public void testGroupBeanLoad() throws IOException {
    Injector injector = Guice.createInjector(new ModelModule());
    BeanJsonLibConverter converter = injector
        .getInstance(BeanJsonLibConverter.class);
    ClassLoader classLoader = this.getClass().getClassLoader();
    for (String group : GROUPS) {
      String json = ResourceLoader.readResource(TEST_GROUP + group + ".json",
          classLoader);
      GroupBean groupBean= converter.convertToObject(json,
          GroupBean.class);
      converter.resetMappings();
      LOG.info("Loaded " + converter.convertToString(groupBean));
    }
  }

  @Test
  public void writeGroupBeans() {
    Injector injector = Guice.createInjector(new ModelModule());
    BeanJsonLibConverter converter = injector
        .getInstance(BeanJsonLibConverter.class);
    RoleBean maintain = new RoleBean("Maintain Role", new String[]{"read","write","delete"});
    RoleBean access = new RoleBean("Access Role", new String[]{"read"});
    
    GroupBean groupBean = injector.getInstance(GroupBean.class);
    groupBean.setDescription("Test Group Bean");
    groupBean.setName("group-test");
    groupBean.setRoles(new RoleBean[] { access, maintain });
    String json = converter.convertToString(groupBean);
    LOG.info("Created GroupBean JSON " + json);
    GroupBean resultGroupBean = converter.convertToObject(json, GroupBean.class);
    LOG.info("Result GroupBean JSON " + converter.convertToString(resultGroupBean));
    
    assertEquals(groupBean.getDescription(), resultGroupBean.getDescription());
    assertEquals(groupBean.getName(), resultGroupBean.getName());
    assertEquals(groupBean.getRoles().length, resultGroupBean.getRoles().length);
    for ( int i = 0; i < groupBean.getRoles().length; i++ ) {
      assertEquals(groupBean.getRoles()[i].getName(), resultGroupBean.getRoles()[i].getName());
      assertArrayEquals(groupBean.getRoles()[i].getPermissions(),resultGroupBean.getRoles()[i].getPermissions());
    }
    
  }


}
