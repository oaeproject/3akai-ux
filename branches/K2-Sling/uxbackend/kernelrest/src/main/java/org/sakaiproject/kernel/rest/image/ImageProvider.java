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
package org.sakaiproject.kernel.rest.image;

import com.google.inject.Inject;


import org.sakaiproject.kernel.api.Registry;
import org.sakaiproject.kernel.api.RegistryService;
import org.sakaiproject.kernel.api.jcr.JCRConstants;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService;
import org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryServiceException;
import org.sakaiproject.kernel.api.rest.Documentable;
import org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider;
import org.sakaiproject.kernel.api.serialization.BeanConverter;
import org.sakaiproject.kernel.util.rest.RestDescription;
import org.sakaiproject.kernel.webapp.Initialisable;


import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.jcr.Node;
import javax.jcr.PathNotFoundException;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.ValueFormatException;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * 
 */
@Path("/image")
public class ImageProvider implements Documentable, JaxRsSingletonProvider,
		Initialisable {

	private Registry<String, JaxRsSingletonProvider> jaxRsSingletonRegistry;
	private BeanConverter beanConverter;
	private JCRNodeFactoryService jcrNodeFactoryService;

	private static final RestDescription REST_DOCS = new RestDescription();
	static {
		REST_DOCS.setTitle("Image Service");
		REST_DOCS
				.setShortDescription("The rest service to support image manipulation");
		REST_DOCS.addURLTemplate("/cropit",
				"Do a POST with a 'parameters' field that contains a json object. \n"
				+ " The json object should contain the following items: \n"
				+	" - urlImgtoCrop : The jcr path that contains the original image.\n"
				+	" - urlSaveIn : The jcr path to where the created images should be saved.\n"
				+	" - x : The topleft x coordinate.\n"
				+	" - y : The topleft y coordinate.\n"
				+	" - width : The width of the cropped image.\n"
				+	" - height : The height of the cropped image.\n"
				+	" - dimensions : An array containing all of the desired images.\n"
				+	"     - width : The width of the scaled & cropped image.\n"
				+	"     - height : The height of the scaled & cropped image.\n");

	}

	/**
   * 
   */
	@Inject
	public ImageProvider(JCRNodeFactoryService jcrNodeFactoryService,
			RegistryService registryService, BeanConverter beanConverter) {
		this.beanConverter = beanConverter;
		this.jcrNodeFactoryService = jcrNodeFactoryService;
		jaxRsSingletonRegistry = registryService.getRegistry(JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY);

		jaxRsSingletonRegistry.add(this);

	}

	@POST
	@Path("/cropit")
	@Produces(MediaType.TEXT_PLAIN)
	public String cropit(@FormParam("parameters") String parameters) throws JCRNodeFactoryServiceException, RepositoryException, IOException {
		if (parameters == null) {
			return "{\"response\" : \"ERROR: No parameters were entered.\"}";
		} else {
			// convert the JSON into a MAP

			InputStream in = null;
			ByteArrayOutputStream out = null;
			
			try {
			
				Map<String, Object> mapParameters = beanConverter.convertToMap(parameters);
				
	
				// get the parameters out of JSON
				int x = Integer.parseInt(mapParameters.get("x").toString());
				int y = Integer.parseInt(mapParameters.get("y").toString());
				int width = Integer.parseInt(mapParameters.get("width").toString());
				int height = Integer.parseInt(mapParameters.get("height").toString());
				String urlImgtoCrop = mapParameters.get("urlImgtoCrop").toString();
				String urlSaveIn = mapParameters.get("urlSaveIn").toString();
				Object[] dimensions = (Object[]) mapParameters.get("dimensions");
	
				String sType = "";
	
				String[] arrFile = urlImgtoCrop.split("/");
				String sImg = arrFile[arrFile.length - 1];
			
			

				Node nImgToCrop = jcrNodeFactoryService.getNode(urlImgtoCrop);
				
				if (nImgToCrop != null) {
				
					// get the MIME type of the image
					sType = getMimeTypeForNode(nImgToCrop, sImg);			
	
					// check if this is a valid image
					if (sType.equalsIgnoreCase("image/png")
							|| sType.equalsIgnoreCase("image/jpg")
							|| sType.equalsIgnoreCase("image/bmp")
							|| sType.equalsIgnoreCase("image/gif")
							|| sType.equalsIgnoreCase("image/jpeg")) {
						
						// Read the image
						in = jcrNodeFactoryService.getInputStream(urlImgtoCrop);
						BufferedImage img = ImageIO.read(in);
	
						// Cut the desired piece out of the image.
						BufferedImage subImage = img.getSubimage(x, y, width, height);
						
						String[] arrFiles = new String[dimensions.length];
	
						// Loop the dimensions and create and save an image for each one.
						for (int i = 0; i < dimensions.length; i++) {
	
							Object o = dimensions[i];
							String sDimension = beanConverter.convertToString(o);
	
							Map<String, Object> mapDimensions = beanConverter.convertToMap(sDimension);
							
							//	get dimension size
							int iWidth = Integer.parseInt(mapDimensions.get("width").toString());
							int iHeight = Integer.parseInt(mapDimensions.get("height").toString());
	
							// Create the image.
							out = scaleAndWriteToStream(iWidth, iHeight, subImage, sType, sImg);								
							
							String sPath = urlSaveIn + iWidth + "x" + iHeight + "_" + sImg;
							//	Save new image to JCR.
							SaveImageToJCR(sPath, sType, out);
							
							out.close();
							arrFiles[i] = sPath;
						}
						
						//	Output a JSON string.
						return generateResponse("OK", "files", arrFiles);
					} else {
						//	This is not a valid image.
						return generateResponse("ERROR", "message", "This is not a picture!");
					}
				}
				else {
					throw new NumberFormatException();
				}

			} 
			catch (NumberFormatException nfe) {
				return generateResponse("ERROR", "message", "Invalid parameters");
			}
			catch (Exception ex) {
				return generateResponse("ERROR", "message", ex.toString());
			}
			finally {
				//	close the streams
				if (in != null) in.close();
				if (out != null) out.close();
			}
		}
	}
	
	/**
	 * Generate a JSON response.
	 * @param response		ERROR or OK
	 * @param typeOfResponse The name of the extra tag you want to add. ex: message or files
	 * @param parameters	The object you wish to parse.
	 * @return
	 */
	public String generateResponse(String response, String typeOfResponse, Object parameters) {
		Map<String, Object> mapResponse = new HashMap<String, Object>();
		mapResponse.put("response", response);
		mapResponse.put(typeOfResponse,parameters);
		return beanConverter.convertToString(mapResponse);
	}
	

	/**
	 * Will save a stream of an image to the JCR.
	 * @param sPath		The JCR path to save the image in.
	 * @param sType		The Mime type of the node that will be saved.
	 * @param out		The stream you wish to save.
	 * @throws RepositoryException
	 * @throws JCRNodeFactoryServiceException
	 * @throws IOException
	 */
	public void SaveImageToJCR(String sPath, String sType, ByteArrayOutputStream out) throws RepositoryException, JCRNodeFactoryServiceException, IOException {
		// Save image into the jcr
		Node n = jcrNodeFactoryService.getNode(sPath);

		//	This node doesn't exist yet. Create and save it.
		if (n == null) {
			n = jcrNodeFactoryService.createFile(sPath, sType);
			n.getParent().save();
		}
		
		//	convert stream to inputstream
		ByteArrayInputStream bais = new ByteArrayInputStream(out.toByteArray());
		try {
			jcrNodeFactoryService.setInputStream(sPath, bais, sType);
			n.setProperty(JCRConstants.JCR_MIMETYPE, sType);
			n.save();
		} finally {
			bais.close();
		}
	}

	/**
	 * This method will scale an image to a desired width and height and shall output the stream of that scaled image.
	 * @param width			The desired width of the scaled image.
	 * @param height		The desired height of the scaled image.
	 * @param img			The image that you want to scale
	 * @param sType			The mime type of the image. 
	 * @param sImg			Filename of the image
	 * @return				Returns an outputstream of the scaled image.
	 * @throws IOException
	 */
	public ByteArrayOutputStream scaleAndWriteToStream(int width, int height, BufferedImage img, String sType, String sImg) throws IOException {
		ByteArrayOutputStream out = null;
		try {
			Image imgScaled = img.getScaledInstance(width, height, Image.SCALE_AREA_AVERAGING);
			
			Map<String, Integer> mapExtensionsToRGBType = new HashMap<String, Integer>();
			mapExtensionsToRGBType.put("image/jpg", BufferedImage.TYPE_INT_RGB);
			mapExtensionsToRGBType.put("image/jpeg", BufferedImage.TYPE_INT_RGB);
			mapExtensionsToRGBType.put("image/gif", BufferedImage.TYPE_INT_RGB);
			mapExtensionsToRGBType.put("image/png", BufferedImage.TYPE_INT_ARGB);
			mapExtensionsToRGBType.put("image/bmp", BufferedImage.TYPE_INT_RGB);
			
			Integer type = BufferedImage.TYPE_INT_RGB;
			if (mapExtensionsToRGBType.containsKey(sType)) {
				type = mapExtensionsToRGBType.get(sType);
			}
			
			BufferedImage biScaled = toBufferedImage(imgScaled, type);
			
	
			// Convert image to a stream
			out = new ByteArrayOutputStream();
			
			String sIOtype = sType.split("/")[1];
			
			//	If it's a gif try to write it as a jpg
			if (sType.equalsIgnoreCase("image/gif")) {
				sImg = sImg.replaceAll("\\.gif", ".jpg");
				sIOtype = "jpg";
			}
			
			
			ImageIO.write(biScaled, sIOtype, out);
		}
		finally {
			if (out != null) out.close();
		}
		
		return out;
	}

	/**
	 * Tries to fetch the mime type for a node. If the node lacks on, the mimetype will be determined via the extension.
	 * @param imgToCrop		Node of the image.
	 * @param sImg			Filename of the image.
	 * @return
	 * @throws PathNotFoundException
	 * @throws ValueFormatException
	 * @throws RepositoryException
	 */
	public String getMimeTypeForNode(Node imgToCrop, String sImg) throws PathNotFoundException, ValueFormatException, RepositoryException {
		String sType = "";
		
		//	Standard list of images we support.
		Map<String, String> mapExtensionsToMimes = new HashMap<String, String>();
		mapExtensionsToMimes.put("jpg", "image/jpeg");
		mapExtensionsToMimes.put("gif", "image/gif");
		mapExtensionsToMimes.put("png", "image/png");
		mapExtensionsToMimes.put("bmp", "image/bmp");
		
		
		
		//		check the MIME type out of JCR
		if (imgToCrop.hasProperty(JCRConstants.JCR_MIMETYPE)) {
			Property mimeTypeProperty = imgToCrop.getProperty(JCRConstants.JCR_MIMETYPE);
			if (mimeTypeProperty != null) {
				sType = mimeTypeProperty.getString();
			}
			
		}
		//	If we couldn't find it in the JCR we will check the extension
		if (sType.equals("")) {
			String ext = getExtension(sImg);
			if (mapExtensionsToMimes.containsKey(ext)) {
				sType = mapExtensionsToMimes.get(ext);
			}
			//	default = jpg
			else {
				sType = mapExtensionsToMimes.get("jpg");
			}
		}
		
		
		return sType;
	}

	/**
	 * Returns the extension of a filename.
	 * If no extension is found, the entire filename is returned.
	 * @param img
	 * @return
	 */
	public String getExtension(String img) {
		String[] arr = img.split("\\.");
		return arr[arr.length - 1];
	}

	/**
	 * Takes an Image and converts it to a BufferedImage.
	 * @param image		The image  you want to convert.
	 * @param type	The type of the image you want it to convert to. ex: BufferedImage.TYPE_INT_ARGB)
	 * @return
	 */
	public BufferedImage toBufferedImage(Image image, int type) {
		int w = image.getWidth(null);
		int h = image.getHeight(null);
		BufferedImage result = new BufferedImage(w, h, type);
		Graphics2D g = result.createGraphics();
		g.drawImage(image, 0, 0, null);
		g.dispose();
		return result;
	}

	
	
	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.rest.Documentable#getRestDocumentation()
	 */
	public RestDescription getRestDocumentation() {
		return REST_DOCS;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.rest.JaxRsSingletonProvider#getJaxRsSingleton()
	 */
	public Documentable getJaxRsSingleton() {
		return this;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.Provider#getKey()
	 */
	public String getKey() {
		return "image";
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.Provider#getPriority()
	 */
	public int getPriority() {
		return 0;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.webapp.Initialisable#destroy()
	 */
	public void destroy() {
		jaxRsSingletonRegistry.remove(this);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.webapp.Initialisable#init()
	 */
	public void init() {
	}
}
