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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import com.google.inject.Guice;
import com.google.inject.Injector;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.Test;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.model.UserEnvironmentBean;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConverter;
import org.sakaiproject.kernel.util.ResourceLoader;

import java.io.IOException;


/**
 * 
 */
public class UserEnvironmentBeanUT {

  private static final Log LOG = LogFactory
      .getLog(UserEnvironmentBeanUT.class);
  private static final String[] USERS = { "admin", "ib236" };
  private static final String TEST_USERENV = "res://org/sakaiproject/kernel/test/sampleuserenv/";

  @Test
  public void testUserEnvironmentLoad() throws IOException {
    Injector injector = Guice.createInjector(new ModelModule());
    BeanJsonLibConverter converter = injector
        .getInstance(BeanJsonLibConverter.class);
    ClassLoader classLoader = this.getClass().getClassLoader();
    for (String user : USERS) {
      String json = ResourceLoader.readResource(TEST_USERENV + user + ".json",
          classLoader);
      UserEnvironmentBean userEnvironmentBean = converter.convertToObject(json,
          UserEnvironmentBean.class);
      LOG.info("Loaded " + converter.convertToString(userEnvironmentBean));
    }
  }

  @Test
  public void writeUserEnvironmentBeans() {
    Injector injector = Guice.createInjector(new ModelModule());
    BeanJsonLibConverter converter = injector
        .getInstance(BeanJsonLibConverter.class);
    String[] subjects = new String[5];
    subjects[0] = "group1:maintain";
    subjects[1] = "group2:maintain";
    subjects[2] = "group3:maintain";
    subjects[3] = "group4:maintain";
    subjects[4] = ".engineering:student";
    UserEnvironmentBean uenvBean = injector
        .getInstance(UserEnvironmentBean.class);
    uenvBean.setUuid("ib236");
    uenvBean.setEid("raven:ib236");
      uenvBean.setSubjects(subjects);
    uenvBean.setSuperUser(false);
    uenvBean.seal();
    String json = converter.convertToString(uenvBean);
    LOG.info("Created UserEnvironment JSON " + json);
  }

  @Test
  public void testUserEnvironmentValid() throws IOException {
    Injector injector = Guice.createInjector(new ModelModule());
    BeanJsonLibConverter converter = injector
        .getInstance(BeanJsonLibConverter.class);

    String[] subjects = new String[5];
    subjects[0] = "group1:maintain";
    subjects[1] = "group2:maintain";
    subjects[2] = "group3:maintain";
    subjects[3] = "group4:maintain";
    subjects[4] = ".engineering:student";
    UserEnvironmentBean uenvBean = injector
        .getInstance(UserEnvironmentBean.class);
    uenvBean.setUuid("ib236");
    uenvBean.setEid("raven:ib236");
    uenvBean.setSubjects(subjects);
    uenvBean.setSuperUser(false);
    uenvBean.seal();
    String json = converter.convertToString(uenvBean);
    LOG.info("Checking " + converter.convertToString(uenvBean));

    UserEnvironmentBean userEnvironmentBean = converter.convertToObject(json,
        UserEnvironmentBean.class);
    checkUserEnvironmentEquals(uenvBean, subjects,json, converter, userEnvironmentBean);

    subjects = new String[0];
    uenvBean = injector.getInstance(UserEnvironmentBean.class);
    uenvBean.setUuid("admin");
    uenvBean.setEid("admin");
    uenvBean.setSubjects(subjects);
    uenvBean.setSuperUser(true);
    uenvBean.seal();
    json = converter.convertToString(uenvBean);
    LOG.info("Checking " + converter.convertToString(uenvBean));
    userEnvironmentBean = converter.convertToObject(json,
        UserEnvironmentBean.class);
    checkUserEnvironmentEquals(uenvBean, subjects,json, converter, userEnvironmentBean);

  }

  /**
   * @param uenvBean
   * @param userEnvironmentBean
   */
  private void checkUserEnvironmentEquals(UserEnvironmentBean uenvBean,
      String[] subjects, String json, BeanConverter converter,
      UserEnvironmentBean userEnvironmentBean) {
    assertEquals(false, userEnvironmentBean.hasExpired());
    assertEquals(uenvBean.getUser().getUuid(), userEnvironmentBean.getUser().getUuid());
    assertEquals(uenvBean.isSuperUser(), userEnvironmentBean.isSuperUser());
    String[] subjectList = userEnvironmentBean.getSubjects();
    if (subjects != null) {
      assertNotNull(subjectList);

      assertEquals(subjects.length, subjectList.length);
      for (int i = 0; i < subjects.length; i++) {
        assertEquals(subjects[i], subjectList[i]);
      }
    } else {
      assertNull(subjectList);
    }
    assertEquals(json, converter.convertToString(userEnvironmentBean));
    LOG.info("Checked " + converter.convertToString(userEnvironmentBean));
  }

}
