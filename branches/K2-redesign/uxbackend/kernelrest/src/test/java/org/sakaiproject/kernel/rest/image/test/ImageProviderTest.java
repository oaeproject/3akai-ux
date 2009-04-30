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
package org.sakaiproject.kernel.rest.image.test;


import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.*;

import java.awt.Image;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.jcr.AccessDeniedException;
import javax.jcr.InvalidItemStateException;
import javax.jcr.ItemExistsException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.ReferentialIntegrityException;
import javax.jcr.RepositoryException;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.nodetype.NoSuchNodeTypeException;
import javax.jcr.version.VersionException;

import net.sf.json.JsonConfig;

import org.easymock.Capture;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.rest.image.ImageProvider;
import org.sakaiproject.kernel.rest.test.*;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConverter;

import com.google.inject.Guice;

public class ImageProviderTest extends BaseRestUT {
	
	public static final String TEST_IMAGE_FILE = "Bart_Simpson.png";
	private ImageProvider ip;
	
	
	@Before
	public void setupProvider() throws IOException {
		setupServices();
	    newSession();

		createProvider();
	}
	
	public void createProvider() {
		beanConverter = new BeanJsonLibConverter(Guice.createInjector(), new JsonConfig());
		this.ip = new ImageProvider(jcrNodeFactoryService, registryService, beanConverter);
	}

	@Test
	public void testingBeanConverter() {
		String[] stuff = new String[] {"this","is","json"};
		String json = beanConverter.convertToString(stuff);
		assertNotNull(json);
		assertEquals("[\"this\",\"is\",\"json\"]", json);
	}

	
	/**
	 * Check the cropIt service with valid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropIt() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", TEST_IMAGE_FILE);
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode(TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		
		assertEquals("{\"files\":[\"/saveIn/32x32_Bart_Simpson.png\",\"/saveIn/64x64_Bart_Simpson.png\"],\"response\":\"OK\"}", s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Does a test of the cropit service with invalid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropItWithInvalidParameters() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", "test");		//	This file does not exists!
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode("test")).andReturn(null).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		System.out.println(s);
		
		Map<String, String> mapJSONResponse = new HashMap<String, String>();
		mapJSONResponse.put("response", "ERROR");
		mapJSONResponse.put("message", "Invalid parameters");
		String expectedResponse = beanConverter.convertToString(mapJSONResponse);
		
		assertEquals(expectedResponse, s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Check if an image gets rendered to a buffered image correctly.
	 * @throws IOException
	 */
	@Test
	public void testToBufferedImage() throws IOException {

		InputStream is = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImage = ImageIO.read(is);
			is.close();
			Image img = Toolkit.getDefaultToolkit().createImage(bufImage.getSource());
			
			BufferedImage rendImage = this.ip.toBufferedImage(img, BufferedImage.TYPE_INT_ARGB);
			
			assertEquals(bufImage.getWidth(), rendImage.getWidth());
			assertEquals(bufImage.getHeight(), rendImage.getHeight());
			assertEquals(img.getHeight(null), rendImage.getHeight());
			assertEquals(img.getWidth(null), rendImage.getWidth());
			
			
		}
		finally {
			if (is != null) is.close();
		}
	}
	
	
	/**
	 * Get the mimetype of a JCR node.
	 * 
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromJCR() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		//		create mocks
		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Try to get the mimetype from the extension (in case the JCR fails.)
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromExtension() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {

		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/jpeg").anyTimes();	//	Set wrong mimetype just to be sure!
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Test to make sure it scales images correctly
	 * @throws IOException
	 */
	@Test
	public void testScaleAndWriteToStream() throws IOException {
		InputStream is = null;
		ByteArrayOutputStream baos = null;
		ByteArrayInputStream bais = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImg = ImageIO.read(is);
			
			baos = ip.scaleAndWriteToStream(50, 50, bufImg, "image/png", TEST_IMAGE_FILE);
					
			assertNotNull(baos);
			assertNotSame(0, baos.size());
			//	read it back as an image.
			bais = new ByteArrayInputStream(baos.toByteArray());
			BufferedImage rendImage = ImageIO.read(bais);
			assertEquals(50, rendImage.getWidth());
			assertEquals(50, rendImage.getHeight());
		}
		finally {
			if (is != null) is.close();
			if (baos != null) baos.close();
			if (bais != null) bais.close();
		}
		
		
		
	}
	
	/**
	 * Test to see if it can handle wacky filenames
	 * @throws IOException
	 */
	@Test
	public void testGetExtension() throws IOException{
		String s = "myFile.jpg";
		assertEquals("jpg", ip.getExtension(s));

		s = "myFile";
		assertEquals("myFile", ip.getExtension(s));

		s = "this.is.a.file.jpg";
		assertEquals("jpg", ip.getExtension(s));
	}

}
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
package org.sakaiproject.kernel.rest.image.test;


