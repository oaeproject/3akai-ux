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

import com.google.inject.Inject;
import com.google.inject.name.Named;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.jcr.api.JcrContentListener;
import org.sakaiproject.kernel.model.GroupMembershipBean;
import org.sakaiproject.kernel.model.UserBean;
import org.sakaiproject.kernel.model.UserEnvironmentBean;
import org.sakaiproject.kernel.util.IOUtils;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import javax.jcr.RepositoryException;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Query;

/**
 *
 */
public class UserEnvironmentListener implements JcrContentListener {

  private static final Log LOG = LogFactory
      .getLog(UserEnvironmentListener.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private final String userEnvironmentBase;
  private final BeanConverter beanConverter;
  private final JCRNodeFactoryService jcrNodeFactoryService;
  private final EntityManager entityManager;
  private final UserEnvironmentResolverService userEnvironmentResolverService;

  /**
   * Constructor with all required dependencies.
   *
   * @param jcrNodeFactoryService
   * @param userEnvironmentBase
   * @param beanConverter
   * @param sessionManagerService
   * @param userEnvironmentResolverService
   * @param entityManager
   */
  @Inject
  public UserEnvironmentListener(
      JCRNodeFactoryService jcrNodeFactoryService,
      @Named(KernelConstants.JCR_USERENV_BASE) String userEnvironmentBase,
      BeanConverter beanConverter,
      SessionManagerService sessionManagerService,
      UserEnvironmentResolverService userEnvironmentResolverService,
      EntityManager entityManager) {
    this.userEnvironmentBase = userEnvironmentBase;
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.beanConverter = beanConverter;
    this.userEnvironmentResolverService = userEnvironmentResolverService;
    this.entityManager = entityManager;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.jcr.api.JcrContentListener#onEvent(int,
   *      java.lang.String, java.lang.String, java.lang.String)
   */
  public void onEvent(int type, String userID, String filePath, String fileName) {
    if (filePath.startsWith(userEnvironmentBase)) {
      if (fileName.equals(KernelConstants.USERENV)) {
        String userEnvBody = null;
        try {
          userEnvBody = IOUtils.readFully(jcrNodeFactoryService
              .getInputStream(filePath), "UTF-8");
          if (userEnvBody != null && userEnvBody.length() > 0) {
            UserEnvironmentBean ue = beanConverter.convertToObject(userEnvBody,
                UserEnvironmentBean.class);
            ue.seal();

            userEnvironmentResolverService.expire(ue.getUser().getUuid());

            // the user environment bean contains a list of
            // subjects, which the
            // users membership of groups
            Query query = entityManager
                .createNamedQuery(GroupMembershipBean.FINDBY_USER);
            query.setParameter(GroupMembershipBean.USER_PARAM, ue.getUser()
                .getUuid());
            List<?> membershipList = query.getResultList();
            List<GroupMembershipBean> toAdd = new ArrayList<GroupMembershipBean>();
            List<GroupMembershipBean> toRemove = new ArrayList<GroupMembershipBean>();

            for (Object o : membershipList) {
              GroupMembershipBean groupMembershipBean = (GroupMembershipBean) o;
              String subjectToken = groupMembershipBean.getSubjectToken();
              boolean found = false;
              for (String subject : ue.getSubjects()) {
                if (subjectToken.equals(subject)) {
                  found = true;
                  break;
                }
              }
              if (!found) {
                toRemove.add(groupMembershipBean);
              }
            }

            for (String subject : ue.getSubjects()) {
              boolean found = false;
              for (Object o : membershipList) {
                GroupMembershipBean groupMembershipBean = (GroupMembershipBean) o;
                String subjectToken = groupMembershipBean.getSubjectToken();
                if (subject.equals(subjectToken)) {
                  found = true;
                  break;
                }
              }
              if (!found) {
                toAdd.add(new GroupMembershipBean(ue.getUser().getUuid(),
                    subject));
              }
            }

            UserBean u = ue.getUserBean();

            Query userQuery = entityManager
                .createNamedQuery(UserBean.FINDBY_UID);
            userQuery.setParameter(UserBean.UID_PARAM, u.getUuid());
            List<?> userBeansByUID = userQuery.getResultList();

            Query userQuery2 = entityManager
                .createNamedQuery(UserBean.FINDBY_EID);
            userQuery2.setParameter(UserBean.EID_PARAM, u.getEid());
            List<?> userBeansByEID = userQuery.getResultList();
            boolean foundUserBean = false;
            List<UserBean> toRemoveUserBeans = new ArrayList<UserBean>();
            for (Object o : userBeansByUID) {
              UserBean ub = (UserBean) o;
              if (!u.getUuid().equals(ub.getUuid())
                  || !u.getEid().equals(ub.getEid())) {
                if (!toRemoveUserBeans.contains(ub)) {
                  toRemoveUserBeans.add(ub);
                }
              } else {
                foundUserBean = true;
              }
            }
            for (Object o : userBeansByEID) {
              UserBean ub = (UserBean) o;
              if (!u.getUuid().equals(ub.getUuid())
                  || !u.getEid().equals(ub.getEid())) {
                if (!toRemoveUserBeans.contains(ub)) {
                  toRemoveUserBeans.add(ub);
                }
              } else {
                foundUserBean = true;
              }
            }

            EntityTransaction transaction = entityManager.getTransaction();
            transaction.begin();
            if (!foundUserBean) {
              UserBean ub = new UserBean(u.getUuid(), u.getEid());
              entityManager.persist(ub);
            }
            for (UserBean ub : toRemoveUserBeans) {
              entityManager.remove(ub);
            }
            for (GroupMembershipBean gm : toRemove) {
              entityManager.remove(gm);
            }
            for (GroupMembershipBean gm : toAdd) {
              entityManager.persist(gm);
            }
            transaction.commit();
          }

        } catch (UnsupportedEncodingException e) {
          LOG.error(e);
        } catch (IOException e) {
          LOG.warn("Failed to read userenv " + filePath + " cause :"
              + e.getMessage());
          if (debug)
            LOG.debug(e);
        } catch (RepositoryException e) {
          LOG.warn("Failed to read userenv for " + filePath + " cause :"
              + e.getMessage());
          if (debug)
            LOG.debug(e);
        } catch (JCRNodeFactoryServiceException e) {
          LOG.warn("Failed to read userenv for " + filePath + " cause :"
              + e.getMessage());
          if (debug)
            LOG.debug(e);
        }
      }
    }
  }
}
