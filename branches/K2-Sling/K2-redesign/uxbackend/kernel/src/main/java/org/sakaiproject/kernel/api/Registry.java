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
package org.sakaiproject.kernel.api;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * An interface representing a registry. Implementations of this will probably
 * use memory management techniques and so anything intending to add items to
 * this should not assume that the registry will maintain references to their
 * objects to prevent garbage collection.
 * </p>
 * <p>
 * This means that you <b>must</b> keep a local reference to the element that is
 * added to the registry in you local classes to keep it from being garbage
 * collected.
 * </p>
 * <p>
 * If you do
 * </p>
 *
 * <pre>
 * Registry r;
 * r.add(new RestProvider());
 * </pre>
 *
 * The RestProvider just created will immediately be garbage collected and be
 * removed from the registry. You should do
 *
 * <pre>
 *
 * private RestProvider restProvider;
 *
 * public init() {
 *   Registry r;
 *   restProvider = new RestProvider();
 *   r.add(restProvider);
 * }
 * </pre>
 * <p>
 * And maintain a reference to the class that contains the property
 * <i>restProvider</i>.
 * </p>
 * <h2>Lifecycle</h2>
 * <p>
 * Although this class contains a add and remove, and invoking add and remove
 * will add and remove entries and notify any listeners. The class maintains
 * only weak references to the items added. If all other references are removed,
 * then the item in the registry will also be removed by and internal process.
 * </p>
 * <p>
 * The same goes for any listener added to the registry.
 * </p>
 * <p>
 * If Providers are remove by the Garbage Gollector the remove events will not
 * fire. So it is important where you know that a consumer is holding a
 * reference to explicity invoke remove, if your classloader is not be held in
 * an open state.
 * </p>
 *
 */
public interface Registry<V, T extends Provider<V>> {

  /**
   * Add a provider to the registry, be certain to keep a reference to whatever
   * is added to prevent the garbage collector from cleaning up the Provider.
   *
   * @param provider
   *          the provider to be added.
   */
  void add(T provider);

  /**
   * Explicitly remove a provider from the registry.
   *
   * @param provider
   *          the provider to be removed, if it exists.
   */
  void remove(T provider);

  /**
   * Get a list of Providers, sorted by the provider priority from the registry.
   * Anything invoking this should be wary of holding references to anything in
   * the List and should ensure that the component that added the item to the
   * list explicitly invokes remove to notify anything holding a reference to
   * release it.
   *
   * @return a sorted list of providers
   */
  List<T> getList();

  /**
   * Get a Map of providers keyed by the provider key. Anything working with the
   * contents of this map should not hold onto any references to the content if
   * the component that added the contents of the map is not going to explicitly
   * invoke remove. If any references are held, a listener must be registered to
   * enable those references to be dropped at the appropriate moment.
   *
   * @return a Map of providers.
   */
  Map<V, T> getMap();

  /**
   * Add a listener to the registry to be notified of changes. The class adding
   * the listener <b>must</b> hold onto a reference to the listener.
   *
   * @param listener
   *          the listener to add
   */
  void addListener(RegistryListener<T> listener);

  /**
   * Explicitly Remove a listener from the registry. This will happen
   * automatically when the classes holding references to the listener are
   * garbage collected. No events are fired on listener removal and anything
   * implementing a registry should not expose the listeners to external
   * classes that might hold references.
   *
   * @param listener the listern to remove.
   */
  void removeListener(RegistryListener<T> listener);

}
