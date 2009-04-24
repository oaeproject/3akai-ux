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

import org.sakaiproject.kernel.rest.image.HTMLtoImage;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.StreamingOutput;

import java.net.MalformedURLException;

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
		REST_DOCS.addURLTemplate("/urlpreview", 
				"This will generate a PNG image out of a url website. \n"
				+	" Add a url=<yoururl> in the querystring to add a url."
				
		);

	}

	/**
   * 
   */
	@Inject
	public ImageProvider(JCRNodeFactoryService jcrNodeFactoryService,
			RegistryService registryService, BeanConverter beanConverter) {
		this.beanConverter = beanConverter;
		this.jcrNodeFactoryService = jcrNodeFactoryService;
		jaxRsSingletonRegistry = registryService
				.getRegistry(JaxRsSingletonProvider.JAXRS_SINGLETON_REGISTRY);

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
			Map<String, Object> mapParameters = beanConverter
					.convertToMap(parameters);

			// get the parameters out of JSON
			int x = Integer.parseInt(mapParameters.get("x").toString());
			int y = Integer.parseInt(mapParameters.get("y").toString());
			int width = Integer.parseInt(mapParameters.get("width").toString());
			int height = Integer.parseInt(mapParameters.get("height")
					.toString());
			String urlImgtoCrop = mapParameters.get("urlImgtoCrop").toString();
			String urlSaveIn = mapParameters.get("urlSaveIn").toString();
			Object[] dimensions = (Object[]) mapParameters.get("dimensions");

			String s = "";
			String sType = "";

			String[] arrFile = urlImgtoCrop.split("/");
			String sImg = arrFile[arrFile.length - 1];
   
			InputStream in = null;

			try {

				Node nImgToCrop = jcrNodeFactoryService.getNode(urlImgtoCrop);
				// get the MIME type of the image

				
				System.err.println("got node");
				
				//	check the MIME type out of JCR
				if (nImgToCrop.hasProperty(JCRConstants.JCR_MIMETYPE)) {
					System.err.println("it has property mimetype");
					Property mimeTypeProperty = nImgToCrop
							.getProperty(JCRConstants.JCR_MIMETYPE);
					System.err.println("retrieved mimetype");
					if (mimeTypeProperty != null) {
						sType = mimeTypeProperty.getString();
						System.err.println("mimetype is not null");
					}
					else {
						sType = "image/" + getMimeViaExtension(sImg);
					}
				}
				else {
					sType = "image/" + getMimeViaExtension(sImg);
				}
			

				System.err.println("mime type of image - " + sType);

				// check if this is a valid image
				if (sType.equalsIgnoreCase("image/png")
						|| sType.equalsIgnoreCase("image/jpg")
						|| sType.equalsIgnoreCase("image/bmp")
						|| sType.equalsIgnoreCase("image/gif")
						|| sType.equalsIgnoreCase("image/jpeg")) {
					
					// Get the filename
					System.err.println("file - " + sImg + "type: " + sType.split("/")[1]);

					// Read the image
					in = jcrNodeFactoryService.getInputStream(urlImgtoCrop);
					BufferedImage img = ImageIO.read(in);
					in.close();

					System.err.println("image read: ");

					// Cut the desired piece out of the image.
					BufferedImage subImage = img.getSubimage(x, y, width, height);
					System.err.println("subimage created: height of subimage = " + subImage.getHeight());

					
					String[] arrFiles = new String[dimensions.length];

					// Loop the dimensions and create and save an image for each
					// one.
					for (int i = 0; i < dimensions.length; i++) {

						Object o = dimensions[i];
						String sDimension = beanConverter.convertToString(o);

						Map<String, Object> mapDimensions = beanConverter.convertToMap(sDimension);

						
						//	get dimension size
						int iWidth = Integer.parseInt(mapDimensions.get("width").toString());
						int iHeight = Integer.parseInt(mapDimensions.get("height").toString());

						// Create the image.
						Image imgScaled = subImage.getScaledInstance(iWidth, iHeight, Image.SCALE_AREA_AVERAGING);
						BufferedImage biScaled = toBufferedImage(imgScaled, BufferedImage.TYPE_INT_RGB);
						

						System.err.println("image created");

						// Convert image to a stream
						ByteArrayOutputStream out = new ByteArrayOutputStream();
						
						String sIOtype = sType.split("/")[1];
						//	If it's a gif try to write it as a jpg
						if (sType.equalsIgnoreCase("image/gif")) {
							sImg = sImg.replaceAll("\\.gif", ".jpg");
							sIOtype = "jpg";
						}


						ImageIO.write(biScaled, sIOtype, out);
						
						out.close();
						System.err.println("stream written " + sImg + " iotype: " + sIOtype);

						
						String sPath = urlSaveIn + iWidth + "x" + iHeight + "_" + sImg;
						
						// Save image into the jcr
						Node n = jcrNodeFactoryService.getNode(sPath);

						if (n == null) {
							n = jcrNodeFactoryService.createFile(sPath, sType);
							n.getParent().save();
							System.out.println("new node saved: " + sPath);
						}
						
						ByteArrayInputStream bais = new ByteArrayInputStream(out.toByteArray());
						
						jcrNodeFactoryService.setInputStream(sPath, bais, sType);
						n.setProperty(JCRConstants.JCR_MIMETYPE, sType);
						n.save();
						bais.close();
						

						arrFiles[i] = sPath;

					}
					
					s += "{\"response\" : \"OK\", \"files\" : " + beanConverter.convertToString(arrFiles) + "}";


				} else {
					s = "{\"response\" : \"ERROR: This is not a picture.\"}";
				}

			} catch (Exception ex) {
				return "{\"response\" : \"ERROR: " + ex.getMessage() + "\"}";
			} finally {
				if (in != null){
					in.close();
				}	
			}
			
			return s;
		}

	}

	
	private String getMimeViaExtension(String img) {
		String[] arr = img.split("\\.");
		if (arr.length > 1) {
			return arr[1];
		}
		else {
			return "";
		}
	}

	public static BufferedImage toBufferedImage(Image image, int type) {
		int w = image.getWidth(null);
		int h = image.getHeight(null);
		BufferedImage result = new BufferedImage(w, h, type);
		Graphics2D g = result.createGraphics();
		g.drawImage(image, 0, 0, null);
		g.dispose();
		return result;
	}

	
	@GET
	@Path("/urlpreview")
	@Produces("image/png")
	public StreamingOutput urlpreview(@QueryParam("url") String sUrl) throws MalformedURLException, IOException {

		System.out.println("urlpreview");
		System.out.println("---------------------------");
		//URL url = new URL(sUrl);
		//	Feed an URL to it.
		//final BufferedImage bufImage = HTMLtoImage.createImage(url);
		final BufferedImage bufImage = HTMLtoImage.create(sUrl, 640, 480);
		
		//Image img = Toolkit.getDefaultToolkit().createImage(bufImage.getSource());
		
		return new StreamingOutput() {

			public void write(OutputStream output) throws IOException,
					WebApplicationException {
				ImageIO.write(bufImage, "png", output);				
			}
			
		};
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