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

package org.sakaiproject.jpa;

import java.util.ArrayList;
import java.util.List;

public class Employee
{
	private int employeeId;
	private String firstName;
	private String lastName;
	private List<Address> addresses;
	private List<Phone> phones;
	private List<Project> projects;

	public List<Project> getProjects()
	{
		return projects;
	}

	public void setProjects(List<Project> projects)
	{
		this.projects = projects;
	}

	public int getEmployeeId()
	{
		return employeeId;
	}

	public void setEmployeeId(int employeeId)
	{
		this.employeeId = employeeId;
	}

	public String getFirstName()
	{
		return firstName;
	}

	public void setFirstName(String firstName)
	{
		this.firstName = firstName;
	}

	public String getLastName()
	{
		return lastName;
	}

	public void setLastName(String lastName)
	{
		this.lastName = lastName;
	}

	public List<Address> getAddresses()
	{
		return addresses;
	}

	public void setAddresses(List<Address> addresses)
	{
		this.addresses = addresses;
	}

	public List<Phone> getPhones()
	{
		return phones;
	}

	public void setPhones(List<Phone> phones)
	{
		this.phones = phones;
	}

	public void addAddress(Address a)
	{
		if (addresses == null)
		{
			addresses = new ArrayList<Address>();
		}
		addresses.add(a);
	}

	public void addProject(Project p)
	{
		if (projects == null)
		{
			projects = new ArrayList<Project>();
		}
		projects.add(p);
	}
}
