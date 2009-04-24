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

package org.sakaiproject.jpa.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.Query;

import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.jpa.Address;
import org.sakaiproject.jpa.Employee;
import org.sakaiproject.jpa.Project;

public abstract class TestLookup
{
	static boolean isSetup;
	static EntityManager em;

	public abstract EntityManager entityManager();

	@Before
	public void runOnceSetUp()
	{
		if (!isSetup)
		{
			em = entityManager();
			em.getTransaction().begin();

			// create some addresses
			Address a1 = new Address();
			a1.setStreet("123 Main St.");
			a1.setCity("Mainville");
			a1.setState("GA");
			em.persist(a1);

			Address a2 = new Address();
			a2.setStreet("128 Main St.");
			a2.setCity("Maintown");
			a2.setState("SD");
			em.persist(a2);

			Address a3 = new Address();
			a3.setStreet("128 Other Dr.");
			a3.setCity("Maintown");
			a3.setState("VT");
			em.persist(a3);

			Address a4 = new Address();
			a4.setStreet("500 Boulevard.");
			a4.setCity("Maintown");
			a4.setState("DE");
			em.persist(a4);

			Employee e1 = new Employee();
			e1.setFirstName("Carl");
			e1.setLastName("Hall");
			e1.addAddress(a1);
			e1.addAddress(a2);
			em.persist(e1);

			Employee e2 = new Employee();
			e2.setFirstName("Michelle");
			e2.setLastName("Hall");
			e2.addAddress(a2);
			em.persist(e2);

			Employee e3 = new Employee();
			e3.setFirstName("Stuart");
			e3.setLastName("Freeman");
			e3.addAddress(a3);
			em.persist(e3);

			Employee e4 = new Employee();
			e4.setFirstName("Clay");
			e4.setLastName("Fenlason");
			e4.addAddress(a2);
			e4.addAddress(a4);
			em.persist(e4);

			Employee e5 = new Employee();
			e5.setFirstName("Clay");
			e5.setLastName("Smith");
			e5.addAddress(a2);
			e5.addAddress(a3);
			em.persist(e5);

			Project p1 = new Project();
			p1.setName("Test Project 1");
			p1.addEmployee(e1);
			p1.addEmployee(e2);
			p1.addEmployee(e3);
			em.persist(p1);

			e1.addProject(p1);
			em.persist(e1);
			e2.addProject(p1);
			em.persist(e2);
			e3.addProject(p1);
			em.persist(e3);

			Project p2 = new Project();
			p2.setName("Test Project 2");
			p2.addEmployee(e3);
			p2.addEmployee(e4);
			p2.addEmployee(e5);
			em.persist(p2);

			e3.addProject(p2);
			em.persist(e3);
			e4.addProject(p2);
			em.persist(e4);
			e5.addProject(p2);
			em.persist(e5);

			em.flush();

			isSetup = true;
		}
	}

	@Test
	@SuppressWarnings("unchecked")
	public void testSelectAllEmployees()
	{
		Query selectAllEmployees = em.createQuery("select e from Employee e");
		List<Employee> employees = (List<Employee>) selectAllEmployees.getResultList();
		assertNotNull(employees);
		assertTrue(employees.size() > 0);
	}