import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.*;

import java.awt.Image;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.jcr.AccessDeniedException;
import javax.jcr.InvalidItemStateException;
import javax.jcr.ItemExistsException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.ReferentialIntegrityException;
import javax.jcr.RepositoryException;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.nodetype.NoSuchNodeTypeException;
import javax.jcr.version.VersionException;

import net.sf.json.JsonConfig;

import org.easymock.Capture;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.rest.image.ImageProvider;
import org.sakaiproject.kernel.rest.test.*;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConverter;

import com.google.inject.Guice;

public class ImageProviderTest extends BaseRestUT {
	
	public static final String TEST_IMAGE_FILE = "Bart_Simpson.png";
	private ImageProvider ip;
	
	
	@Before
	public void setupProvider() throws IOException {
		setupServices();
	    newSession();

		createProvider();
	}
	
	public void createProvider() {
		beanConverter = new BeanJsonLibConverter(Guice.createInjector(), new JsonConfig());
		this.ip = new ImageProvider(jcrNodeFactoryService, registryService, beanConverter);
	}

	@Test
	public void testingBeanConverter() {
		String[] stuff = new String[] {"this","is","json"};
		String json = beanConverter.convertToString(stuff);
		assertNotNull(json);
		assertEquals("[\"this\",\"is\",\"json\"]", json);
	}

	
	/**
	 * Check the cropIt service with valid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropIt() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", TEST_IMAGE_FILE);
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode(TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		
		assertEquals("{\"files\":[\"/saveIn/32x32_Bart_Simpson.png\",\"/saveIn/64x64_Bart_Simpson.png\"],\"response\":\"OK\"}", s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Does a test of the cropit service with invalid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropItWithInvalidParameters() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", "test");		//	This file does not exists!
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode("test")).andReturn(null).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		System.out.println(s);
		
		Map<String, String> mapJSONResponse = new HashMap<String, String>();
		mapJSONResponse.put("response", "ERROR");
		mapJSONResponse.put("message", "Invalid parameters");
		String expectedResponse = beanConverter.convertToString(mapJSONResponse);
		
		assertEquals(expectedResponse, s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Check if an image gets rendered to a buffered image correctly.
	 * @throws IOException
	 */
	@Test
	public void testToBufferedImage() throws IOException {

		InputStream is = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImage = ImageIO.read(is);
			is.close();
			Image img = Toolkit.getDefaultToolkit().createImage(bufImage.getSource());
			
			BufferedImage rendImage = this.ip.toBufferedImage(img, BufferedImage.TYPE_INT_ARGB);
			
			assertEquals(bufImage.getWidth(), rendImage.getWidth());
			assertEquals(bufImage.getHeight(), rendImage.getHeight());
			assertEquals(img.getHeight(null), rendImage.getHeight());
			assertEquals(img.getWidth(null), rendImage.getWidth());
			
			
		}
		finally {
			if (is != null) is.close();
		}
	}
	
	
	/**
	 * Get the mimetype of a JCR node.
	 * 
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromJCR() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		//		create mocks
		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Try to get the mimetype from the extension (in case the JCR fails.)
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromExtension() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {

		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/jpeg").anyTimes();	//	Set wrong mimetype just to be sure!
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Test to make sure it scales images correctly
	 * @throws IOException
	 */
	@Test
	public void testScaleAndWriteToStream() throws IOException {
		InputStream is = null;
		ByteArrayOutputStream baos = null;
		ByteArrayInputStream bais = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImg = ImageIO.read(is);
			
			baos = ip.scaleAndWriteToStream(50, 50, bufImg, "image/png", TEST_IMAGE_FILE);
					
			assertNotNull(baos);
			assertNotSame(0, baos.size());
			//	read it back as an image.
			bais = new ByteArrayInputStream(baos.toByteArray());
			BufferedImage rendImage = ImageIO.read(bais);
			assertEquals(50, rendImage.getWidth());
			assertEquals(50, rendImage.getHeight());
		}
		finally {
			if (is != null) is.close();
			if (baos != null) baos.close();
			if (bais != null) bais.close();
		}
		
		
		
	}
	
	/**
	 * Test to see if it can handle wacky filenames
	 * @throws IOException
	 */
	@Test
	public void testGetExtension() throws IOException{
		String s = "myFile.jpg";
		assertEquals("jpg", ip.getExtension(s));

		s = "myFile";
		assertEquals("myFile", ip.getExtension(s));

		s = "this.is.a.file.jpg";
		assertEquals("jpg", ip.getExtension(s));
	}

}
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
package org.sakaiproject.kernel.rest.image.test;


