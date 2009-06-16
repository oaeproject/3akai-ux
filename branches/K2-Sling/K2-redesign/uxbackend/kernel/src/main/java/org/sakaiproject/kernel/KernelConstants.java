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

package org.sakaiproject.kernel;

/**
 * Holds the configuration properties that are used in the kernel.
 */
public interface KernelConstants {

  String JCR_USERENV_BASE = "jcruserenv.base";
  String JCR_USERENV_TEMPLATES = "jcruserenv.templates";
  String JCR_DEFAULT_TEMPLATE = "jcruserenv.templates.default";
  String JCR_PROFILE_TEMPLATES = "jcrprofile.templates";
  String JCR_PROFILE_DEFAUT_TEMPLATES = "jcrprofile.templates.default";
  String JCR_SITE_TEMPLATES = "jcrsite.templates";
  String JCR_SITE_DEFAULT_TEMPLATE = "jcrsite.templates.default";

  /**
   * The property name defining the shared private data
   */
  String PRIVATE_SHARED_PATH_BASE = "jcrprivateshared.base";
  /**
   * The property name defining the data that is completely private to the user
   */
  String PRIVATE_PATH_BASE = "jcrprivate.base";
  /**
   * Setting: The time to live of User Env objects the local cache, this should
   * be set in the kernel properties file.
   */
  String TTL = "userenv.ttl";

  String PROP_ANON_ACCOUNTING = "rest.user.anonymous.account.creation";
  String ENTITY_MANAGER_SCOPE = "jpa.entitymanager.scope";

  String JDBC_DRIVER_NAME = "jdbc.driver";
  String JDBC_URL = "jdbc.url";
  String JDBC_USERNAME = "jdbc.username";
  String JDBC_PASSWORD = "jdbc.password";
  String JDBC_VALIDATION_QUERY = "jdbc.validation";
  String JDBC_DEFAULT_READ_ONLY = "jdbc.defaultReadOnly";
  String JDBC_DEFAULT_AUTO_COMMIT = "jdbc.defaultAutoCommit";
  String JDBC_DEFAULT_PREPARED_STATEMENTS = "jdbc.defaultPreparedStatement";
  String TRANSACTION_TIMEOUT_SECONDS = "transaction.timeoutSeconds";
  String DB_MIN_WRITE = "eclipselink.write.min";
  String DB_MIN_NUM_READ = "eclipselink.read.min";
  String DB_UNITNAME = "jpa.unitname";
  String SESSION_COOKIE = "http.global.cookiename";

  String GROUP_FILE_NAME = "groupdef.json";
  /**
   * The Name of the userenv file in the system.
   */
  String USERENV = "userenv";

  /**
   * The name of the profile file.
   */
  String PROFILE_JSON = "profile.json";

  /**
   * The name of the friends file
   */
  String FRIENDS_FILE = "friends.json";


  /**
   * Attribute used in the session to store a list of group memberships.
   */
  String GROUPMEMBERSHIP = "userenv.grouplist";
  String NULLUSERENV = "userenv.null";

  String SUBJECT_PROVIDER_REGISTRY = "subjectstatement.provider";
  /**
   * The name of the registry used for this type of service.
   */
  String AUTHENTICATION_PROVIDER_REGISTRY = "authentication.provider.registry";
  String MANAGER_PROVIDER_REGISTRY = "authentication.manager.provider.registry";
  /**
   * The name of the registry used for this type of service.
   */
  String USER_PROVIDER_REGISTRY = "user.provider.registry";

  String JSON_CLASSMAP = "jsonconverter.classmap";

  String OUTBOX = "outbox";
  String MESSAGES = "messages";

  String JMS_BROKER_URL = "jms.brokerurl";
  String JMS_EMAIL_TYPE = "jms.email.type";
  String JMS_EMAIL_QUEUE = "jms.email.queue";
}
