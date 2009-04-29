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

package org.sakaiproject.kernel.rest;

import java.util.List;
import java.util.Properties;

import javax.persistence.EntityManager;

import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.messaging.ChatMessagingService;
import org.sakaiproject.kernel.api.messaging.MessagingService;
import org.sakaiproject.kernel.api.presence.PresenceService;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.SiteService;
import org.sakaiproject.kernel.api.social.FriendsResolverService;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.component.core.guice.ServiceProvider;
import org.sakaiproject.kernel.util.PropertiesLoader;
import org.sakaiproject.kernel.webapp.Initialisable;

import com.google.inject.AbstractModule;
import com.google.inject.Scopes;
import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;

/**
 * A Guice module used to create the rest component.
 */
public class RestModule extends AbstractModule {

  /**
   * Location of the rest properties.
   */
  public static final String DEFAULT_PROPERTIES = "res://kernel-rest.properties";
  private Properties properties;
  private Kernel kernel;

  /**
   * Create the bootstrap module with a kernel and supplied properties.
   *
   * @param kernel
   * @param properties
   */
  public RestModule() {

    properties = PropertiesLoader.load(this.getClass().getClassLoader(),
        DEFAULT_PROPERTIES);
  }

  /**
   * Configure the guice bindings.
   *
   * @see com.google.inject.AbstractModule#configure()
   */
  @Override
  protected void configure() {
    Names.bindProperties(this.binder(), properties);

    // get the kernel
    KernelManager kernelManager = new KernelManager();
    kernel = kernelManager.getKernel();

    // get the service manager
    ServiceManager serviceManager = kernel.getServiceManager();
    bind(Kernel.class).toInstance(kernel);
    bind(ServiceManager.class).toInstance(serviceManager);

    // make some services available
    
    //	messages
    bind(MessagingService.class).toProvider(
            new ServiceProvider<MessagingService>(serviceManager, MessagingService.class)).in(
            Scopes.SINGLETON);
    bind(ChatMessagingService.class).toProvider(
	    new ServiceProvider<ChatMessagingService>(serviceManager, ChatMessagingService.class)).in(
	    Scopes.SINGLETON);
    
    bind(RegistryService.class).toProvider(
        new ServiceProvider<RegistryService>(serviceManager, RegistryService.class)).in(
        Scopes.SINGLETON);
    bind(SessionManagerService.class).toProvider(
        new ServiceProvider<SessionManagerService>(serviceManager,
            SessionManagerService.class)).in(Scopes.SINGLETON);
    bind(UserEnvironmentResolverService.class).toProvider(
        new ServiceProvider<UserEnvironmentResolverService>(serviceManager,
            UserEnvironmentResolverService.class)).in(Scopes.SINGLETON);
    bind(ProfileResolverService.class).toProvider(
        new ServiceProvider<ProfileResolverService>(serviceManager,
            ProfileResolverService.class)).in(Scopes.SINGLETON);
    bind(EntityManager.class).toProvider(
        new ServiceProvider<EntityManager>(serviceManager, EntityManager.class)).in(
        Scopes.SINGLETON);
    bind(FriendsResolverService.class).toProvider(
        new ServiceProvider<FriendsResolverService>(serviceManager,
            FriendsResolverService.class)).in(Scopes.SINGLETON);
    bind(UserFactoryService.class)
        .toProvider(
            new ServiceProvider<UserFactoryService>(serviceManager,
                UserFactoryService.class)).in(Scopes.SINGLETON);
    bind(JCRNodeFactoryService.class).toProvider(
        new ServiceProvider<JCRNodeFactoryService>(serviceManager,
            JCRNodeFactoryService.class)).in(Scopes.SINGLETON);
    bind(JCRService.class).toProvider(
        new ServiceProvider<JCRService>(serviceManager, JCRService.class)).in(
        Scopes.SINGLETON);
    bind(UserResolverService.class).toProvider(
        new ServiceProvider<UserResolverService>(serviceManager,
            UserResolverService.class)).in(Scopes.SINGLETON);
    bind(BeanConverter.class).toProvider(
        new ServiceProvider<BeanConverter>(serviceManager, BeanConverter.class)).in(
        Scopes.SINGLETON);

    bind(PresenceService.class).toProvider(
        new ServiceProvider<PresenceService>(serviceManager, PresenceService.class)).in(
        Scopes.SINGLETON);
    bind(SiteService.class).toProvider(
        new ServiceProvider<SiteService>(serviceManager, SiteService.class)).in(
        Scopes.SINGLETON);

    bind(AuthzResolverService.class).toProvider(
        new ServiceProvider<AuthzResolverService>(serviceManager, AuthzResolverService.class)).in(
        Scopes.SINGLETON);

    bind(PermissionQueryService.class).toProvider(
        new ServiceProvider<PermissionQueryService>(serviceManager, PermissionQueryService.class)).in(
        Scopes.SINGLETON);
    
    

    // activate all the services
    TypeLiteral<List<Initialisable>> initType = new TypeLiteral<List<Initialisable>>() {
    };
    bind(initType).toProvider(RestServiceListProvider.class).asEagerSingleton();

  }
}