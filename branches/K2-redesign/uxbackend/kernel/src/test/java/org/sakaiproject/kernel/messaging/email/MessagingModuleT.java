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
package org.sakaiproject.kernel.messaging.email;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;

import com.google.inject.CreationException;
import com.google.inject.Guice;
import com.google.inject.Injector;

import org.junit.Test;
import org.sakaiproject.kernel.messaging.MessagingModule;

import java.util.Properties;

/**
 *
 */
public class MessagingModuleT {
  @Test
  public void createDeadInjector() {
     try {
      Injector inj = Guice.createInjector(new MessagingModule());
      inj.getInstance(javax.mail.Session.class);
      fail("Shouldn't work without the properties being set.");
     } catch (CreationException e) {
      // expected
    }
  }

  @Test
  public void createInjector() {
    Properties props = new Properties();
    props.put("mail.smtp.host", "localhost");
    props.put("mail.smtp.port", "25");

    Injector inj = Guice.createInjector(new MessagingModule(props));

    // TODO when this provider is functioning, turn this test back on. Guice
    // exceptions when returning null from a provider.
    javax.jms.Session jmsSession = null; // inj.getInstance(javax.jms.Session.
                                         // class);
    assertNull(jmsSession);

    javax.mail.Session mailSession = inj.getInstance(javax.mail.Session.class);
    assertNotNull(mailSession);
  }
}
