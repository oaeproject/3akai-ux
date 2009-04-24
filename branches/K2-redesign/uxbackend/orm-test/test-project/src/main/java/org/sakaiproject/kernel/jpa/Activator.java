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
package org.sakaiproject.kernel.jpa;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.sakaiproject.jpa.Employee;
import org.sakaiproject.kernel.api.ComponentActivator;
import org.sakaiproject.kernel.api.ComponentActivatorException;
import org.sakaiproject.kernel.api.Kernel;
import org.sakaiproject.kernel2.mp2.Room;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.Query;

public class Activator implements ComponentActivator {

  private EntityManager em;

  public void activate(Kernel kernel) throws ComponentActivatorException {
    
    em = kernel.getService(EntityManager.class);
    if ( em == null ) {
      throw new ComponentActivatorException("Entity Manager was not present in the Kernel ");
    }
    try {
      accessRemoteModel();
      accesLocalModel();
    } catch (Exception e) {
      throw new ComponentActivatorException("In Component Tests Failed",e);
    }
    // nothing to do since this project is just to export the model classes
  }

  public void deactivate() {
  }
  
  public void accessRemoteModel() throws Exception {
    em.getTransaction().begin();

    // look for model from kernel
    Query selectSubject = em
        .createQuery("select s from SubjectPermissionBean s");
    assertEquals(0, selectSubject.getResultList().size());

    // look for model from model-project-2
    Query selectProject = em.createQuery("select r from Room r");
    assertEquals(0, selectProject.getResultList().size());

    // add something
    Room r = new Room();
    r.id = 1;
    r.number = 1;
    em.persist(r);

    em.flush();

    // single first name entry
    Query selectByNumber = em
        .createQuery("select r from Room r where r.number = ?1");
    selectByNumber.setParameter(1, 1);
    List<?> employees = selectByNumber.getResultList();
    assertNotNull(employees);
    assertEquals(1, employees.size());

    em.getTransaction().rollback();
    
    
    System.err.println("TEST PASSED OK");
  }

  /**
   * Ignore this test because there is a problem in it.
   * 
   * @throws Exception
   */
  public void accesLocalModel() throws Exception {
    em.getTransaction().begin();

    Query select = em.createQuery("select e from Employee e");
    assertEquals(0, select.getResultList().size());

    Employee e = new Employee();
    e.setFirstName("Carl");
    em.persist(e);
    em.flush();

    assertEquals(1, select.getResultList().size());

    em.getTransaction().rollback();
    System.err.println("TEST PASSED OK");
  }
  

}
