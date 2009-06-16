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

package org.sakaiproject.sdata.tool.test;

import junit.framework.TestCase;

/**
 * @author ieb
 */
public class CHSHandlerUnitT extends TestCase
{
/**
 * <pre>
	protected static final Map<String, Object> componentMap = new HashMap<String, Object>();

	protected static final Log LOG = LogFactory.getLog(CHSHandlerUnitT.class);

	/**
	 * @param arg0
	 * /
	public CHSHandlerUnitT(String arg0)
	{
		super(arg0);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see junit.framework.TestCase#setUp()
	 * /
	protected void setUp() throws Exception
	{
		super.setUp();
		ContentHostingService chs = new MockContentHostingService()
		{

			private Map<String, ContentCollection> ccMap = new HashMap<String, ContentCollection>();

			/*
			 * (non-Javadoc)
			 * 
			 * @see org.sakaiproject.sdata.tool.test.MockContentHostingService#getCollection(java.lang.String)
			 * /
			@Override
			public ContentCollection getCollection(String path) throws IdUnusedException,
					TypeException, PermissionException
			{
				ContentCollection cc = ccMap.get(path);
				if ("/content/group/testcollection/".equals(path))
				{
					LOG.info("Request for " + path + " was mockCC ");
					return new MockContentCollection(path);
				}
				else
				{
					LOG.info("Request for " + path + " was " + cc);
				}
				return cc;
			}

			/*
			 * (non-Javadoc)
			 * 
			 * @see org.sakaiproject.sdata.tool.test.MockContentHostingService#addCollection(java.lang.String)
			 * /
			@Override
			public ContentCollectionEdit addCollection(String path)
					throws IdUsedException, IdInvalidException, PermissionException,
					InconsistentException
			{
				ContentCollectionEdit cce = new MockContentCollection(path);
				ccMap.put(path, cce);
				return cce;
			}

		};
		componentMap.put(ContentHostingService.class.getName(), chs);
		Kernel.setComponentManager(new MockComponentManager(componentMap));
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see junit.framework.TestCase#tearDown()
	 * /
	protected void tearDown() throws Exception
	{
		super.tearDown();
	}

	public void testGetFolder()
	{

		ConcreteCHSHandler chsH = new ConcreteCHSHandler();
		Map<String, String> m = new HashMap<String, String>();
		chsH.init(m);
		ContentCollection cc = chsH.testGetFolder("/content/group/testcollection");
		assertNotNull(cc);
		cc = chsH.testGetFolder("/content/group/testcollection/");
		assertNotNull(cc);
		cc = chsH.testGetFolder("/content/group/testcollection/1/2/3");
		assertNotNull(cc);
		cc = chsH.testGetFolder("/content/group/testcollection/1/2/3/sdfsdf/sad/sdffsd/");
		assertNotNull(cc);

	}

	public void testGetName()
	{
		ConcreteCHSHandler chsH = new ConcreteCHSHandler();
		Map<String, String> m = new HashMap<String, String>();
		chsH.init(m);

		String name = chsH.testGetName(new MockContentResource(
				"/sdfsdf/sdfsdfsdf/rtert.pdf"));
		assertEquals("rtert.pdf", name);
		name = chsH.testGetName(new MockContentResource("/sdfsdf/sdfsdfsdf/rtert.pdf/"));
		assertEquals("rtert.pdf", name);
	}
	</pre>
	*/
}
