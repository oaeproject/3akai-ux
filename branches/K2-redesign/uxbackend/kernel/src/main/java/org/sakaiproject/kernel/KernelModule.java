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

import com.google.inject.AbstractModule;
import com.google.inject.Scopes;
import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;

import net.sf.ezmorph.Morpher;
import net.sf.json.JsonConfig;

import org.apache.jackrabbit.core.security.AccessManager;
import org.sakaiproject.kernel.api.ComponentManager;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.Provider;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ShutdownService;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.authz.SubjectPermissionService;
import org.sakaiproject.kernel.api.jcr.EventRegistration;
import org.sakaiproject.kernel.api.jcr.JCRRegistrationService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.SmartNodeHandler;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.locking.LockManager;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.messaging.EmailMessage;
import org.sakaiproject.kernel.api.messaging.Message;
import org.sakaiproject.kernel.api.messaging.MessageConverter;
import org.sakaiproject.kernel.api.messaging.MessageHandler;
import org.sakaiproject.kernel.api.messaging.MessagingService;
import org.sakaiproject.kernel.api.presence.PresenceService;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.SiteService;
import org.sakaiproject.kernel.api.social.FriendsResolverService;
import org.sakaiproject.kernel.api.user.AuthenticationManagerService;
import org.sakaiproject.kernel.api.user.AuthenticationResolverService;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserProvisionAgent;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.authz.simple.JcrReferenceResolverService;
import org.sakaiproject.kernel.authz.simple.PathReferenceResolverService;
import org.sakaiproject.kernel.authz.simple.SimpleAuthzResolverService;
import org.sakaiproject.kernel.authz.simple.SimpleJcrUserEnvironmentResolverService;
import org.sakaiproject.kernel.authz.simple.SimplePermissionQueryService;
import org.sakaiproject.kernel.authz.simple.SubjectPermissionServiceImpl;
import org.sakaiproject.kernel.component.core.guice.ServiceProvider;
import org.sakaiproject.kernel.initialization.InitializationActionProvider;
import org.sakaiproject.kernel.initialization.KernelInitializationImpl;
import org.sakaiproject.kernel.internal.api.InitializationAction;
import org.sakaiproject.kernel.internal.api.KernelInitialization;
import org.sakaiproject.kernel.jcr.api.JcrContentListener;
import org.sakaiproject.kernel.jcr.api.internal.StartupAction;
import org.sakaiproject.kernel.jcr.jackrabbit.JCRRegistrationServiceImpl;
import org.sakaiproject.kernel.jcr.jackrabbit.JCRServiceImpl;
import org.sakaiproject.kernel.jcr.jackrabbit.JcrSynchronousContentListenerAdapter;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.SecureSakaiAccessManager;
import org.sakaiproject.kernel.jcr.jackrabbit.sakai.StartupActionProvider;
import org.sakaiproject.kernel.jcr.smartNode.SmartNodeHandlerListProvider;
import org.sakaiproject.kernel.jcr.support.JCRNodeFactoryServiceImpl;
import org.sakaiproject.kernel.locking.LockManagerImpl;
import org.sakaiproject.kernel.memory.CacheManagerServiceImpl;
import org.sakaiproject.kernel.messaging.EmailMessageImpl;
import org.sakaiproject.kernel.messaging.JmsConnectionFactoryProvider;
import org.sakaiproject.kernel.messaging.JsonMessageConverter;
import org.sakaiproject.kernel.messaging.MessageImpl;
import org.sakaiproject.kernel.messaging.OutboxNodeHandlerListProvider;
import org.sakaiproject.kernel.messaging.email.EmailMessagingService;
import org.sakaiproject.kernel.messaging.email.MailSessionProvider;
import org.sakaiproject.kernel.model.UserEnvironmentBean;
import org.sakaiproject.kernel.presence.PresenceServiceImpl;
import org.sakaiproject.kernel.registry.RegistryServiceImpl;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConfig;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConverter;
import org.sakaiproject.kernel.serialization.json.BeanProcessor;
import org.sakaiproject.kernel.serialization.json.ValueProcessor;
import org.sakaiproject.kernel.session.SessionManagerServiceImpl;
import org.sakaiproject.kernel.site.SiteServiceImpl;
import org.sakaiproject.kernel.social.FriendsResolverServiceImpl;
import org.sakaiproject.kernel.user.AuthenticationResolverServiceImpl;
import org.sakaiproject.kernel.user.ProfileResolverServiceImpl;
import org.sakaiproject.kernel.user.ProviderAuthenticationResolverService;
import org.sakaiproject.kernel.user.ProviderUserResolverService;
import org.sakaiproject.kernel.user.UserProvisionAgentListProvider;
import org.sakaiproject.kernel.user.jcr.JcrUserFactoryService;
import org.sakaiproject.kernel.util.user.NullUserEnvironment;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.jms.ConnectionFactory;
import javax.servlet.http.HttpSession;