import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.*;

import java.awt.Image;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.jcr.AccessDeniedException;
import javax.jcr.InvalidItemStateException;
import javax.jcr.ItemExistsException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.ReferentialIntegrityException;
import javax.jcr.RepositoryException;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.nodetype.NoSuchNodeTypeException;
import javax.jcr.version.VersionException;

import net.sf.json.JsonConfig;

import org.easymock.Capture;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.rest.image.ImageProvider;
import org.sakaiproject.kernel.rest.test.*;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConverter;

import com.google.inject.Guice;

public class ImageProviderTest extends BaseRestUT {
	
	public static final String TEST_IMAGE_FILE = "Bart_Simpson.png";
	private ImageProvider ip;
	
	
	@Before
	public void setupProvider() throws IOException {
		setupServices();
	    newSession();

		createProvider();
	}
	
	public void createProvider() {
		beanConverter = new BeanJsonLibConverter(Guice.createInjector(), new JsonConfig());
		this.ip = new ImageProvider(jcrNodeFactoryService, registryService, beanConverter);
	}

	@Test
	public void testingBeanConverter() {
		String[] stuff = new String[] {"this","is","json"};
		String json = beanConverter.convertToString(stuff);
		assertNotNull(json);
		assertEquals("[\"this\",\"is\",\"json\"]", json);
	}

	
	/**
	 * Check the cropIt service with valid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropIt() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", TEST_IMAGE_FILE);
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode(TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		
		assertEquals("{\"files\":[\"/saveIn/32x32_Bart_Simpson.png\",\"/saveIn/64x64_Bart_Simpson.png\"],\"response\":\"OK\"}", s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Does a test of the cropit service with invalid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropItWithInvalidParameters() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", "test");		//	This file does not exists!
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode("test")).andReturn(null).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		System.out.println(s);
		
		Map<String, String> mapJSONResponse = new HashMap<String, String>();
		mapJSONResponse.put("response", "ERROR");
		mapJSONResponse.put("message", "Invalid parameters");
		String expectedResponse = beanConverter.convertToString(mapJSONResponse);
		
		assertEquals(expectedResponse, s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Check if an image gets rendered to a buffered image correctly.
	 * @throws IOException
	 */
	@Test
	public void testToBufferedImage() throws IOException {

		InputStream is = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImage = ImageIO.read(is);
			is.close();
			Image img = Toolkit.getDefaultToolkit().createImage(bufImage.getSource());
			
			BufferedImage rendImage = this.ip.toBufferedImage(img, BufferedImage.TYPE_INT_ARGB);
			
			assertEquals(bufImage.getWidth(), rendImage.getWidth());
			assertEquals(bufImage.getHeight(), rendImage.getHeight());
			assertEquals(img.getHeight(null), rendImage.getHeight());
			assertEquals(img.getWidth(null), rendImage.getWidth());
			
			
		}
		finally {
			if (is != null) is.close();
		}
	}
	
	
	/**
	 * Get the mimetype of a JCR node.
	 * 
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromJCR() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		//		create mocks
		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Try to get the mimetype from the extension (in case the JCR fails.)
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromExtension() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {

		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/jpeg").anyTimes();	//	Set wrong mimetype just to be sure!
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Test to make sure it scales images correctly
	 * @throws IOException
	 */
	@Test
	public void testScaleAndWriteToStream() throws IOException {
		InputStream is = null;
		ByteArrayOutputStream baos = null;
		ByteArrayInputStream bais = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImg = ImageIO.read(is);
			
			baos = ip.scaleAndWriteToStream(50, 50, bufImg, "image/png", TEST_IMAGE_FILE);
					
			assertNotNull(baos);
			assertNotSame(0, baos.size());
			//	read it back as an image.
			bais = new ByteArrayInputStream(baos.toByteArray());
			BufferedImage rendImage = ImageIO.read(bais);
			assertEquals(50, rendImage.getWidth());
			assertEquals(50, rendImage.getHeight());
		}
		finally {
			if (is != null) is.close();
			if (baos != null) baos.close();
			if (bais != null) bais.close();
		}
		
		
		
	}
	
	/**
	 * Test to see if it can handle wacky filenames
	 * @throws IOException
	 */
	@Test
	public void testGetExtension() throws IOException{
		String s = "myFile.jpg";
		assertEquals("jpg", ip.getExtension(s));

		s = "myFile";
		assertEquals("myFile", ip.getExtension(s));

		s = "this.is.a.file.jpg";
		assertEquals("jpg", ip.getExtension(s));
	}

}
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
package org.sakaiproject.kernel.rest.image.test;


