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
package org.sakaiproject.kernel.authz.simple;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.authz.AccessControlStatement;
import org.sakaiproject.kernel.api.authz.SubjectStatement;

import javax.jcr.RepositoryException;
import javax.jcr.ValueFormatException;

/**
 *
 */
public class JcrAccessControlStatementImpl implements AccessControlStatement {

  private static final String KEY_PREFIX = "k:";
  private static final String SUBJECT_PREFIX = "s:";
  private static final String GRANTED_PREFIX = "g:";
  private static final String PROPAGATING_PREFIX = "p:";
  private static final String GRANTED = "g:1";
  private static final String PROPAGATING = "p:1";
  protected SubjectStatement subject;
  protected boolean granted;
  protected boolean propagating;
  protected String key;

  /**
   * @param p
   * @throws RepositoryException
   * @throws ValueFormatException
   */
  // TODO: test coverage required
  public JcrAccessControlStatementImpl(String spec)  {
    String[] values = StringUtils.split(spec, ',');
    subject = JcrSubjectStatement.UNKNOWN;
    granted = false;
    propagating = false;
    if (values != null) {
      for (String val : values) {
        if (val.startsWith(SUBJECT_PREFIX)) {
          subject = new JcrSubjectStatement(val.substring(2));
        } else if (val.startsWith(KEY_PREFIX)) {
          key = val.substring(2);
        } else if (val.startsWith(GRANTED_PREFIX)) {
          granted = GRANTED.equals(val);
        } else if (val.startsWith(PROPAGATING_PREFIX)) {
          propagating = PROPAGATING.equals(val);
        }
      }
    }
  }

  public JcrAccessControlStatementImpl(SubjectStatement subject, String key,
      boolean granted, boolean propagating) {
    this.subject = subject;
    this.key = key;
    this.granted = granted;
    this.propagating = propagating;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.AccessControlStatement#getStatementKey()
   */
  public String getStatementKey() {
    return key;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.AccessControlStatement#getSubject()
   */
  public SubjectStatement getSubject() {
    return subject;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.AccessControlStatement#isGranted()
   */
  public boolean isGranted() {
    return granted;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.AccessControlStatement#isPropagating()
   */
  public boolean isPropagating() {
    return propagating;
  }

  /**
   * {@inheritDoc}
   *
   * @see java.lang.Object#hashCode()
   */
  @Override
  public int hashCode() {
    return subject.hashCode() + key.hashCode() + (granted ? 10000 : 20000)
        + (propagating ? 1000 : 2000);
  }

  /**
   * {@inheritDoc}
   *
   * @see java.lang.Object#equals(java.lang.Object)
   */
  @Override
  public boolean equals(Object obj) {
    if (obj instanceof JcrAccessControlStatementImpl) {
      JcrAccessControlStatementImpl jacs = (JcrAccessControlStatementImpl) obj;
      if (hashCode() == jacs.hashCode()) {
        return (subject.equals(jacs.subject) && key.equals(jacs.key)
            && granted == jacs.granted && propagating == jacs.propagating);
      }
    }
    return false;
  }

  /**
   * {@inheritDoc}
   * @see java.lang.Object#toString()
   */
  @Override
  public String toString() {
    return KEY_PREFIX+key+","+
    SUBJECT_PREFIX+subject+","+
    GRANTED_PREFIX+(granted?1:0)+","+
    PROPAGATING_PREFIX+(propagating?1:0);
  }

}
