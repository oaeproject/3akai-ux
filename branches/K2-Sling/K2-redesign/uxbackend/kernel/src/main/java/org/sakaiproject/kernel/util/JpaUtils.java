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
package org.sakaiproject.kernel.util;

import org.sakaiproject.kernel.util.rest.CollectionOptions;
import org.sakaiproject.kernel.util.rest.CollectionOptions.FilterOption;
import org.sakaiproject.kernel.util.rest.CollectionOptions.PagingOptions;
import org.sakaiproject.kernel.util.rest.CollectionOptions.SortOption;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.persistence.EntityManager;
import javax.persistence.Query;

/**
 * 
 */
public class JpaUtils {

  /**
   * Get a paged, sorted, result list
   * 
   * @param entityManager
   * @param sql
   * @param prefix
   * @param collectionOptions
   * @return
   */
  @SuppressWarnings("unchecked")
  public static <T> List<T> getResultList(EntityManager entityManager, String sql,
      String prefix, Map<String, Object> parameters, CollectionOptions collectionOptions) {
    StringBuilder queryText = new StringBuilder(sql);
    if (collectionOptions != null) {
      int i = 0;
      for (FilterOption fo : collectionOptions.getFilterOptions()) {
        if (i != 0) {
          queryText.append(" and ");
        } else {
          queryText.append(" where ");
        }
        queryText.append(prefix).append(fo.getFilterBy()).append(" ").append(
            fo.getFilterOp()).append(" :fb").append(i++);
      }
      i = 0;
      for (SortOption fo : collectionOptions.getSortOptions()) {
        if (i != 0) {
          queryText.append(", ");
        } else {
          queryText.append(" order by ");
        }
        queryText.append(prefix).append(fo.getField()).append(" ").append(
            fo.getDirection());
      }

    }
    Query q = entityManager.createQuery(queryText.toString());
    if (collectionOptions == null) {
      q.setFirstResult(0);
      q.setMaxResults(10);
    } else {
      PagingOptions pagingOptions = collectionOptions.getPagingOptions();
      q.setFirstResult(pagingOptions.getStartIndex());
      q.setMaxResults(pagingOptions.getCount());
    }
    if ( parameters != null ) {
      for ( Entry<String, Object> param : parameters.entrySet() ) {
        q.setParameter(param.getKey(), param.getValue());
      }
    }
    return (List<T>) q.getResultList();
  }

}