import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.*;

import java.awt.Image;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.jcr.AccessDeniedException;
import javax.jcr.InvalidItemStateException;
import javax.jcr.ItemExistsException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.ReferentialIntegrityException;
import javax.jcr.RepositoryException;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.nodetype.NoSuchNodeTypeException;
import javax.jcr.version.VersionException;

import net.sf.json.JsonConfig;

import org.easymock.Capture;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.rest.image.ImageProvider;
import org.sakaiproject.kernel.rest.test.*;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConverter;

import com.google.inject.Guice;

public class ImageProviderTest extends BaseRestUT {
	
	public static final String TEST_IMAGE_FILE = "Bart_Simpson.png";
	private ImageProvider ip;
	
	
	@Before
	public void setupProvider() throws IOException {
		setupServices();
	    newSession();

		createProvider();
	}
	
	public void createProvider() {
		beanConverter = new BeanJsonLibConverter(Guice.createInjector(), new JsonConfig());
		this.ip = new ImageProvider(jcrNodeFactoryService, registryService, beanConverter);
	}

	@Test
	public void testingBeanConverter() {
		String[] stuff = new String[] {"this","is","json"};
		String json = beanConverter.convertToString(stuff);
		assertNotNull(json);
		assertEquals("[\"this\",\"is\",\"json\"]", json);
	}

	
	/**
	 * Check the cropIt service with valid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropIt() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", TEST_IMAGE_FILE);
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode(TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		
		assertEquals("{\"files\":[\"/saveIn/32x32_Bart_Simpson.png\",\"/saveIn/64x64_Bart_Simpson.png\"],\"response\":\"OK\"}", s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Does a test of the cropit service with invalid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropItWithInvalidParameters() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", "test");		//	This file does not exists!
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode("test")).andReturn(null).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		System.out.println(s);
		
		Map<String, String> mapJSONResponse = new HashMap<String, String>();
		mapJSONResponse.put("response", "ERROR");
		mapJSONResponse.put("message", "Invalid parameters");
		String expectedResponse = beanConverter.convertToString(mapJSONResponse);
		
		assertEquals(expectedResponse, s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Check if an image gets rendered to a buffered image correctly.
	 * @throws IOException
	 */
	@Test
	public void testToBufferedImage() throws IOException {

		InputStream is = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImage = ImageIO.read(is);
			is.close();
			Image img = Toolkit.getDefaultToolkit().createImage(bufImage.getSource());
			
			BufferedImage rendImage = this.ip.toBufferedImage(img, BufferedImage.TYPE_INT_ARGB);
			
			assertEquals(bufImage.getWidth(), rendImage.getWidth());
			assertEquals(bufImage.getHeight(), rendImage.getHeight());
			assertEquals(img.getHeight(null), rendImage.getHeight());
			assertEquals(img.getWidth(null), rendImage.getWidth());
			
			
		}
		finally {
			if (is != null) is.close();
		}
	}
	
	
	/**
	 * Get the mimetype of a JCR node.
	 * 
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromJCR() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		//		create mocks
		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Try to get the mimetype from the extension (in case the JCR fails.)
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromExtension() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {

		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/jpeg").anyTimes();	//	Set wrong mimetype just to be sure!
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Test to make sure it scales images correctly
	 * @throws IOException
	 */
	@Test
	public void testScaleAndWriteToStream() throws IOException {
		InputStream is = null;
		ByteArrayOutputStream baos = null;
		ByteArrayInputStream bais = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImg = ImageIO.read(is);
			
			baos = ip.scaleAndWriteToStream(50, 50, bufImg, "image/png", TEST_IMAGE_FILE);
					
			assertNotNull(baos);
			assertNotSame(0, baos.size());
			//	read it back as an image.
			bais = new ByteArrayInputStream(baos.toByteArray());
			BufferedImage rendImage = ImageIO.read(bais);
			assertEquals(50, rendImage.getWidth());
			assertEquals(50, rendImage.getHeight());
		}
		finally {
			if (is != null) is.close();
			if (baos != null) baos.close();
			if (bais != null) bais.close();
		}
		
		
		
	}
	
	/**
	 * Test to see if it can handle wacky filenames
	 * @throws IOException
	 */
	@Test
	public void testGetExtension() throws IOException{
		String s = "myFile.jpg";
		assertEquals("jpg", ip.getExtension(s));

		s = "myFile";
		assertEquals("myFile", ip.getExtension(s));

		s = "this.is.a.file.jpg";
		assertEquals("jpg", ip.getExtension(s));
	}

}
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
package org.sakaiproject.kernel.rest.image.test;


