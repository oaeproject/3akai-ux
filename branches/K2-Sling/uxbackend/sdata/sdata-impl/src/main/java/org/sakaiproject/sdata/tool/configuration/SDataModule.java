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
package org.sakaiproject.sdata.tool.configuration;

import com.google.inject.AbstractModule;
import com.google.inject.CreationException;
import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;
import com.google.inject.spi.Message;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.component.core.guice.ServiceProvider;
import org.sakaiproject.kernel.util.ResourceLoader;
import org.sakaiproject.sdata.tool.JCRHandler;
import org.sakaiproject.sdata.tool.JCRUserStorageHandler;
import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.api.HandlerSerialzer;
import org.sakaiproject.sdata.tool.api.ResourceDefinitionFactory;
import org.sakaiproject.sdata.tool.api.SDataFunction;
import org.sakaiproject.sdata.tool.api.SecurityAssertion;
import org.sakaiproject.sdata.tool.json.JsonHandlerSerializer;
import org.sakaiproject.sdata.tool.util.NullSecurityAssertion;
import org.sakaiproject.sdata.tool.util.ResourceDefinitionFactoryImpl;
import org.sakaiproject.sdata.tool.util.UserResourceDefinitionFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Map;
import java.util.Properties;

/**
 *
 */
public class SDataModule extends AbstractModule {

  /**
   * Location of the kernel properties.
   */
  private final static String DEFAULT_PROPERTIES = "res://sdata.properties";

  private static final Log LOG = LogFactory.getLog(SDataModule.class);

  /**
   * The properties for the kernel
   */
  private final Properties properties;

  private final Kernel kernel;

  public SDataModule(Kernel kernel) {
    this.kernel = kernel;

    InputStream is = null;
    try {
      is = ResourceLoader.openResource(DEFAULT_PROPERTIES, this.getClass()
          .getClassLoader());
      properties = new Properties();
      properties.load(is);
      LOG.info("Loaded " + properties.size() + " properties from "
          + DEFAULT_PROPERTIES);
    } catch (IOException e) {
      throw new CreationException(Arrays.asList(new Message(
          "Unable to load properties: " + DEFAULT_PROPERTIES)));
    } finally {
      try {
        if (is != null) {
          is.close();
        }
      } catch (IOException e) {
        // dont care about this.
      }
    }
  }

  /**
   * Configure the guice bindings.
   *
   * @see com.google.inject.AbstractModule#configure()
   */
  @Override
  protected void configure() {
    Names.bindProperties(this.binder(), properties);

    TypeLiteral<Map<String, SDataFunction>> sdfunctionMap = new TypeLiteral<Map<String, SDataFunction>>() {
    };

    bind(ResourceDefinitionFactory.class).annotatedWith(
        Names.named(JCRHandler.RESOURCE_DEFINITION_FACTORY)).to(
        ResourceDefinitionFactoryImpl.class);

    bind(sdfunctionMap).annotatedWith(
        Names.named(JCRHandler.RESOURCE_FUNCTION_FACTORY)).toProvider(
        JCRHandlerFunctionProvider.class);
    bind(HandlerSerialzer.class).annotatedWith(
        Names.named(JCRHandler.RESOURCE_SERIALIZER)).to(
        JsonHandlerSerializer.class);

    bind(ResourceDefinitionFactory.class).annotatedWith(
        Names.named(JCRUserStorageHandler.RESOURCE_DEFINITION_FACTORY))
        .to(UserResourceDefinitionFactory.class);
    bind(sdfunctionMap).annotatedWith(
        Names.named(JCRUserStorageHandler.RESOURCE_FUNCTION_FACTORY))
        .toProvider(JCRUserHandlerFunctionProvider.class);
    bind(HandlerSerialzer.class).annotatedWith(
        Names.named(JCRUserStorageHandler.RESOURCE_SERIALIZER)).to(
        JsonHandlerSerializer.class);

    bind(new TypeLiteral<Map<String, Handler>>() {
    }).toProvider(SDataHandlerProvider.class);

    // Security is handled by JCR
    bind(SecurityAssertion.class).annotatedWith(
        Names.named(JCRHandler.SECURITY_ASSERTION)).to(
        NullSecurityAssertion.class);
    bind(SecurityAssertion.class).annotatedWith(
        Names.named(JCRUserStorageHandler.SECURITY_ASSERTION)).to(NullSecurityAssertion.class);

    // bind in the kernel services that we need.
    KernelManager km = new KernelManager();
    Kernel k = km.getKernel();
    ServiceManager sm = k.getServiceManager();

    // get the services we depend on
    bind(JCRService.class).toProvider(
        new ServiceProvider<JCRService>(sm,
            JCRService.class));
    bind(JCRNodeFactoryService.class).toProvider(
        new ServiceProvider<JCRNodeFactoryService>(sm,
            JCRNodeFactoryService.class));
    bind(PermissionQueryService.class).toProvider(
        new ServiceProvider<PermissionQueryService>(sm,
            PermissionQueryService.class));
    bind(AuthzResolverService.class).toProvider(
        new ServiceProvider<AuthzResolverService>(sm,
            AuthzResolverService.class));
    bind(ReferenceResolverService.class).toProvider(
        new ServiceProvider<ReferenceResolverService>(sm,
            ReferenceResolverService.class));

    bind(RegistryService.class).toProvider(
        new ServiceProvider<RegistryService>(kernel.getServiceManager(),
            RegistryService.class));
  }

  /**
   * @return the properties
   */
  public Properties getProperties() {
    return properties;
  }

}

