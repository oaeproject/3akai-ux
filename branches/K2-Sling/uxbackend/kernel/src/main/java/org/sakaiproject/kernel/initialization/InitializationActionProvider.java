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
package org.sakaiproject.kernel.initialization;

import com.google.common.collect.ImmutableList;
import com.google.inject.Inject;
import com.google.inject.Provider;

import org.sakaiproject.kernel.internal.api.InitializationAction;
import org.sakaiproject.kernel.jcr.jackrabbit.KernelSessionStart;
import org.sakaiproject.kernel.jcr.jackrabbit.KernelSessionStop;
import org.sakaiproject.kernel.jcr.jackrabbit.RepositoryBuilder;
import org.sakaiproject.kernel.jcr.jackrabbit.RepositoryInitializationAction;

import java.util.List;

/**
 * This is a list of initialization actions to perform when the kernel starts.
 * To add more, edit this file (which is configuration) and add more actions to
 * the constructor.
 */
public class InitializationActionProvider implements
    Provider<List<InitializationAction>> {

  /**
   * The list of actions.
   */
  private List<InitializationAction> actions;

  /**
   * create the list of actions for the provider.
   */
  @Inject
  public InitializationActionProvider(RepositoryBuilder repositoryBuilder,
      KernelSessionStart kernelSessionStart,
      RepositoryInitializationAction repositoryInitialization,
      KernelSessionStop kernelSessionStop) {
    actions = ImmutableList.of(repositoryBuilder, kernelSessionStart,
        repositoryInitialization, kernelSessionStop);
  }

  /**
   * {@inheritDoc}
   *
   * @see com.google.inject.Provider#get()
   */
  public List<InitializationAction> get() {
    return actions;
  }

}