import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.*;

import java.awt.Image;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.jcr.AccessDeniedException;
import javax.jcr.InvalidItemStateException;
import javax.jcr.ItemExistsException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.ReferentialIntegrityException;
import javax.jcr.RepositoryException;
import javax.jcr.lock.LockException;
import javax.jcr.nodetype.ConstraintViolationException;
import javax.jcr.nodetype.NoSuchNodeTypeException;
import javax.jcr.version.VersionException;

import net.sf.json.JsonConfig;

import org.easymock.Capture;
import org.junit.Before;
import org.junit.Test;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.rest.image.ImageProvider;
import org.sakaiproject.kernel.rest.test.*;
import org.sakaiproject.kernel.serialization.json.BeanJsonLibConverter;

import com.google.inject.Guice;

public class ImageProviderTest extends BaseRestUT {
	
	public static final String TEST_IMAGE_FILE = "Bart_Simpson.png";
	private ImageProvider ip;
	
	
	@Before
	public void setupProvider() throws IOException {
		setupServices();
	    newSession();

		createProvider();
	}
	
	public void createProvider() {
		beanConverter = new BeanJsonLibConverter(Guice.createInjector(), new JsonConfig());
		this.ip = new ImageProvider(jcrNodeFactoryService, registryService, beanConverter);
	}

