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

package org.sakaiproject.sdata.tool.functions;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.sdata.tool.api.SDataFunction;

/**
 * The base SDataFunction for JCR
 * 
 * @author ieb
 */
public abstract class JCRSDataFunction implements SDataFunction {

  private static final Log LOG = LogFactory.getLog(JCRSDataFunction.class);
  private static final boolean debug = LOG.isDebugEnabled();

  /**
   * @param string
   * @param e
   */
  protected void logException(String string, Exception e) {
    if (debug) {
      LOG.warn("Type missmatch ", e);
    } else {
      LOG.warn("Type missmatch " + e.getMessage());
    }
  }
  
}
