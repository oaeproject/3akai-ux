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

import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.api.ResourceDefinition;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.model.JCRNodeMap;

import java.io.IOException;

import javax.jcr.Node;
import javax.jcr.PathNotFoundException;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.UnsupportedRepositoryOperationException;
import javax.jcr.Value;
import javax.jcr.ValueFactory;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <p>
 * Set properties on the jcrnode.
 * </p>
 * <p>
 * Properties are specified in 4 request arrays associated in order. name,
 * value, action. These arrays must all be specified and the same length.
 * </p>
 * <p>
 * <b>item (optional)</b>: A list of item names, if this parameter is present on
 * a ContentCollection, the item specifies the target item as a child of the
 * ContentCollection. A blank string identifies the ContentCollection itself.
 * </p>
 * <p>
 * <b>name</b>: A list of request parameters of name <b>name</b> that specify
 * the name of each property in the value and action parameters.
 * </p>
 * <p>
 * <b>value</b>: A list of request parameters of name <b>value</b> that specify
 * the value of each property named in the name parameter.
 * </p>
 * <p>
 * <b>action</b>: A list of request parameters of name <b>acrtion</b> that
 * specifies what should be done with each name value pair. Action can be
 * <b>a</a> for add, <b>d</b> for remove or <b>r</b> for replace.
 * </p>
 * <ul>
 * <li><b>add</b>: To add a property or to create a new property.</li>
 * <li><b>remove</b>: To remove the property.</li>
 * <li><b>replace</b>: To replace the property with the value specified, this
 * will be a single value property to start with, but if later (including in the
 * same request) it is converted into a list.</li>
 * </ul>
 *
 */
public class JCRPropertiesFunction extends JCRSDataFunction {
  private static final String KEY = "pr";

  public static enum Action {
    /**
     * Add
     */
    a(),
    /**
     * delete
     */
    d(),
    /**
     * replace
     */
    r();
  }

  public static final String NAME = "name";

  public static final String VALUE = "value";

  public static final String ACTION = "action";

  private static final String ITEM = "item";

  private static final RestDescription DESCRIPTION = new RestDescription();
  static {
    DESCRIPTION.setTitle("Properties Function");
    DESCRIPTION.setBackUrl("?doc=1");
    DESCRIPTION
        .setShortDescription("Manages properties on a node identified by the URL , mapped to function  "
            + KEY);
    DESCRIPTION
        .addSection(
            2,
            "Introduction",
            "On POST Modifies the properties on a node. The post contains a set of arrays with identical lengths,"
                + " each array represenging a column and a row of all the arrays representing an operation.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_OK),
        "If sucessfull the response contains structured node metadata.");

    DESCRIPTION.addParameter(NAME, "An array of propery names");
    DESCRIPTION
        .addParameter(VALUE,
            "An array of property values in a suitable format for the property content");
    DESCRIPTION
        .addParameter(
            ACTION,
            "An array of property actions, 'a' for add, 'd' for delete, 'r' for replace."
                + " add will append a property to the end of the property list, if the property is multivbalue, "
                + "otherwise if will create or replace a single value property. delete will delete the property or remove the "
                + "last value of a multivalued property. replace will replace a value or replace a multivalued property with "
                + "the value supplied, reseting the number of elements to 1");
    DESCRIPTION
        .addParameter(ITEM,
            "An array of relative paths to child nodes to which this entry refers.");
    DESCRIPTION.addResponse(String.valueOf(HttpServletResponse.SC_BAD_REQUEST),
        "If the arrays done match in length, or the actions are not correct");
  }

  /*
   * (non-Javadoc)
   *
   * @see
   * org.sakaiproject.sdata.tool.api.SDataFunction#call(org.sakaiproject.sdata
   * .tool.api.Handler, javax.servlet.http.HttpServletRequest,
   * javax.servlet.http.HttpServletResponse, java.lang.Object,
   * org.sakaiproject.sdata.tool.api.ResourceDefinition)
   */
  public void call(Handler handler, HttpServletRequest request,
      HttpServletResponse response, Node target, ResourceDefinition rp)
      throws SDataException {
    SDataFunctionUtil.checkMethod(request.getMethod(), "POST");
    try {

      String[] items = request.getParameterValues(ITEM);
      String[] names = request.getParameterValues(NAME);
      String[] values = request.getParameterValues(VALUE);
      String[] actions = request.getParameterValues(ACTION);

      if (names == null || values == null || actions == null
          || names.length != values.length || names.length != actions.length) {
        throw new SDataException(HttpServletResponse.SC_BAD_REQUEST,
            "Request must contain the same number of name, value, and action parameters ");
      }

      for (int i = 0; i < names.length; i++) {
        try {
          Action.valueOf(actions[i]);
        } catch (IllegalArgumentException e) {
          throw new SDataException(HttpServletResponse.SC_BAD_REQUEST,
              " Action of type " + actions[i] + " is invalid at location " + i);

        }
      }
      ValueFactory valueFactory = target.getSession().getValueFactory();
      for (int i = 0; i < names.length; i++) {
        Node node = target;
        if (items.length == names.length
            && JCRConstants.NT_FOLDER.equals(target.getPrimaryNodeType()
                .toString())) {
          node = node.getNode(items[i]);
        }
        switch (Action.valueOf(actions[i])) {
        case a: // add
          try {
            Property p = node.getProperty(names[i]);
            if (p.getDefinition().isMultiple()) {
              Value[] v = p.getValues();
              Value[] vnew = new Value[v.length + 1];
              System.arraycopy(v, 0, vnew, 0, v.length);
              vnew[v.length] = valueFactory.createValue(values[i]);
              p.setValue(vnew);
            } else {
              p.setValue(values[i]);
            }
          } catch (PathNotFoundException e) {
            node.setProperty(names[i], values[i]);
          }
          break;
        case d: // remove
          try {
            Property p = node.getProperty(names[i]);
            if (p.getDefinition().isMultiple()) {
              Value[] v = p.getValues();
              if (v.length > 1) {
                Value[] vnew = new Value[v.length - 1];
                System.arraycopy(v, 0, vnew, 0, v.length);
                p.setValue(vnew);
              } else {
                p.remove();
              }
            } else {
              p.remove();
            }
          } catch (PathNotFoundException e) {
            // not there so no action required.
          }
          break;
        case r: // replace
          try {
            Property p = node.getProperty(names[i]);
            if (p.getDefinition().isMultiple()) {
              Value[] vnew = new Value[1];
              vnew[0] = valueFactory.createValue(values[i]);
              p.setValue(vnew);
            } else {
              p.setValue(values[i]);
            }
          } catch (PathNotFoundException e) {
            node.setProperty(names[i], values[i]);
          }
          break;

        }
      }

      JCRNodeMap nm = new JCRNodeMap(target, rp.getDepth(), rp);
      handler.sendMap(request, response, nm);
    } catch (IOException e) {
      throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
          "IO Error " + e.getMessage());
    } catch (UnsupportedRepositoryOperationException e) {
      throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e
          .getMessage());
    } catch (RepositoryException e) {
      throw new SDataException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e
          .getMessage());
    }

  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.sdata.tool.api.SDataFunction#getKey()
   */
  public String getKey() {
    return KEY;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.sdata.tool.api.SDataFunction#getDescription()
   */
  public RestDescription getDescription() {
    return DESCRIPTION;
  }

}