	@Test
	@SuppressWarnings("unchecked")
	public void simpleSelectEmployee()
	{
		//
		// FIRST NAME
		//
		// single first name entry
		Query selectByFirstName = em.createQuery("select e from Employee e where e.firstName = ?1");
		selectByFirstName.setParameter(1, "Carl");
		List<Employee> employees = (List<Employee>) selectByFirstName.getResultList();
		assertNotNull(employees);
		assertEquals(1, employees.size());

		// multiple first name entries
		selectByFirstName.setParameter(1, "Clay");
		employees = (List<Employee>) selectByFirstName.getResultList();
		assertNotNull(employees);
		assertEquals(2, employees.size());

		// non-existent entry
		selectByFirstName.setParameter(1, "Bobby");
		employees = (List<Employee>) selectByFirstName.getResultList();
		assertNotNull(employees);
		assertEquals(0, employees.size());

		//
		// LAST NAME
		//
		// single last name entry
		Query selectByLastName = em.createQuery("select e from Employee e where e.lastName = ?1");
		selectByLastName.setParameter(1, "Freeman");
		employees = (List<Employee>) selectByLastName.getResultList();
		assertNotNull(employees);
		assertEquals(1, employees.size());

		// multiple last name entries
		selectByLastName.setParameter(1, "Hall");
		employees = (List<Employee>) selectByLastName.getResultList();
		assertNotNull(employees);
		assertEquals(2, employees.size());

		// non-existent entry
		selectByLastName.setParameter(1, "Jones");
		employees = (List<Employee>) selectByLastName.getResultList();
		assertNotNull(employees);
		assertEquals(0, employees.size());
	}

	@Test
	@SuppressWarnings("unchecked")
	public void multiSelectEmployee()
	{
		Query selectByFirstLastName = em
				.createQuery("select e from Employee e where e.firstName = ?1 and e.lastName = ?2");
		selectByFirstLastName.setParameter(1, "Carl").setParameter(2, "Hall");
		List<Employee> employees = (List<Employee>) selectByFirstLastName.getResultList();
		assertNotNull(employees);
		assertEquals(1, employees.size());

		selectByFirstLastName = em
				.createQuery("select e from Employee e where e.firstName = ?1 and e.lastName = ?2");
		selectByFirstLastName.setParameter(1, "Carl").setParameter(2, "Johnson");
		employees = (List<Employee>) selectByFirstLastName.getResultList();
		assertNotNull(employees);
		assertEquals(0, employees.size());

		selectByFirstLastName = em
				.createQuery("select e from Employee e where e.firstName = ?1 and e.lastName = ?2");
		selectByFirstLastName.setParameter(1, "Tommy").setParameter(2, "Hall");
		employees = (List<Employee>) selectByFirstLastName.getResultList();
		assertNotNull(employees);
		assertEquals(0, employees.size());

		selectByFirstLastName = em
				.createQuery("select e from Employee e where e.firstName = ?1 and e.lastName = ?2");
		selectByFirstLastName.setParameter(1, "Wrong").setParameter(2, "Dude");
		employees = (List<Employee>) selectByFirstLastName.getResultList();
		assertNotNull(employees);
		assertEquals(0, employees.size());
	}

	@Test
	@SuppressWarnings("unchecked")
	public void selectProjects()
	{
		Query selectProject = em.createQuery("select p from Project p");
		List<Project> projects = (List<Project>) selectProject.getResultList();
		assertNotNull(projects);
		assertEquals(2, projects.size());

		selectProject = em.createQuery("select p from Project p where p.name = ?1");
		selectProject.setParameter(1, "Test Project 1");
		projects = (List<Project>) selectProject.getResultList();
		assertNotNull(projects);
		assertEquals(1, projects.size());

		selectProject = em.createQuery("select p from Project p where p.name = ?1");
		selectProject.setParameter(1, "Test Project K");
		projects = (List<Project>) selectProject.getResultList();
		assertNotNull(projects);
		assertEquals(0, projects.size());
	}

	@Test
	public void selectEmployeeByAddress()
	{

	}

	@Test
	public void selectEmployeesByProjects()
	{

	}

	@Test
	@SuppressWarnings("unchecked")
	public void selectProjectsByEmployee()
	{
		Query select = em.createQuery("select e.projects from Employee e where e.firstName = ?1");
		select.setParameter(1, "Carl");
		List<Project> projects = (List<Project>) select.getResultList();
		assertNotNull(projects);
		assertEquals(1, projects.size());

		select = em.createQuery("select e.projects from Employee e where e.lastName = ?1");
		select.setParameter(1, "Freeman");
		projects = (List<Project>) select.getResultList();
		assertNotNull(projects);
		assertEquals(2, projects.size());
	}
}