/**
 * A Guice module used to create the kernel component.
 */
public class KernelModule extends AbstractModule {

  /**
   * Location of the kernel properties.
   */
  public static final String DEFAULT_PROPERTIES = "res://kernel-component.properties";

  /**
   * the environment variable that contains overrides to kernel properties
   */
  public static final String LOCAL_PROPERTIES = "SAKAI_KERNEL_COMPONENT_PROPERTIES";

  /**
   * The System property name that contains overrides to the kernel properties resource
   */
  public static final String SYS_LOCAL_PROPERTIES = "sakai.kernel.component.properties";

  /**
   * The properties for the kernel
   */
  private final Properties properties;

  /**
   * The kernel which the bootstrap component exists within.
   */
  private final Kernel kernel;

  /**
   * Create the bootstrap module with a kernel and supplied properties.
   *
   * @param kernel
   * @param properties
   */
  public KernelModule(Kernel kernel, Properties properties) {
    this.properties = properties;
    this.kernel = kernel;
  }

  /**
   * Configure the guice bindings.
   *
   * @see com.google.inject.AbstractModule#configure()
   */
  @Override
  protected void configure() {
    Names.bindProperties(this.binder(), properties);
    ServiceManager serviceManager = kernel.getServiceManager();
    bind(Kernel.class).toInstance(kernel);
    bind(ServiceManager.class).toInstance(serviceManager);
    bind(ComponentManager.class).toInstance(kernel.getComponentManager());

    bind(ShutdownService.class).toProvider(
        new ServiceProvider<ShutdownService>(serviceManager, ShutdownService.class));

    bind(AuthzResolverService.class).to(SimpleAuthzResolverService.class).in(
        Scopes.SINGLETON);

    bind(PermissionQueryService.class).to(SimplePermissionQueryService.class).in(
        Scopes.SINGLETON);

    bind(ReferenceResolverService.class).to(PathReferenceResolverService.class).in(
        Scopes.SINGLETON);

    bind(SubjectPermissionService.class).to(SubjectPermissionServiceImpl.class).in(
        Scopes.SINGLETON);

    bind(JCRNodeFactoryService.class).to(JCRNodeFactoryServiceImpl.class).in(
        Scopes.SINGLETON);

    bind(JCRRegistrationService.class).to(JCRRegistrationServiceImpl.class).in(
        Scopes.SINGLETON);

    bind(JCRService.class).to(JCRServiceImpl.class).in(Scopes.SINGLETON);

    bind(CacheManagerService.class).to(CacheManagerServiceImpl.class)
        .in(Scopes.SINGLETON);

    bind(MessagingService.class).to(EmailMessagingService.class).in(Scopes.SINGLETON);

    bind(SessionManagerService.class).to(SessionManagerServiceImpl.class).in(
        Scopes.SINGLETON);

    bind(FriendsResolverService.class).to(FriendsResolverServiceImpl.class).in(
        Scopes.SINGLETON);

    bind(ProfileResolverService.class).to(ProfileResolverServiceImpl.class).in(
        Scopes.SINGLETON);

    bind(UserResolverService.class).to(ProviderUserResolverService.class).in(
        Scopes.SINGLETON);

    bind(PresenceService.class).to(PresenceServiceImpl.class).in(Scopes.SINGLETON);

    bind(UserEnvironmentResolverService.class).to(
        SimpleJcrUserEnvironmentResolverService.class).in(Scopes.SINGLETON);

    bind(RegistryService.class).to(RegistryServiceImpl.class).in(Scopes.SINGLETON);

    bind(KernelInitialization.class).to(KernelInitializationImpl.class).in(
        Scopes.SINGLETON);

    bind(UserEnvironment.class).to(UserEnvironmentBean.class);

    // JCR setup
    TypeLiteral<List<StartupAction>> startupActionType = new TypeLiteral<List<StartupAction>>() {
    };
    bind(startupActionType).toProvider(StartupActionProvider.class).in(Scopes.SINGLETON);

    // bind(Credentials.class).annotatedWith(
    // Names.named(JCRService.NAME_CREDENTIALS)).to(SakaiJCRCredentials.class);

    // Kernel initialization
    TypeLiteral<List<InitializationAction>> initializationActionType = new TypeLiteral<List<InitializationAction>>() {
    };
    bind(initializationActionType).toProvider(InitializationActionProvider.class).in(
        Scopes.SINGLETON);

    // bind(AccessManager.class).to(SakaiAccessManager.class);
    bind(AccessManager.class).to(SecureSakaiAccessManager.class);

    TypeLiteral<Map<String, ReferenceResolverService>> resolverMap = new TypeLiteral<Map<String, ReferenceResolverService>>() {
    };
    bind(resolverMap).toProvider(ReferenceResolverServiceProvider.class).in(
        Scopes.SINGLETON);

    bind(ReferenceResolverService.class).annotatedWith(
        Names.named(PathReferenceResolverService.DEFAULT_RESOLVER)).to(
        JcrReferenceResolverService.class).in(Scopes.SINGLETON);

    bind(BeanConverter.class).to(BeanJsonLibConverter.class).in(Scopes.SINGLETON);

    // site service
    bind(SiteService.class).to(SiteServiceImpl.class).in(Scopes.SINGLETON);

    // config for the bean converter
    bind(Map.class).to(HashMap.class);
    bind(List.class).to(ArrayList.class);
    bind(Map[].class).to(HashMap[].class);
    bind(JsonConfig.class).annotatedWith(Names.named("SakaiKernelJsonConfig")).to(
        BeanJsonLibConfig.class).in(Scopes.SINGLETON);

    bind(UserFactoryService.class).to(JcrUserFactoryService.class).in(Scopes.SINGLETON);

    bind(UserEnvironment.class).annotatedWith(Names.named(KernelConstants.NULLUSERENV))
        .to(NullUserEnvironment.class).in(Scopes.SINGLETON);

    TypeLiteral<Map<String, HttpSession>> sessionMap = new TypeLiteral<Map<String, HttpSession>>() {
    };
    bind(sessionMap).toProvider(SessionMapProvider.class).in(Scopes.SINGLETON);

    // event registration
    TypeLiteral<List<EventRegistration>> eventList = new TypeLiteral<List<EventRegistration>>() {
    };
    bind(eventList).toProvider(EventRegistrationProvider.class).in(Scopes.SINGLETON);

    TypeLiteral<List<JcrContentListener>> contentListeners = new TypeLiteral<List<JcrContentListener>>() {
    };
    bind(contentListeners).toProvider(JcrContentListenerProvider.class).in(
        Scopes.SINGLETON);

    TypeLiteral<List<JcrContentListener>> syncContentListeners = new TypeLiteral<List<JcrContentListener>>() {
    };
    bind(syncContentListeners).annotatedWith(
        Names.named(JcrSynchronousContentListenerAdapter.SYNCHRONOUS_LISTENERS))
        .toProvider(JcrSynchronousContentListenerProvider.class).in(Scopes.SINGLETON);

    TypeLiteral<List<ValueProcessor>> valueProcessors = new TypeLiteral<List<ValueProcessor>>() {
    };
    bind(valueProcessors).toProvider(ValueProcessorsProvider.class).in(Scopes.SINGLETON);

    TypeLiteral<List<BeanProcessor>> beanProcessors = new TypeLiteral<List<BeanProcessor>>() {
    };
    bind(beanProcessors).toProvider(BeanProcessorProvider.class).in(Scopes.SINGLETON);

    TypeLiteral<Map<String, Object>> jsonClassMap = new TypeLiteral<Map<String, Object>>() {
    };
    bind(jsonClassMap).annotatedWith(Names.named(KernelConstants.JSON_CLASSMAP))
        .toProvider(JsonClassMapProvider.class).in(Scopes.SINGLETON);

    TypeLiteral<List<Morpher>> jsonMorpherList = new TypeLiteral<List<Morpher>>() {
    };
    bind(jsonMorpherList).toProvider(JsonMorpherListProvider.class).in(Scopes.SINGLETON);

    // bind in the cached version
    bind(AuthenticationResolverService.class).to(AuthenticationResolverServiceImpl.class)
        .in(Scopes.SINGLETON);

    // bind in the authn manager
    bind(AuthenticationManagerService.class).to(AuthenticationResolverServiceImpl.class)
        .in(Scopes.SINGLETON);

    // then bind the provider container to the head
    bind(AuthenticationResolverService.class).annotatedWith(
        Names.named(AuthenticationResolverServiceImpl.RESOLVER_CHAIN_HEAD)).to(
        ProviderAuthenticationResolverService.class).in(Scopes.SINGLETON);

    bind(AuthenticationManagerService.class).annotatedWith(
        Names.named(AuthenticationResolverServiceImpl.RESOLVER_CHAIN_HEAD)).to(
        ProviderAuthenticationResolverService.class).in(Scopes.SINGLETON);

    // bring this list up early so it can register itself
    TypeLiteral<List<RestProvider>> restProviderList = new TypeLiteral<List<RestProvider>>() {
    };
    bind(restProviderList).toProvider(RestProviderListProvider.class).asEagerSingleton();

    // this is the list of all integrtion parts, annotated to avoid it being
    // used elsewhere by mistake.
    TypeLiteral<List<Provider<String>>> integrationProviderList = new TypeLiteral<List<Provider<String>>>() {
    };
    bind(integrationProviderList).annotatedWith(Names.named("forced-internal-1"))
        .toProvider(IntegrationProviderListProvider.class).asEagerSingleton();

    bind(javax.mail.Session.class).toProvider(MailSessionProvider.class).in(
        Scopes.SINGLETON);

    // bind(javax.jms.Session.class).toProvider(JmsSessionProvider.class).in(
    // Scopes.SINGLETON);
    bind(ConnectionFactory.class)
        .toProvider(JmsConnectionFactoryProvider.class).in(Scopes.SINGLETON);

    // messages
    bind(Message.class).to(MessageImpl.class);
    bind(EmailMessage.class).to(EmailMessageImpl.class);

    // message serializer
    bind(MessageConverter.class).to(JsonMessageConverter.class);

    // bring this smart node handler list up early so it can register itself
    TypeLiteral<List<SmartNodeHandler>> smartFolderHandlerList = new TypeLiteral<List<SmartNodeHandler>>() {
    };
    bind(smartFolderHandlerList).toProvider(SmartNodeHandlerListProvider.class)
        .asEagerSingleton();

    // bring in the outgoing message handler so it can register
    TypeLiteral<List<MessageHandler>> outboxNodeHandlerList = new TypeLiteral<List<MessageHandler>>() {
    };
    bind(outboxNodeHandlerList).toProvider(OutboxNodeHandlerListProvider.class)
        .asEagerSingleton();

    // lock manager
    bind(LockManager.class).to(LockManagerImpl.class).in(Scopes.SINGLETON);

    // bring in the user provision agents so they can register
    TypeLiteral<List<UserProvisionAgent>> userProvAgentList = new TypeLiteral<List<UserProvisionAgent>>() {
    };
    bind(userProvAgentList).toProvider(UserProvisionAgentListProvider.class)
        .asEagerSingleton();
  }
}
