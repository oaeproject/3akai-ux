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

package org.sakaiproject.kernel.site;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.name.Named;

import net.sf.json.JSONObject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.KernelConstants;
import org.sakaiproject.kernel.api.authz.AuthzResolverService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.RestProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.site.SiteException;
import org.sakaiproject.kernel.api.site.SiteService;
import org.sakaiproject.kernel.api.userenv.UserEnvironment;
import org.sakaiproject.kernel.api.userenv.UserEnvironmentResolverService;
import org.sakaiproject.kernel.model.GroupMembershipBean;
import org.sakaiproject.kernel.model.SiteBean;
import org.sakaiproject.kernel.model.SiteIndexBean;
import org.sakaiproject.kernel.model.UserEnvironmentBean;
import org.sakaiproject.kernel.util.IOUtils;
import org.sakaiproject.kernel.util.JpaUtils;
import org.sakaiproject.kernel.util.MapUtils;
import org.sakaiproject.kernel.util.PathUtils;
import org.sakaiproject.kernel.util.StringUtils;
import org.sakaiproject.kernel.util.rest.CollectionOptions;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.PropertyIterator;
import javax.jcr.RepositoryException;
import javax.jcr.ValueFormatException;
import javax.persistence.EntityManager;
import javax.persistence.Query;

/**
 *
 */
public class SiteServiceImpl implements SiteService {

  private static final Log LOG = LogFactory.getLog(SiteServiceImpl.class);
  private static final boolean debug = LOG.isDebugEnabled();

  private final JCRNodeFactoryService jcrNodeFactoryService;
  private final BeanConverter beanConverter;
  private final SessionManagerService sessionManagerService;

  private String defaultTemplate;

  private Map<String, String> siteTemplateMap;

  private long entropy = System.currentTimeMillis();

  private AuthzResolverService authzResolverService;

  private EntityManager entityManager;

  private UserEnvironmentResolverService userEnvironmentResolverService;

  private Injector injector;

