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
package org.sakaiproject.kernel.util.rest;

import com.google.common.collect.Lists;

import java.util.List;

import javax.ws.rs.core.MultivaluedMap;

/**
 * Provides the same sorting and filtering options as open social derived from opensearch.
 */
public class CollectionOptions {

  public enum SortOrder {
    asc(), desc();
  }

  public static class SortOption {
    private String field;
    private SortOrder direction;

    /**
     *
     */
    public SortOption(String field, SortOrder direction) {
      this.field = field;
      this.direction = direction;
    }

    /**
     * @return the field
     */
    public String getField() {
      return field;
    }

    /**
     * @return the direction
     */
    public SortOrder getDirection() {
      return direction;
    }
  }

  public static class PagingOptions {
    private int startIndex;
    private int count;
    private int end;
    private int size;

    /**
     *
     */
    public PagingOptions(int startIndex, int count) {
      this.startIndex = startIndex;
      this.count = count;
      this.end = startIndex + count;
    }

    /**
     * @return the startIndex
     */
    public int getStartIndex() {
      return startIndex;
    }

    /**
     * @return the count
     */
    public int getCount() {
      return count;
    }

    /**
     * @return the end
     */
    public int getEnd() {
      return end;
    }

    /**
     * @return
     */
    public int size() {
      return size;
    }
    /**
     * @param size the size to set
     */
    public void setSize(int size) {
      this.size = size;
    }
  }

  public static class FilterOption {
    private String filterBy;
    private String filterValue;
    private String filterOp;

    /**
     * @param string
     * @param string2
     * @param string3
     */
    public FilterOption(String filterBy, String filterOp, String filterValue) {
      this.filterBy = filterBy;
      this.filterValue = filterValue;
      this.filterOp = filterOp;
    }

    /**
     * @return the filterBy
     */
    public String getFilterBy() {
      return filterBy;
    }

    /**
     * @return the filterOp
     */
    public String getFilterOp() {
      return filterOp;
    }

    /**
     * @return the filterValue
     */
    public String getFilterValue() {
      return filterValue;
    }
  }

  public static final String START_INDEX = "startIndex";
  public static final String COUNT = "count";
  public static final String SORT_BY = "sortBy";
  public static final String SORT_ORDER = "sortOrder";
  public static final String FILTER_BY = "filterBy";
  public static final String FILTER_OPERATION = "filterOp";
  public static final String FILTER_VALUE = "filterValue";
  public static final String FIELDS = "fields";// Opensocial defaults
  private List<SortOption> sortOptions;
  private PagingOptions pagingOptions;
  private List<FilterOption> filterOptions;
  private List<String> fields;

  /**
   * @ requesteters
   */
  public CollectionOptions(MultivaluedMap<String, String> requesteters) {
    int startIndex = 0;
    try {
      startIndex = Integer.parseInt(requesteters.getFirst(START_INDEX));
    } catch (Exception ex) {
      startIndex = 0;
    }

    int count = 20;
    try {
      count = Integer.parseInt(requesteters.getFirst(COUNT));
    } catch (Exception ex) {
      count = 20;
    }
    pagingOptions = new PagingOptions(startIndex, count);

    sortOptions = Lists.newArrayList();
    List<String> sortBy = requesteters.get(SORT_BY);
    List<String> sortOrder = requesteters.get(SORT_ORDER);
    if (sortBy != null) {
      if (sortOrder != null) {
        if (sortBy.size() == sortOrder.size()) {
          for (int i = 0; i < sortBy.size(); i++) {
            sortOptions.add(new SortOption(sortBy.get(i), SortOrder.valueOf(sortOrder
                .get(i))));
          }
        } else {
          throw new IllegalArgumentException("The size of the the sort by array must be "
              + "the same as the order by array");
        }

      } else {
        for (int i = 0; i < sortBy.size(); i++) {
          sortOptions.add(new SortOption(sortBy.get(i), SortOrder.asc));
        }
      }
    }

    List<String> filterBy = requesteters.get(FILTER_BY);
    List<String> filterOperation = requesteters.get(FILTER_OPERATION);
    List<String> filterValue = requesteters.get(FILTER_VALUE);
    filterOptions = Lists.newArrayList();
    if (filterBy != null) {
      if (filterOperation != null) {
        if (filterValue != null) {
          if (filterBy.size() == filterOperation.size()
              && filterBy.size() == filterOperation.size()) {
            for (int i = 0; i < filterBy.size(); i++) {
              filterOptions.add(new FilterOption(filterBy.get(i),
                  filterOperation.get(i), filterValue.get(i)));
            }
          } else {
            throw new IllegalArgumentException(
                "The size of the the fitering arrays mus match");
          }
        } else {
          throw new IllegalArgumentException(
              "The size of the the fitering arrays mus match");
        }
      } else {
        throw new IllegalArgumentException(
            "The size of the the fitering arrays mus match");
      }
    }
    fields = requesteters.get(FIELDS);
  }

  public CollectionOptions(int startIndex,int count){
    pagingOptions = new PagingOptions(startIndex, count);
    sortOptions = Lists.newArrayList();
    filterOptions = Lists.newArrayList();
    fields = Lists.newArrayList();
    fields.add("firstName");
    fields.add("lastName");
  }

  /**
   * @return the fields
   */
  public List<String> getFields() {
    return fields;
  }

  /**
   * @return the filterOptions
   */
  public List<FilterOption> getFilterOptions() {
    return filterOptions;
  }

  /**
   * @return the pagingOptions
   */
  public PagingOptions getPagingOptions() {
    return pagingOptions;
  }

  /**
   * @return the sortOptions
   */
  public List<SortOption> getSortOptions() {
    return sortOptions;
  }

  public void addSortOption(String field, SortOrder order) {
    sortOptions.add(new SortOption(field,order));
  }

  public void addFilterOption(String filterBy, String filterOp, String filterValue) {
    filterOptions.add(new FilterOption(filterBy,filterOp,filterValue));
  }

}
