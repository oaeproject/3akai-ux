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

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

import javax.management.MBeanServer;
import javax.management.ObjectName;
import javax.management.openmbean.CompositeData;

import java.lang.management.ManagementFactory;

/**
 * Recording Statistics for Memory.
 */
public abstract class AbstractStats implements MemoryStats {

  /**
   * One K.
   */
  private static final long ONEK = 1024;

  /**
   * Should the Stats be active.
   */
  private static boolean active;

  /**
   * Starting measurements.
   */
  private static long[] statsStart;

  /**
   * @return a measurement
   */
  @SuppressWarnings(value = { "DM_GC", "REC_CATCH_EXCEPTION" },
      justification = "Requried to get memory stats")
  public String measure() {
    if (!active) {
      return "";
    }
    try {
      MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
      System.runFinalization();
      Runtime.getRuntime().gc();

      String[] names = getNames();
      String[] labels = getLables();
      long[] statsEnd = new long[names.length];

      for (int i = 0; i < names.length; i++) {
        CompositeData cd = (CompositeData) mbs.getAttribute(new ObjectName(
            names[i]), "Usage");
        statsEnd[i] = Long.parseLong(String.valueOf(cd.get("used")));
      }

      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < names.length; i++) {
        sb.append(labels[i]).append("\t").append((statsEnd[i] / (ONEK)))
            .append("\t").append((statsEnd[i] - statsStart[i]) / (ONEK))
            .append("\tKB\t");

      }
      statsStart = statsEnd;

      return sb.toString();

    } catch (Exception ex) {
      return "";
    }

  }

  /**
   * generate the baseline measurement.
   */
  @SuppressWarnings(value = { "DM_GC", "REC_CATCH_EXCEPTION",
      "ST_WRITE_TO_STATIC_FROM_INSTANCE_METHOD" }, justification = "Requried to get memory stats")
  public void baseLine() {
    try {
      MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
      System.runFinalization();
      Runtime.getRuntime().gc();

      String[] names = getNames();
      statsStart = new long[names.length];

      for (int i = 0; i < names.length; i++) {
        CompositeData cd = (CompositeData) mbs.getAttribute(new ObjectName(
            names[i]), "Usage");
        statsStart[i] = Long.parseLong(String.valueOf(cd.get("used")));
      }
      active = true;
    } catch (Exception ex) {
      active = false;
    }

  }

  /**
   * @return the names being used.
   */
  protected abstract String[] getNames();

  /**
   * @return the labels to use.
   */
  protected abstract String[] getLables();

}