  @Inject
  public SiteServiceImpl(JCRNodeFactoryService jcrNodeFactoryService,
      BeanConverter beanConverter, SessionManagerService sessionManagerService,
      AuthzResolverService authzResolverService,
      @Named(KernelConstants.JCR_SITE_TEMPLATES) String siteTemplates,
      @Named(KernelConstants.JCR_SITE_DEFAULT_TEMPLATE) String defaultTemplate,
      EntityManager entityManager,
      UserEnvironmentResolverService userEnvironmentResolverService, Injector injector) {
    this.jcrNodeFactoryService = jcrNodeFactoryService;
    this.beanConverter = beanConverter;
    this.sessionManagerService = sessionManagerService;
    this.siteTemplateMap = MapUtils.convertToImmutableMap(siteTemplates);
    this.defaultTemplate = defaultTemplate;
    this.authzResolverService = authzResolverService;
    this.entityManager = entityManager;
    this.userEnvironmentResolverService = userEnvironmentResolverService;
    this.injector = injector;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.site.SiteService#getSite(java.lang.String)
   */
  public SiteBean getSite(String path) {
    String sitePath = buildFilePath(path);
    InputStream in = null;
    try {
      in = jcrNodeFactoryService.getInputStream(sitePath);
      String siteBody = IOUtils.readFully(in, "UTF-8");
      SiteBean bean = beanConverter.convertToObject(siteBody, SiteBean.class);
      bean.location(path);
      bean.service(this);
      return bean;
    } catch (UnsupportedEncodingException e) {
      LOG.error("Failed to find site " + e.getMessage());
    } catch (IOException e) {
      LOG.error("Failed to find site " + e.getMessage());
    } catch (RepositoryException e) {
      LOG.error("Failed to find site " + e.getMessage());
    } catch (JCRNodeFactoryServiceException e) {
      if (debug)
        LOG.debug("Failed to find site " + e.getMessage());
    } finally {
      try {
        in.close();
      } catch (Exception ex) {
      }
    }
    return null;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.site.SiteService#getSiteById(java.lang.String)
   */
  public SiteBean getSiteById(String siteId) {
    Query findById = entityManager.createNamedQuery(SiteIndexBean.Queries.FINDBY_ID);
    LOG.info("Searching for Site ID [" + siteId + "]");
    findById.setParameter(SiteIndexBean.QueryParams.FINDBY_ID_ID, siteId);
    findById.setFirstResult(0);
    findById.setMaxResults(1);
    List<?> results = findById.getResultList();
    if (results.size() > 0) {
      SiteIndexBean index = (SiteIndexBean) results.get(0);
      String sitePath = index.getRef();
      LOG.info("Found Site " + siteId + " at " + sitePath);
      return getSite(sitePath);
    }
    return null;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.site.SiteService#siteExists(java.lang.String)
   */
  public boolean siteExists(String path) {
    String sitePath = buildFilePath(path);
    try {
      Node n = jcrNodeFactoryService.getNode(sitePath);
      return (n != null);
    } catch (JCRNodeFactoryServiceException e) {
      return false;
    } catch (RepositoryException e) {
      return false;
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.site.SiteService#deleteSite(java.lang.String)
   */
  public void deleteSite(String id) {

  }

  /**
   * {@inheritDoc}
   *
   * @throws UnsupportedEncodingException
   *
   * @see org.sakaiproject.kernel.api.site.SiteService#saveSite(org.sakaiproject.kernel.model.SiteBean)
   */
  public void save(SiteBean siteBean) throws SiteException {

    ByteArrayInputStream bais = null;
    try {

      String path = siteBean.getLocation();
      
      // Check if the site exists or not
      boolean isnew = false;
      try {
        Node n = jcrNodeFactoryService.getNode(path);
        isnew = (n == null);
      } catch (JCRNodeFactoryServiceException e) {
        isnew = true;
      }
      String siteBeanDef = beanConverter.convertToString(siteBean);
      LOG.info("Saving Site to " + path + " as " + siteBeanDef);
      bais = new ByteArrayInputStream(siteBeanDef.getBytes("UTF-8"));
      jcrNodeFactoryService.setInputStream(buildFilePath(path), bais,
          RestProvider.CONTENT_TYPE);

      // Make the private and shares spaces for the user owned by this used.
      jcrNodeFactoryService.setOwner(buildSiteFolder(path), siteBean.getOwners()[0]);
      if (isnew) {
        jcrNodeFactoryService.setOwner(path, siteBean.getOwners()[0]);
        
        executeTemplate(siteBean);
      }
    } catch (UnsupportedEncodingException e) {
      LOG.error(e);
    } catch (JCRNodeFactoryServiceException e) {
      throw new SiteException("Failed to save site ", e);
    } catch (RepositoryException e) {
      throw new SiteException("Failed to save site ", e);
    } finally {
      try {
        bais.close();
      } catch (Exception e) {
        LOG.warn("Failed to close internal stream " + e.getMessage());
      }
    }
  }

  
  
  private void executeTemplate(SiteBean siteBean) throws SiteException {
	 createNavigationFromTemplate(siteBean);
	 
	 createPageFromTemplate(siteBean);
	 
	 createWidgetsFolder(siteBean);
  }

  private void createWidgetsFolder(SiteBean siteBean) throws SiteException {
	String path = siteBean.getLocation();
	String widgetsFolder = buildWidgetsFolder(path);
	
	ByteArrayInputStream bais = null;
	try{
		bais = new ByteArrayInputStream("TEST".getBytes("UTF-8"));
	    jcrNodeFactoryService.setInputStream(buildWidgetsPath(path), bais, RestProvider.CONTENT_TYPE);	    
	}catch (UnsupportedEncodingException e) {
	  LOG.error(e);
	} catch (JCRNodeFactoryServiceException e) {
	  throw new SiteException("Failed to save site ", e);
	} catch (RepositoryException e) {
	  throw new SiteException("Failed to save site ", e);
	} finally {
	  try {
	    bais.close();
	  } catch (Exception e) {
	    LOG.warn("Failed to close internal stream " + e.getMessage());
	  }
	}		
  }

private void createPageFromTemplate(SiteBean siteBean) throws SiteException {
	String path = siteBean.getLocation();
	String pagesFolder = buildPagesFolder(path);
	
	String pages = siteBean.getTemplate().getString("pages");
	
	if(pages != null){
		JSONObject pagesObject = (JSONObject) siteBean.getTemplate().get("pages");
		String content = pagesObject.getString("content");
		String id = pagesObject.getString("id");
		String pageconfiguration = pagesObject.getString("pageconfiguration");
		
		ByteArrayInputStream bais = null;
		try{
			// Create content
			bais = new ByteArrayInputStream(content.getBytes("UTF-8"));
		    jcrNodeFactoryService.setInputStream(buildPagesPath(path, id), bais, RestProvider.CONTENT_TYPE);
		    
		    // Create configuration
		    bais = new ByteArrayInputStream(pageconfiguration.getBytes("UTF-8"));
		    jcrNodeFactoryService.setInputStream(buildPageconfigurationPath(path), bais, RestProvider.CONTENT_TYPE);
		}catch (UnsupportedEncodingException e) {
	      LOG.error(e);
	    } catch (JCRNodeFactoryServiceException e) {
	      throw new SiteException("Failed to save site ", e);
	    } catch (RepositoryException e) {
	      throw new SiteException("Failed to save site ", e);
	    } finally {
	      try {
	        bais.close();
	      } catch (Exception e) {
	        LOG.warn("Failed to close internal stream " + e.getMessage());
	      }
	    }
	}
}

private void createNavigationFromTemplate(SiteBean siteBean) throws SiteException {
	String path = siteBean.getLocation();
	String navigationFolder = buildNavigationFolder(path);
	
	String navigation = siteBean.getTemplate().getString("navigation");
	
	if(navigation != null){
		navigation.replace("__SITEID__", siteBean.getId());
		ByteArrayInputStream bais = null;
		try{
			bais = new ByteArrayInputStream(navigation.getBytes("UTF-8"));
		    jcrNodeFactoryService.setInputStream(buildNavigationPath(path), bais, RestProvider.CONTENT_TYPE);
		}catch (UnsupportedEncodingException e) {
	      LOG.error(e);
	    } catch (JCRNodeFactoryServiceException e) {
	      throw new SiteException("Failed to save site ", e);
	    } catch (RepositoryException e) {
	      throw new SiteException("Failed to save site ", e);
	    } finally {
	      try {
	        bais.close();
	      } catch (Exception e) {
	        LOG.warn("Failed to close internal stream " + e.getMessage());
	      }
	    }
	}
}

/**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.site.SiteService#createSite(java.lang.String,
   *      java.lang.String)
   */
  public SiteBean createSite(String path, String siteType) throws SiteException {
    if (siteExists(path)) {
      throw new SiteException("Site at " + path + " already exists, cant create");
    }
    String userId = sessionManagerService.getCurrentUserId();
    String siteTemplatePath = getSiteTemplate(siteType);  
    
    InputStream templateInputStream = null;
    try {

      // load the template
      authzResolverService.setRequestGrant("Loading Site Template");
      String template = null;
      JSONObject templateObject = null;
      
      try {
        templateInputStream = jcrNodeFactoryService.getInputStream(siteTemplatePath);
        template = IOUtils.readFully(templateInputStream, "UTF-8");
        
        templateObject = JSONObject.fromObject(template);		
      } finally {
        authzResolverService.clearRequestGrant();
      }
      LOG.info("Loading Site Template from " + siteTemplatePath + " as " + template);
      SiteBean siteBean = beanConverter.convertToObject(template, SiteBean.class);
      
      // make the template this user
      siteBean.setOwners(new String[] {userId});
      siteBean.setId(generateSiteUuid(path));
      siteBean.setType(siteType);
      siteBean.location(path);
      siteBean.service(this);
      siteBean.setTemplate(templateObject);
      
      return siteBean;

    } catch (RepositoryException e) {
      LOG.error(e.getMessage(), e);
    } catch (JCRNodeFactoryServiceException e) {
      LOG.error(e.getMessage(), e);
    } catch (UnsupportedEncodingException e) {
      LOG.error(e.getMessage(), e);
    } catch (IOException e) {
      LOG.error(e.getMessage(), e);
    } finally {
      try {
        templateInputStream.close();
      } catch (Exception ex) {
        // not interested
      }
    }
    return null;
  }

/**
   * Build the full path with file name to the group definition for a given site ID.
   *
   * @param id
   * @return
   */
  private String buildFilePath(String path) {
    return buildSiteFolder(path) + "/" + FILE_GROUPDEF;
  } 
  
  private String buildPageconfigurationPath(String path) {
	return buildSiteFolder(path) + "/" + FILE_PAGE_CONFIGURATION;
  }
  

  private String buildNavigationPath(String path) {
	 return  buildNavigationFolder(path) + "/" + FILE_CONTENT;
  }
  

  private String buildPagesPath(String path, String id) {
	 return buildPagesFolder(path) + "/" + id + "/" + FILE_CONTENT;
  }
  
  private String buildWidgetsPath(String path) {
	    return buildWidgetsFolder(path) + "/.test";
  }

  /**
   * @param path
   * @return
   */
  private String buildSiteFolder(String path) {
    return path + PATH_SITE;
  }  
  
  private String buildNavigationFolder(String path) {
    return path + PATH_NAVIGATION;
  }
  
  private String buildPagesFolder(String path) {
	return path + PATH_PAGES;
  }

  private String buildWidgetsFolder(String path) {
  	return path + PATH_WIDGETS;
  }

  public String locateSite(String groupDefFile) {
    String path = PathUtils.normalizePath(groupDefFile);
    if (path.endsWith(FILE_GROUPDEF)) {
      path = PathUtils.getParentReference(path);
      if (path.endsWith(PATH_SITE)) {
        return PathUtils.getParentReference(path);
      }
    }
    // not a site. cause a npe.
    return null;
  }

  /**
   * @param path
   * @return
   */
  private String generateSiteUuid(String path) {
    try {
      return StringUtils.sha1Hash(path + entropy);
    } catch (UnsupportedEncodingException e) {
      LOG.error(e);
    } catch (NoSuchAlgorithmException e) {
      LOG.error(e);
    }
    return null;
  }

  public String getSiteTemplate(String siteType) {
    if (siteType == null) {
      return defaultTemplate;
    }
    
    String template = siteTemplateMap.get(siteType);

    if (template == null) {
      return defaultTemplate;
    }
    return template;
  }

  /**
   * {@inheritDoc}
   *
   * @see org.sakaiproject.kernel.api.site.SiteService#getMemberList(java.lang.String,
   *      org.sakaiproject.kernel.util.rest.CollectionOptions)
   */
  public Map<String, Object> getMemberList(String path,
      CollectionOptions collectionOptions) {

    SiteBean siteBean = getSite(path);

    List<GroupMembershipBean> results = JpaUtils.getResultList(entityManager,
        "select g from GroupMembershipBean g where g.groupId = :groupId ", "g.",
        ImmutableMap.of("groupId", (Object) siteBean.getId()), collectionOptions);

    Map<String, Object> resultMap = Maps.newLinkedHashMap();
    for (GroupMembershipBean gmb : results) {
      Map<String, Object> membershipMap = Maps.newHashMap();
      membershipMap.put("group", gmb.getUserId());
      membershipMap.put("role", gmb.getRoleId());
      membershipMap.put("userid", gmb.getUserId());

      UserEnvironmentBean workingCopy = injector.getInstance(UserEnvironmentBean.class);
      UserEnvironment userEnvironment = userEnvironmentResolverService.resolve(gmb
          .getUserId());
      workingCopy.copyFrom(userEnvironment);
      workingCopy.seal();
      workingCopy.setProtected(true);
      membershipMap.put("userEnvironment", workingCopy);
      resultMap.put(gmb.getUserId(), membershipMap);
    }

    return resultMap;
  }

}
