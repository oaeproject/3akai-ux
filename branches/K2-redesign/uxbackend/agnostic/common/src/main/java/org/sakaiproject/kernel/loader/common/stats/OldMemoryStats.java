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

package org.sakaiproject.kernel.loader.common.stats;

/**
 * Old style memory statistics.
 *
 * @author ieb
 *
 */
public class OldMemoryStats extends AbstractStats implements MemoryStats {
  /**
   * A list of JMX names that represent the memory stats. (Sun JVM)
   */
  private static final String[] NAMES = new String[] {
      "java.lang:type=MemoryPool,name=Perm Gen",
      "java.lang:type=MemoryPool,name=Tenured Gen", "java.lang:type=MemoryPool,name=Code Cache",
      "java.lang:type=MemoryPool,name=Eden Space", "java.lang:type=MemoryPool,name=Survivor Space"
      };

  /**
   * The corresponding names.
   */
  private static final String[] LABELS = {"        Permgen Used ", "        Tenured Used ",
      "     Code Cache Used ", "           Eden Used ", "       Survivor Used " };

  /**
   * @return the labels to associate with the names.
   */
  protected String[] getLables() {
    return LABELS;
  }

  /**
   * @return the JMX names
   */
  protected String[] getNames() {
    return NAMES;
  }

}
