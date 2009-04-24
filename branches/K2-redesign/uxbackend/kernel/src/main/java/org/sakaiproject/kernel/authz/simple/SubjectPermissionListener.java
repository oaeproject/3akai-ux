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
import org.sakaiproject.kernel.api.authz.SubjectPermissionService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.SiteService;
import org.sakaiproject.kernel.jcr.api.JcrContentListener;
import org.sakaiproject.kernel.model.GroupBean;
import org.sakaiproject.kernel.model.RoleBean;
import org.sakaiproject.kernel.model.SiteBean;
import org.sakaiproject.kernel.model.SiteIndexBean;
import org.sakaiproject.kernel.model.SubjectPermissionBean;
import org.sakaiproject.kernel.util.IOUtils;

import java.io.IOException;
import java.io.InputStream;
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
public class SubjectPermissionListener implements JcrContentListener {

  private static final Log LOG = LogFactory
      .getLog(SubjectPermissionListener.class);
  private static final boolean debug = LOG.isDebugEnabled();
  private final BeanConverter beanConverter;
  private final JCRNodeFactoryService jcrNodeFactoryService;
  private final EntityManager entityManager;
  private final SubjectPermissionService subjectPermissionService;
  private final SiteService siteService;

  /**
   * @param entityManager
   *
   */
  @Inject
  public SubjectPermissionListener(
      JCRNodeFactoryService jcrNodeFactoryService,
      @Named(KernelConstants.JCR_USERENV_BASE) String userEnvironmentBase,
      BeanConverter beanConverter,
      SessionManagerService sessionManagerService,
      SubjectPermissionService subjectPermissionService,
      EntityManager entityManager,
      SiteService siteService ) {
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.beanConverter = beanConverter;
    this.subjectPermissionService = subjectPermissionService;
    this.entityManager = entityManager;
    this.siteService = siteService;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.jcr.api.JcrContentListener#onEvent(int,
   *      java.lang.String, java.lang.String, java.lang.String)
   */
  public void onEvent(int type, String userID, String filePath, String fileName) {
    if (fileName.equals(KernelConstants.GROUP_FILE_NAME)) {
      InputStream in = null;
      try {
        in = jcrNodeFactoryService.getInputStream(filePath);
        String groupBody = IOUtils.readFully(in, "UTF-8");
        if (groupBody != null && groupBody.length() > 0) {
          EntityTransaction transaction = entityManager.getTransaction();

          if ( !transaction.isActive()) {
            transaction.begin();
          }
          // update the index for subjects and groups
          updateSubjectPermissionIndex(groupBody);

          // update the index used for searching sites
          updateSiteIndex(groupBody, filePath);

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
      } finally {
        try {
          in.close();
        } catch (Exception ex) {// not interested in this
        }

      }
    }

  }

  private void updateSubjectPermissionIndex(String groupBody) {
    GroupBean groupBean = beanConverter.convertToObject(groupBody,
        GroupBean.class);

    // expire all permission sets associated with this
    for (String subjectToken : groupBean.getSubjectTokens()) {
      subjectPermissionService.expire(subjectToken);
    }

    // the user environment bean contains a list of subjects, which the
    // users membership of groups
    Query query = entityManager
        .createNamedQuery(SubjectPermissionBean.FINDBY_GROUP);
    query.setParameter(SubjectPermissionBean.PARAM_GROUP, groupBean.getName());
    List<?> subjectPermissionList = query.getResultList();
    List<SubjectPermissionBean> toAdd = new ArrayList<SubjectPermissionBean>();
    List<SubjectPermissionBean> toRemove = new ArrayList<SubjectPermissionBean>();

    for (Object o : subjectPermissionList) {
      SubjectPermissionBean subjectPermissionBean = (SubjectPermissionBean) o;
      String subjectToken = subjectPermissionBean.getSubjectToken();
      String permission = subjectPermissionBean.getPermissionToken();
      boolean found = false;
      for (RoleBean role : groupBean.getRoles()) {
        String subject = role.getSubjectToken(groupBean.getName());
        if (subjectToken.equals(subject)) {
          for (String rolePermission : role.getPermissions()) {
            if (permission.equals(rolePermission)) {
              found = true;
              break;
            }
          }
          if (found) {
            break;
          }
        }
      }
      if (!found) {
        toRemove.add(subjectPermissionBean);
      }
    }

    for (RoleBean roleBean : groupBean.getRoles()) {
      String subject = roleBean.getSubjectToken(groupBean.getName());
      for (String permission : roleBean.getPermissions()) {
        boolean found = false;
        for (Object o : subjectPermissionList) {
          SubjectPermissionBean subjectPermissionBean = (SubjectPermissionBean) o;
          if (subject.equals(subjectPermissionBean.getSubjectToken())
              && permission.equals(subjectPermissionBean.getPermissionToken())) {
            found = true;
            break;
          }
        }
        if (!found) {
          toAdd.add(new SubjectPermissionBean(groupBean.getName(), roleBean
              .getName(), subject, permission));
        }

      }
    }
    for (SubjectPermissionBean spb : toRemove) {
      entityManager.remove(spb);
    }
    for (SubjectPermissionBean spb : toAdd) {

      entityManager.persist(spb);
    }
  }

  private void updateSiteIndex(String groupBody, String filePath) {
    
    SiteBean site = beanConverter.convertToObject(groupBody, SiteBean.class);
    String sitePath = siteService.locateSite(filePath);
    if (site.getId() != null) {
      // look for an existing index first.
      Query query = entityManager
          .createNamedQuery(SiteIndexBean.Queries.FINDBY_ID);
      query.setParameter(SiteIndexBean.QueryParams.FINDBY_ID_ID, site.getId());
      List<?> sitesList = query.getResultList();

      SiteIndexBean index = null;
      if (sitesList.size() > 0) {
        index = (SiteIndexBean) sitesList.get(0);
        index.setName(site.getName());
        index.setRef(sitePath);
      } else {
        index = new SiteIndexBean();
        index.setId(site.getId());
        index.setName(site.getName());
        index.setRef(sitePath);
      }
      entityManager.persist(index);

    }
  }
}
