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

import com.google.inject.Guice;
import com.google.inject.Injector;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.Test;
import org.sakaiproject.kernel.model.FriendBean;
import org.sakaiproject.kernel.model.FriendStatus;
import org.sakaiproject.kernel.model.FriendsBean;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConverter;
import org.sakaiproject.kernel.util.ResourceLoader;

import java.io.IOException;
import java.util.List;

/**
 *
 */
public class FriendsBeanUT {

  private static final Log LOG = LogFactory.getLog(FriendsBeanUT.class);
  private static final String TEST_FRIENDS = "res://org/sakaiproject/kernel/test/samplefriends/";
  private static final String[] FRIENDS_TESTS = { "test1", "test2" };

  @Test
  public void testFriendsBeanLoad() throws IOException {
    Injector injector = Guice.createInjector(new ModelModule());
    BeanJsonLibConverter converter = injector
        .getInstance(BeanJsonLibConverter.class);
    ClassLoader classLoader = this.getClass().getClassLoader();
    for (String test : FRIENDS_TESTS) {
      String json = ResourceLoader.readResource(TEST_FRIENDS + test + ".json",
          classLoader);
      FriendsBean friendsBean = converter.convertToObject(json,
          FriendsBean.class);
      String after = converter.convertToString(friendsBean);
      assertEquals(StringUtils.deleteWhitespace(json), StringUtils
          .deleteWhitespace(after));
      LOG.info("Loaded " + after);
    }
  }

  @Test
  public void writeFriendsBeans() {
    Injector injector = Guice.createInjector(new ModelModule());
    BeanJsonLibConverter converter = injector
        .getInstance(BeanJsonLibConverter.class);

    FriendsBean fb = injector.getInstance(FriendsBean.class);
    fb.setUuid("person1");
    fb.addFriend(new FriendBean("person1", "person2", FriendStatus.INVITED));
    fb.addFriend(new FriendBean("person1", "person3", FriendStatus.ACCEPTED));
    fb.addFriend(new FriendBean("person1", "person4", FriendStatus.BLOCKED));
    fb.addFriend(new FriendBean("person1", "person5", FriendStatus.PENDING));
    fb.addFriend(new FriendBean("person1", "person6", FriendStatus.INVITED));
    fb.addFriend(new FriendBean("person1", "person7", FriendStatus.INVITED));
    fb.addFriend(new FriendBean("person1", "person8", FriendStatus.INVITED));
    String json = converter.convertToString(fb);
    LOG.info("Friends JSON " + json);
    FriendsBean friendsBean = converter
        .convertToObject(json, FriendsBean.class);
    assertEquals(fb.getUuid(), friendsBean.getUuid());
    List<FriendBean> fbs = fb.getFriends();
    List<FriendBean> friendsBeans = fb.getFriends();
    assertEquals(fbs.size(), friendsBeans.size());
    for (int i = 0; i < fbs.size(); i++) {
      FriendBean fbb = fbs.get(i);
      FriendBean friendB = friendsBeans.get(i);
      assertEquals(fbb.getPersonUuid(), friendB.getPersonUuid());
      assertEquals(fbb.getFriendUuid(), friendB.getFriendUuid());
      assertEquals(fbb.getLastUpdate(), friendB.getLastUpdate());
      assertEquals(fbb.getStatus(), friendB.getStatus());
    }

  }

}
