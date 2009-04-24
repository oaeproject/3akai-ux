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

import org.apache.jackrabbit.value.StringValue;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.locking.LockTimeoutException;

import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.Value;

/**
 *
 */
public class JcrUtils {
  /**
   * Add appropriate properties to a node to provide "smart" functionality.
   *
   * @param node
   * @param language
   * @param statement
   */
  public static void makeSmartNode(Node node, String language, String statement)
      throws RepositoryException {
    node.setProperty(JCRConstants.JCR_SMARTNODE, language + ":" + statement);
  }

  /**
   * Adds a label to a node. No action is taken if the label already exists on
   * the node. Label is treated case-sensitively.
   *
   * @param node
   * @param label
   * @throws RepositoryException
   * @throws LockTimeoutException
   * @throws IllegalArgumentException
   *           If label or node is null.
   */
  public static void addNodeLabel(JCRService jcrService, Node node, String label)
      throws RepositoryException, LockTimeoutException {
    modifyNodeLabel(jcrService, node, label, false);
  }

  /**
   * Removes a label from a node. No exception thrown if label not found on
   * node. Label is treated case-sensitively.
   *
   * @param node
   *          The node to act on.
   * @param label
   *          The label to remove.
   * @throws RepositoryException
   * @throws LockTimeoutException
   */
  public static void removeNodeLabel(JCRService jcrService, Node node, String label)
      throws RepositoryException, LockTimeoutException {
    modifyNodeLabel(jcrService, node, label, true);
  }

  /**
   * Adds/removes a label on a node. Label is treated case-sensitively. No
   * action is taken nor exception thrown if:<br/>
   * <ul>
   * <li>add and label exists</li>
   * <li>remove and label doesn't exist</li>
   * </ul>
   *
   * @param node
   * @param label
   * @param remove
   * @throws RepositoryException
   * @throws LockTimeoutException
   * @throws IllegalArgumentException
   *           If label or node is null.
   */
  protected static void modifyNodeLabel(JCRService jcrService, Node node, String label, boolean remove)
      throws RepositoryException, LockTimeoutException {
    // validate arguments
    if (node == null) {
      throw new IllegalArgumentException("Node must not be null.");
    }
    if (label == null) {
      throw new IllegalArgumentException("Node label must not be null.");
    }

    jcrService.lock(node);
    // get properties from node
    Value[] values = null;
    if (node.hasProperty(JCRConstants.JCR_LABELS)) {
      Property prop = node.getProperty(JCRConstants.JCR_LABELS);
      values = prop.getValues();
    } else {
      values = new Value[0];
    }

    // see if the label already exists
    boolean contains = false;
    for (Value v : values) {
      if (label.equals(v.getString())) {
        contains = true;
        break;
      }
    }

    Value[] newVals = null;
    // if found, remove label
    if (remove && contains) {
      // creating array that is 1 larger than before
      newVals = new Value[values.length - 1];
      // copy old labels to new array, skipping label to be removed
      int newI = 0;
      for (Value value : values) {
        if (!label.equals(value.getString())) {
          newVals[newI++] = value;
        }
      }
    }
    // if not found, add new label
    else if (!remove && !contains) {
      // creating array that is 1 larger than before
      newVals = new Value[values.length + 1];
      // copy old labels to new array
      for (int i = 0; i < values.length; i++) {
        newVals[i] = values[i];
      }
      // add new label
      newVals[newVals.length - 1] = new StringValue(label);
    }
    // set values back to the node property.
    node.setProperty(JCRConstants.JCR_LABELS, newVals);
  }
}
