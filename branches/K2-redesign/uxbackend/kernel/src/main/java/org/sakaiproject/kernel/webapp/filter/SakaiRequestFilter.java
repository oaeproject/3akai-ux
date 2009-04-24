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

package org.sakaiproject.kernel.webapp.filter;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.sakaiproject.kernel.api.KernelManager;
import org.sakaiproject.kernel.api.authz.PermissionDeniedException;
import org.sakaiproject.kernel.api.authz.UnauthorizedException;
import org.sakaiproject.kernel.api.jcr.JCRService;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.session.SessionManagerService;
import org.sakaiproject.kernel.api.user.UserResolverService;
import org.sakaiproject.kernel.webapp.SakaiServletRequest;
import org.sakaiproject.kernel.webapp.SakaiServletResponse;

import java.io.IOException;

import javax.jcr.AccessDeniedException;
import javax.jcr.Session;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.transaction.HeuristicMixedException;
import javax.transaction.HeuristicRollbackException;
import javax.transaction.NotSupportedException;
import javax.transaction.RollbackException;
import javax.transaction.Status;
import javax.transaction.SystemException;
import javax.transaction.TransactionManager;

/**
 *
 */
public class SakaiRequestFilter implements Filter {
  private static final Log LOG = LogFactory.getLog(SakaiRequestFilter.class);

  private static final boolean debug = LOG.isDebugEnabled();

  private static final String TIME_REQUEST = "time-requests";

  private static final String NO_SESSION = "no-session";

  private boolean timeOn = false;

  private SessionManagerService sessionManagerService;

  private CacheManagerService cacheManagerService;

  private UserResolverService userResolverService;

  private boolean noSession = false;

  private TransactionManager transactionManager;

  private JCRService jcrService;

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
   */
  public void init(FilterConfig config) throws ServletException {
    timeOn = "true".equals(config.getInitParameter(TIME_REQUEST));
    KernelManager kernelManager = new KernelManager();
    sessionManagerService = kernelManager.getService(SessionManagerService.class);
    cacheManagerService = kernelManager.getService(CacheManagerService.class);
    userResolverService = kernelManager.getService(UserResolverService.class);
    transactionManager = kernelManager.getService(TransactionManager.class);
    jcrService = kernelManager.getService(JCRService.class);
    LOG.info("Initializing SessionManagerService " + sessionManagerService);
    LOG.info("Initializing Cache Manager Service " + cacheManagerService);
    noSession = "true".equals(config.getInitParameter(NO_SESSION));
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.Filter#destroy()
   */
  public void destroy() {

  }

  /**
   * {@inheritDoc}
   *
   * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest,
   *      javax.servlet.ServletResponse, javax.servlet.FilterChain)
   */
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest hrequest = (HttpServletRequest) request;
    String requestedSessionID = hrequest.getRequestedSessionId();
    if (noSession) {
      request.setAttribute(SakaiServletRequest.NO_SESSION_USE, "true");
    }
    SakaiServletRequest wrequest = new SakaiServletRequest(request, response,
        userResolverService, sessionManagerService);
    SakaiServletResponse wresponse = new SakaiServletResponse(response);
    sessionManagerService.bindRequest(wrequest);
    try {
      begin();
      if (timeOn) {
        long start = System.currentTimeMillis();
        try {
          chain.doFilter(wrequest, wresponse);

        } finally {
          long end = System.currentTimeMillis();
          LOG.info("Request took " + hrequest.getMethod() + " " + hrequest.getPathInfo()
              + " " + (end - start) + " ms");
        }
      } else {
        chain.doFilter(wrequest, wresponse);
      }
      try {
        if (jcrService.hasActiveSession()) {
          Session session = jcrService.getSession();
          session.save();
        }
      } catch (AccessDeniedException e ) {
        throw new SecurityException(e.getMessage(),e);
      } catch (Exception e) {
        LOG.warn(e);
      }
      commit();
    } catch (SecurityException se) {
      se.printStackTrace();
      rollback();
      // catch any Security exceptions and send a 401
      wresponse.reset();
      wresponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, se.getMessage());
    } catch (UnauthorizedException ape) {
      rollback();
      // catch any Unauthorized exceptions and send a 401
      wresponse.reset();
      wresponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, ape.getMessage());
    } catch (PermissionDeniedException pde) {
      rollback();
      // catch any permission denied exceptions, and send a 403
      wresponse.reset();
      wresponse.sendError(HttpServletResponse.SC_FORBIDDEN, pde.getMessage());
    } catch (RuntimeException e) {
      rollback();
      throw e;
    } catch (IOException e) {
      rollback();
      throw e;
    } catch (ServletException e) {
      rollback();
      throw e;
    } catch (Throwable t) {
      rollback();
      throw new ServletException(t.getMessage(), t);
    } finally {
      wresponse.commitStatus(sessionManagerService);
      cacheManagerService.unbind(CacheScope.REQUEST);
    }
    if (debug) {
      HttpSession hsession = hrequest.getSession(false);
      if (hsession != null && !hsession.getId().equals(requestedSessionID)) {
        LOG.debug("New Session Created with ID " + hsession.getId());
      }
    }

  }

  /**
   * @throws SystemException
   * @throws NotSupportedException
   *
   */
  protected void begin() throws NotSupportedException, SystemException {
    transactionManager.begin();
  }

  /**
   * @throws SystemException
   * @throws SecurityException
   *
   */
  protected void commit() throws SecurityException, SystemException {
    try {
      if (Status.STATUS_NO_TRANSACTION != transactionManager.getStatus()) {
        transactionManager.commit();
      }
    } catch (RollbackException e) {
      if (debug)
        LOG.debug(e);
    } catch (IllegalStateException e) {
      if (debug)
        LOG.debug(e);
    } catch (HeuristicMixedException e) {
      LOG.warn(e);
    } catch (HeuristicRollbackException e) {
      LOG.warn(e);
    }
  }

  /**
   *
   */
  protected void rollback() {
    try {
      transactionManager.rollback();
    } catch (IllegalStateException e) {
      if (debug)
        LOG.debug(e);
    } catch (Exception e) {
      LOG.error(e.getMessage(), e);
    }
  }

}
