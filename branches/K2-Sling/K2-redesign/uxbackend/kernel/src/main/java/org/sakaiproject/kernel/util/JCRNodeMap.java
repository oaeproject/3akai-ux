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

import com.google.common.collect.ImmutableSet;

import org.sakaiproject.kernel.api.jcr.JCRConstants;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.Property;
import javax.jcr.PropertyIterator;
import javax.jcr.PropertyType;
import javax.jcr.RepositoryException;
import javax.jcr.Value;
import javax.jcr.nodetype.NodeType;

/**
 * @author ieb
 */
public class JCRNodeMap extends HashMap<String, Object> {
  /**
	 *
	 */
  private static final long serialVersionUID = -7045000748456348620L;
  private static final Set<String> IGNORE = ImmutableSet.of(
      "sakai:sha1-password-hash", "acl:acl");

  /**
   * @throws RepositoryException
   */
  public JCRNodeMap(Node n, int depth)
      throws RepositoryException {
    depth--;
    put("primaryNodeType", n.getPrimaryNodeType().getName());
    put("mixinNodeType", getMixinTypes(n));
    put("properties", getProperties(n));
    put("name", n.getName());

    NodeType nt = n.getPrimaryNodeType();

    if (JCRConstants.NT_FILE.equals(nt.getName())) {
      addFile(n);
    } else {
      if (depth >= 0) {

        Map<String, Object> nodes = new HashMap<String, Object>();
        NodeIterator ni = n.getNodes();
        int i = 0;
        while (ni.hasNext()) {
          Node cn = ni.nextNode();
          Map<String, Object> m = new JCRNodeMap(cn, depth);
          m.put("position", String.valueOf(i));
          nodes.put(cn.getName(), m);
          i++;
        }
        put("nitems", nodes.size());
        put("items", nodes);
      }
    }
  }

  /**
   * @param n
   * @throws RepositoryException
   */
  private void addFile(Node n) throws RepositoryException {
    Node resource = n.getNode(JCRConstants.JCR_CONTENT);
    Property lastModified = resource.getProperty(JCRConstants.JCR_LASTMODIFIED);
    Property content = resource.getProperty(JCRConstants.JCR_DATA);
    put("lastModified", lastModified.getDate().getTime());
    put("mimeType", resource.getProperty(JCRConstants.JCR_MIMETYPE).getString());
    if (resource.hasProperty(JCRConstants.JCR_ENCODING)) {
      put("encoding", resource.getProperty(JCRConstants.JCR_ENCODING)
          .getString());
    }
    put("length", String.valueOf(content.getLength()));

  }

  /**
   * @param n
   * @return
   * @throws RepositoryException
   */
  private Map<String, Object> getProperties(Node n) throws RepositoryException {
    Map<String, Object> m = new HashMap<String, Object>();
    for (PropertyIterator pi = n.getProperties(); pi.hasNext();) {
      Property p = pi.nextProperty();
      String name = p.getName();
      if (!IGNORE.contains(name)) {
        boolean multiValue = p.getDefinition().isMultiple();
        if (multiValue) {
          Value[] v = p.getValues();
          Object[] o = new String[v.length];
          for (int i = 0; i < o.length; i++) {
            o[i] = formatType(v[i]);
          }
          m.put(name, o);
        } else {
          Value v = p.getValue();
          m.put(name, formatType(v));

        }
      }
    }
    if ( n.hasNode(JCRConstants.JCR_CONTENT) ) {
      Node content = n.getNode(JCRConstants.JCR_CONTENT);
      for (PropertyIterator pi = content.getProperties(); pi.hasNext();) {
        Property p = pi.nextProperty();
        String name = p.getName();
        if (!IGNORE.contains(name)) {
          boolean multiValue = p.getDefinition().isMultiple();
          if (multiValue) {
            Value[] v = p.getValues();
            Object[] o = new String[v.length];
            for (int i = 0; i < o.length; i++) {
              o[i] = formatType(v[i]);
            }
            m.put(name, o);
          } else {
            Value v = p.getValue();
            m.put(name, formatType(v));

          }
        }
      }

    }
    return m;
  }

  /**
   * @param value
   * @return
   * @throws RepositoryException
   */
  private Object formatType(Value value) throws RepositoryException {
    switch (value.getType()) {
    case PropertyType.BOOLEAN:
      return String.valueOf(value.getBoolean());
    case PropertyType.BINARY:
      return "--binary--";
    case PropertyType.DATE:
      return value.getDate().getTime();
    case PropertyType.DOUBLE:
      return String.valueOf(value.getDouble());
    case PropertyType.LONG:
      return String.valueOf(value.getLong());
    case PropertyType.NAME:
    case PropertyType.PATH:
    case PropertyType.REFERENCE:
    case PropertyType.STRING:
      return value.getString();
    default:
      return "--undefined--";
    }
  }

  /**
   * @param n
   * @return
   * @throws RepositoryException
   */
  private String[] getMixinTypes(Node n) throws RepositoryException {
    List<String> mixins = new ArrayList<String>();
    for (NodeType nt : n.getMixinNodeTypes()) {
      mixins.add(nt.getName());
    }
    return mixins.toArray(new String[0]);
  }

}
