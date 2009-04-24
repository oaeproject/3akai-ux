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

import com.google.inject.CreationException;
import com.google.inject.spi.Message;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Properties;
import java.util.Map.Entry;

/**
 * Loads properties accepting overrides from named system variables and named
 * environment variables.
 */
public final class PropertiesLoader {
  private static final Log LOG = LogFactory.getLog(PropertiesLoader.class);

  /**
   * @param classLoader
   *          the classloader where the properties are to be loaded from.
   */
  /**
   * @param classLoader
   *          the classloader where the properties are to be loaded from.
   * @param defaultPropertiesLocation
   *          the default location in above name where the property will come
   *          from
   * @param localPropertiesName
   *          the name of the environment varaible that stores the local
   *          properties
   * @param sysPropertiesName
   *          the name of the java system property that contains local
   *          properties.
   * @return a properties set.
   */
  public static Properties load(ClassLoader classLoader,
      String defaultPropertiesLocation, String localPropertiesName,
      String sysPropertiesName) {
    InputStream is = null;
    Properties properties;
    try {
      is = ResourceLoader.openResource(defaultPropertiesLocation, classLoader);
      properties = new Properties();
      properties.load(is);
      LOG.info("Loaded " + properties.size() + " default properties from: "
          + defaultPropertiesLocation);
    } catch (IOException e) {
      throw new CreationException(Arrays.asList(new Message(
          "Unable to load properties: " + defaultPropertiesLocation)));
    } finally {
      try {
        if (is != null) {
          is.close();
        }
      } catch (IOException e) {
        // dont care about this.
      }
    }
    // load local properties if specified as a system property
    String localPropertiesLocation = System.getenv(localPropertiesName);
    String sysLocalPropertiesLocation = System.getProperty(sysPropertiesName);
    if (sysLocalPropertiesLocation != null) {
      localPropertiesLocation = sysLocalPropertiesLocation;
    }
    try {
      if (localPropertiesLocation != null
          && localPropertiesLocation.trim().length() > 0) {
        is = ResourceLoader.openResource(localPropertiesLocation, classLoader);
        Properties localProperties = new Properties();
        localProperties.load(is);
        for (Entry<Object, Object> o : localProperties.entrySet()) {
          String k = o.getKey().toString();
          if (k.startsWith("+")) {
            String p = properties.getProperty(k.substring(1));
            if (p != null) {
              properties.put(k.substring(1), p + o.getValue());
            } else {
              properties.put(o.getKey(), o.getValue());
            }
          } else {
            properties.put(o.getKey(), o.getValue());
          }
        }
        LOG.info("Loaded " + localProperties.size() + " local properties from "
            + localPropertiesLocation);
      } else {
        LOG.info("No Local Properties Override, set system property "
            + localPropertiesName
            + " to a resource location to override kernel properties");
      }

      StringBuilder sb = new StringBuilder();
      sb.append("Merged Property Set includes keys: ");
      for (Entry<?, ?> e : properties.entrySet()) {
        sb.append("\"").append(e.getKey()).append("\"").append("; ");
      }
      LOG.info("Loaded " + properties.size() + " properties into merged property set");
      LOG.debug(sb.toString());

    } catch (IOException e) {
      LOG.info("Failed to startup ", e);
      throw new CreationException(Arrays.asList(new Message(
          "Unable to load properties: " + localPropertiesLocation)));
    } finally {
      try {
        if (is != null) {
          is.close();
        }
      } catch (IOException e) {
        // dont care about this.
      }
    }
    return properties;
  }

  /**
   * @param classLoader
   * @param defaultProperties
   * @return
   */
  public static Properties load(ClassLoader classLoader, String defaultPropertiesLocation) {
    InputStream is = null;
    Properties properties;
    try {
      is = ResourceLoader.openResource(defaultPropertiesLocation, classLoader);
      properties = new Properties();
      properties.load(is);
      LOG.info("Loaded " + properties.size() + " properties from "
          + defaultPropertiesLocation);
    } catch (IOException e) {
      throw new CreationException(Arrays.asList(new Message(
          "Unable to load properties: " + defaultPropertiesLocation)));
    } finally {
      try {
        if (is != null) {
          is.close();
        }
      } catch (IOException e) {
        // dont care about this.
      }
    }
    return properties;
  }
}
