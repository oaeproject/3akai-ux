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

import java.util.Properties;

import javax.persistence.EntityManager;
import javax.transaction.TransactionManager;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.ComponentActivator;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.RequiresStop;
import org.sakaiproject.kernel.api.ServiceManager;
import org.sakaiproject.kernel.api.ServiceManagerException;
import org.sakaiproject.kernel.api.ServiceSpec;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.authz.PermissionQueryService;
import org.sakaiproject.kernel.api.authz.ReferenceResolverService;
import org.sakaiproject.kernel.api.jcr.JCRRegistrationService;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.messaging.ChatMessagingService;
import org.sakaiproject.kernel.api.messaging.MessagingService;
import org.sakaiproject.kernel.api.persistence.DataSourceService;
import org.sakaiproject.kernel.api.presence.PresenceService;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.SiteService;
import org.sakaiproject.kernel.api.social.FriendsResolverService;
import org.sakaiproject.kernel.api.user.AuthenticationResolverService;
import org.sakaiproject.kernel.api.user.ProfileResolverService;
import org.sakaiproject.kernel.api.user.UserFactoryService;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.internal.api.KernelInitialization;
import org.sakaiproject.kernel.internal.api.KernelInitializtionException;
import org.sakaiproject.kernel.persistence.PersistenceModule;
import org.sakaiproject.kernel.util.ArrayUtils;
import org.sakaiproject.kernel.util.PropertiesLoader;

import com.google.inject.Guice;
import com.google.inject.Injector;

/**
 * Activates the Kernel Component.
 */
public class Activator implements ComponentActivator {

	/**
	 * A List of services that are loaded by the activator.
	 */
	private static final Class<?>[] SERVICE_CLASSES = { JCRService.class,
			JCRRegistrationService.class, JCRNodeFactoryService.class,
			UserResolverService.class, AuthenticationResolverService.class,
			CacheManagerService.class, SessionManagerService.class,
			AuthzResolverService.class, PermissionQueryService.class,
			ReferenceResolverService.class, DataSourceService.class,
			UserEnvironmentResolverService.class, RegistryService.class,
			EntityManager.class, SiteService.class,
			FriendsResolverService.class, ProfileResolverService.class,
			MessagingService.class, ChatMessagingService.class,
			UserFactoryService.class, BeanConverter.class,
			PresenceService.class, TransactionManager.class };
	/**
	 * The logger.
	 */
	private static final Log LOG = LogFactory.getLog(Activator.class);
	/**
	 * The service manager.
	 */
	private ServiceManager serviceManager;
	/**
	 * The guice injector used to start this component.
	 */
	private static Injector injector;

	/**
	 * Start the Kernel component, invoke the Guice injector and export
	 * services.
	 * 
	 * @param kernel
	 *            current kernel.
	 * @throws ComponentActivatorException
	 *             if the component failed to activate.
	 * @see org.sakaiproject.kernel.api.ComponentActivator#activate(org.sakaiproject
	 *      .kernel.api.Kernel)
	 */
	public void activate(Kernel kernel) throws ComponentActivatorException {
		// Start the injector for the kernel

		this.serviceManager = kernel.getServiceManager();
		Properties properties = PropertiesLoader.load(this.getClass()
				.getClassLoader(), KernelModule.DEFAULT_PROPERTIES,
				KernelModule.LOCAL_PROPERTIES,
				KernelModule.SYS_LOCAL_PROPERTIES);
		Activator.setInjector(Guice.createInjector(new KernelModule(kernel,
				properties), new PersistenceModule(kernel)));

		// export the services.
		try {
			for (Class<?> serviceClass : SERVICE_CLASSES) {
				exportService(serviceClass);
			}
		} catch (ServiceManagerException e) {
			throw new ComponentActivatorException(
					"Failed to start Kernel Component ", e);
		}

		try {
			injector.getInstance(KernelInitialization.class).initKernel();
		} catch (KernelInitializtionException e1) {
			throw new ComponentActivatorException(
					"Failed to initialize the Kernel into a Ready State ", e1);
		}

		LOG.info("Start Kernel Component; invoke Guice; export services:");
		for (ServiceSpec s : serviceManager.getServices()) {
			LOG.info("-> " + s);
		}

	}

	/**
	 * Export a service from the injector to the Service manager.
	 * 
	 * @param serviceClass
	 *            the class to export.
	 * @throws ServiceManagerException
	 *             when the service cannot be registered.
	 */
	private void exportService(Class<?> serviceClass)
			throws ServiceManagerException {
		Object service = injector.getInstance(serviceClass);
		LOG.info("Exporting " + serviceClass + " as " + service);
		if (service == null) {
			LOG
					.fatal("_______________________________________________________________"
							+ "_____________________");
			LOG
					.fatal("Exported Service "
							+ serviceClass
							+ " as null, this service is missing from the kernel and everything "
							+ "that depends on it will break!");
		} else {
			serviceManager.registerService(new ServiceSpec(serviceClass),
					service);
		}
	}

	/**
	 * Deactivate the component.
	 * 
	 * @see org.sakaiproject.kernel.api.ComponentActivator#deactivate()
	 */
	public void deactivate() {
		for (Class<?> serviceClass : SERVICE_CLASSES) {
			retractService(serviceClass);
		}
		LogFactory.release(this.getClass().getClassLoader());
	}

	/**
	 * Remove a service from the service manager.
	 * 
	 * @param serviceClass
	 *            the service class to retract.
	 */
	private void retractService(Class<?> serviceClass) {
		ServiceSpec spec = new ServiceSpec(serviceClass);
		Object service = serviceManager.getService(spec);
		serviceManager.deregisterService(spec);
		if (service instanceof RequiresStop) {
			((RequiresStop) service).stop();
		}
	}

	/**
	 * @return the injector, only available inside the kernel in test
	 *         environments.
	 */
	public static Injector getInjector() {
		return injector;
	}

	/**
	 * @param injector
	 *            the injector to set
	 */
	public static void setInjector(Injector injector) {
		Activator.injector = injector;
	}

	/**
	 * @return a list of classes that are registered from the kernel as
	 *         services.
	 */
	public static Class<?>[] getServiceClasses() {
		return ArrayUtils.copy(SERVICE_CLASSES,
				new Class<?>[SERVICE_CLASSES.length]);
	}

}
