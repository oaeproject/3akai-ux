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

/**
 * A listener interface that users of a registry can implement to be notified of
 * changes in the registry. The registry must be added to the Registry in
 * question to be notified of changes.
 */
public interface RegistryListener<T> {
  /**
   * Invoked when an element is added to the registry. Implementors should not
   * throw any exception, the item has already been added and this is not an
   * opportunity to veto the addition.
   *
   * @param wasAdded
   *          the element that was added to the registry.
   */
  void added(T wasAdded);

  /**
   * Invoked when an element is removed from the registry. Implementors should
   * not throw any exception, the item has already been removed and this is not
   * an opportunity to veto the removal.
   *
   * @param wasRemoved
   *          the element that was removed from the registry.
   */
  void removed(T wasRemoved);

  /**
   * Invoked when an element is updated in the registry. Implementors should not
   * throw any exception, the item has already been updated and this is not an
   * opportunity to veto the update.
   *
   * @param wasUpdated
   *          the element that was updated in the registry.
   */
  void updated(T wasUpdated);
}
