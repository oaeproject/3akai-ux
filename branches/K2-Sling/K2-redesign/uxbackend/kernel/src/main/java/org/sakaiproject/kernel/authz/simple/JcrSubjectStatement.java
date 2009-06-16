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
import org.sakaiproject.kernel.api.UpdateFailedException;
import org.sakaiproject.kernel.api.authz.SubjectStatement;

/**
 *
 */
public class JcrSubjectStatement implements SubjectStatement {

  public static final SubjectStatement UNKNOWN = new JcrSubjectStatement();
  private SubjectType subjectType;
  private String subjectToken;
  private String permissionToken;

  /**
   * @param substring
   */
  public JcrSubjectStatement(String subjectStatement) {
    subjectToken = "";
    permissionToken = "";
    String[] parts = StringUtils.split(subjectStatement, ':');
    if (parts == null || parts.length == 0) {
      throw new UpdateFailedException("The subject Statement ["
          + subjectStatement + "] is not a valid subject statement");
    }
    try {
      subjectType = SubjectType.valueOf(parts[0]);
    } catch (IllegalArgumentException e) {
      subjectType = SubjectType.UN;
    }
    switch (subjectType) {
    case AN:
      if (parts.length != 1) {
        throw new UpdateFailedException("The subject Statement "
            + subjectStatement
            + " is not a valid anon user statement, extra data, expected AN");
      }
      break;
    case AU:
      if (parts.length != 1) {
        throw new UpdateFailedException(
            "The subject Statement "
                + subjectStatement
                + " is not a valid authenticated user statement, extra data, expected AU");
      }
      break;
    case OW:
      if (parts.length != 1) {
        throw new UpdateFailedException("The subject Statement "
            + subjectStatement
            + " is not a valid owner statement, extra data, expected OW");
      }
      break;
    case GR:
      if (parts.length != 3) {
        throw new UpdateFailedException("The subject Statement "
            + subjectStatement
            + " is not a valid owner statement, extra data, expected OW");
      }
      subjectToken = parts[1];
      permissionToken = parts[2];
      break;
    case PR:
      if (parts.length < 3) {
        throw new UpdateFailedException(
            "The subject Statement "
                + subjectStatement
                + " is not a valid provided statement, extra data, expected PR:key:data");
      }
      subjectToken = parts[1];
      permissionToken = subjectStatement;
      break;
    case SU:
      if (parts.length != 1) {
        throw new UpdateFailedException("The subject Statement "
            + subjectStatement
            + " is not a valid super user statement, extra data, expected SU");
      }
      break;
    case UN:
      throw new UpdateFailedException("The subject Statement "
          + subjectStatement
          + " is not a valid subject statement, unrecognised type");
    case US:
      if (parts.length != 2) {
        throw new UpdateFailedException("The subject Statement "
            + subjectStatement
            + " is not a valid user statement, expected UN:userid");
      }
      subjectToken = parts[1];
      break;
    }
  }

  public JcrSubjectStatement(SubjectType subjectType, String subjectToken,
      String permissionToken) {
    this.subjectType = subjectType;
    this.subjectToken = subjectToken;
    this.permissionToken = permissionToken;
  }

  /**
   *
   */
  private JcrSubjectStatement() {
    subjectType = SubjectType.UN;
    subjectToken = "none";
    permissionToken = "none";
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.SubjectStatement#getPermissionToken()
   */
  public String getPermissionToken() {
    return permissionToken;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.SubjectStatement#getSubjectToken()
   */
  public String getSubjectToken() {
    return subjectToken;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.authz.SubjectStatement#getSubjectType()
   */
  public SubjectType getSubjectType() {
    return subjectType;
  }

  /**
   * {@inheritDoc}
   *
   * @see java.lang.Object#hashCode()
   */
  @Override
  public int hashCode() {
    return subjectType.hashCode() + subjectToken.hashCode()
        + permissionToken.hashCode();
  }

  /**
   * {@inheritDoc}
   *
   * @see java.lang.Object#equals(java.lang.Object)
   */
  @Override
  public boolean equals(Object obj) {
    if (obj instanceof JcrSubjectStatement) {
      JcrSubjectStatement jcrss = (JcrSubjectStatement) obj;
      return subjectType.equals(jcrss.subjectType)
          && subjectToken.equals(jcrss.subjectToken)
          && permissionToken.equals(jcrss.permissionToken);
    }
    return false;
  }

  /**
   * {@inheritDoc}
   *
   * @see java.lang.Object#toString()
   */
  @Override
  public String toString() {
    switch (subjectType) {
    case GR:
      return SubjectType.GR.toString() + ":" + subjectToken + ":"
          + permissionToken;
    case PR:
      return permissionToken;
    case US:
      return SubjectType.US.toString() + ":" + subjectToken;
    default:
      return subjectType.toString();

    }
  }

}