	@Test
	public void testingBeanConverter() {
		String[] stuff = new String[] {"this","is","json"};
		String json = beanConverter.convertToString(stuff);
		assertNotNull(json);
		assertEquals("[\"this\",\"is\",\"json\"]", json);
	}

	
	/**
	 * Check the cropIt service with valid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropIt() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", TEST_IMAGE_FILE);
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode(TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		
		assertEquals("{\"files\":[\"/saveIn/32x32_Bart_Simpson.png\",\"/saveIn/64x64_Bart_Simpson.png\"],\"response\":\"OK\"}", s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Does a test of the cropit service with invalid parameters.
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testCropItWithInvalidParameters() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		Map<String, Object> map = new HashMap<String, Object>();
		//	set of parameters
		map.put("x", "10");
		map.put("y", "10");
		map.put("width", "50");
		map.put("height", "50");
		map.put("urlImgtoCrop", "test");		//	This file does not exists!
		map.put("urlSaveIn", "/saveIn/");
		ArrayList<Map<String, String>> dimensions = new ArrayList<Map<String, String>>();
		for (int i = 1;i < 3;i++) {
			Map<String, String> mapDimensions = new HashMap<String, String>();
			mapDimensions.put("width", "" + (32 * i));
			mapDimensions.put("height", "" + (32 * i));
			dimensions.add(mapDimensions);
		}
		map.put("dimensions", dimensions);
		String parameters = beanConverter.convertToString(map);

		InputStream is = ImageProviderTest.class.getClassLoader().getResourceAsStream(ImageProviderTest.TEST_IMAGE_FILE);
				
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.setProperty(JCRConstants.JCR_MIMETYPE, "image/png")).andReturn(null).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    node.save();
	    expectLastCall().anyTimes();
	    
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();

	    Capture<InputStream> inputStream = new Capture<InputStream>();
	    Capture<String> stringCapture = new Capture<String>();
	    Capture<String> stringCapture2 = new Capture<String>();

	    expect(jcrNodeFactoryService.getNode("test")).andReturn(null).anyTimes();
	    expect(jcrNodeFactoryService.getInputStream(TEST_IMAGE_FILE)).andReturn(is).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/32x32_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    expect(jcrNodeFactoryService.getNode("/saveIn/64x64_" + TEST_IMAGE_FILE)).andReturn(node).anyTimes();
	    
	    expect(
	        jcrNodeFactoryService.setInputStream(capture(stringCapture),
	            capture(inputStream), capture(stringCapture2))).andReturn(node).anyTimes();
	    
		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.cropit(parameters);
		System.out.println(s);
		
		Map<String, String> mapJSONResponse = new HashMap<String, String>();
		mapJSONResponse.put("response", "ERROR");
		mapJSONResponse.put("message", "Invalid parameters");
		String expectedResponse = beanConverter.convertToString(mapJSONResponse);
		
		assertEquals(expectedResponse, s);
				
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Check if an image gets rendered to a buffered image correctly.
	 * @throws IOException
	 */
	@Test
	public void testToBufferedImage() throws IOException {

		InputStream is = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImage = ImageIO.read(is);
			is.close();
			Image img = Toolkit.getDefaultToolkit().createImage(bufImage.getSource());
			
			BufferedImage rendImage = this.ip.toBufferedImage(img, BufferedImage.TYPE_INT_ARGB);
			
			assertEquals(bufImage.getWidth(), rendImage.getWidth());
			assertEquals(bufImage.getHeight(), rendImage.getHeight());
			assertEquals(img.getHeight(null), rendImage.getHeight());
			assertEquals(img.getWidth(null), rendImage.getWidth());
			
			
		}
		finally {
			if (is != null) is.close();
		}
	}
	
	
	/**
	 * Get the mimetype of a JCR node.
	 * 
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromJCR() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {
		//		create mocks
		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(true).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/png").anyTimes();
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Try to get the mimetype from the extension (in case the JCR fails.)
	 * @throws IOException
	 * @throws JCRNodeFactoryServiceException
	 * @throws AccessDeniedException
	 * @throws ItemExistsException
	 * @throws ConstraintViolationException
	 * @throws InvalidItemStateException
	 * @throws ReferentialIntegrityException
	 * @throws VersionException
	 * @throws LockException
	 * @throws NoSuchNodeTypeException
	 * @throws ItemNotFoundException
	 * @throws RepositoryException
	 */
	@Test
	public void testGetMimeTypeForNodeFromExtension() throws IOException, JCRNodeFactoryServiceException, AccessDeniedException, ItemExistsException, ConstraintViolationException, InvalidItemStateException, ReferentialIntegrityException, VersionException, LockException, NoSuchNodeTypeException, ItemNotFoundException, RepositoryException {

		
	    Node node = createMock(Node.class);
	    Property mimeTypeProperty = createMock(Property.class);
	    
	    expect(node.isNodeType(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.hasProperty(JCRConstants.JCR_MIMETYPE)).andReturn(false).anyTimes();
	    expect(node.getProperty(JCRConstants.JCR_MIMETYPE)).andReturn(mimeTypeProperty).anyTimes();
	    expect(mimeTypeProperty.getString()).andReturn("image/jpeg").anyTimes();	//	Set wrong mimetype just to be sure!
	    

		replayMocks(node, mimeTypeProperty);
		
		String s = this.ip.getMimeTypeForNode(node, TEST_IMAGE_FILE);
		assertEquals("image/png", s);
		
		verifyMocks(node, mimeTypeProperty);
		resetMocks(node, mimeTypeProperty);
	}
	
	/**
	 * Test to make sure it scales images correctly
	 * @throws IOException
	 */
	@Test
	public void testScaleAndWriteToStream() throws IOException {
		InputStream is = null;
		ByteArrayOutputStream baos = null;
		ByteArrayInputStream bais = null;
		try {
			is = ImageProviderTest.class.getClassLoader().getResourceAsStream(TEST_IMAGE_FILE);
			BufferedImage bufImg = ImageIO.read(is);
			
			baos = ip.scaleAndWriteToStream(50, 50, bufImg, "image/png", TEST_IMAGE_FILE);
					
			assertNotNull(baos);
			assertNotSame(0, baos.size());
			//	read it back as an image.
			bais = new ByteArrayInputStream(baos.toByteArray());
			BufferedImage rendImage = ImageIO.read(bais);
			assertEquals(50, rendImage.getWidth());
			assertEquals(50, rendImage.getHeight());
		}
		finally {
			if (is != null) is.close();
			if (baos != null) baos.close();
			if (bais != null) bais.close();
		}
		
		
		
	}
	
	/**
	 * Test to see if it can handle wacky filenames
	 * @throws IOException
	 */
	@Test
	public void testGetExtension() throws IOException{
		String s = "myFile.jpg";
		assertEquals("jpg", ip.getExtension(s));

		s = "myFile";
		assertEquals("myFile", ip.getExtension(s));

		s = "this.is.a.file.jpg";
		assertEquals("jpg", ip.getExtension(s));
	}

}
