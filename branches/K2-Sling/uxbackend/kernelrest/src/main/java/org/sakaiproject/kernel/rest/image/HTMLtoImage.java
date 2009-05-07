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

import java.awt.Container;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Insets;
import java.awt.image.BufferedImage;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
 
import javax.swing.*;
import javax.swing.text.*;
import javax.swing.text.html.*;

public class HTMLtoImage {
	
	static class Kit extends HTMLEditorKit {
		/**
		 * 
		 */
		private static final long serialVersionUID = 1L;

		// Override createDefaultDocument to force synchronous loading
		public Document createDefaultDocument() {
			HTMLDocument doc = (HTMLDocument) super.createDefaultDocument();
			doc.setTokenThreshold(Integer.MAX_VALUE);
			doc.setAsynchronousLoadPriority(-1);
			return doc;
		}
	}
	
	public static BufferedImage create(String src, int width, int height) {
		BufferedImage image = null;
		JEditorPane pane = new JEditorPane();
		Kit kit = new Kit();
		pane.setEditorKit(kit);
		pane.setEditable(false);
		pane.setMargin(new Insets(0,0,0,0));
		try {
			pane.setPage(src);
			image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
			Graphics g = image.createGraphics();
			Container c = new Container();
			SwingUtilities.paintComponent(g, pane, c, 0, 0, width, height);
			g.dispose();
		} catch (Exception e) {
			System.out.println(e);
		}
		return image;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	public static volatile boolean loaded;
	
	public static BufferedImage createImage(URL url) throws IOException {
		/*
		 * First, get the contents of the HTML file
		 */
		StringBuilder sb = new StringBuilder();
		BufferedReader reader = new BufferedReader(new InputStreamReader(
			(InputStream) url
				.getContent(new Class<?>[] { InputStream.class })));
		try {
		    String line = null;
		    {
			while ((line = reader.readLine()) != null) {
			    sb.append(line);
			    sb.append('\n');
			}
		    }
		} finally {
		    reader.close();
		}
		

		System.out.println("Read everything to stringbuilder.");
		
		/*
		 * Setup a JEditorPane
		 */
		JEditorPane editorPane = new JEditorPane();
        editorPane.addPropertyChangeListener(new PropertyChangeListener() {
            public void propertyChange(PropertyChangeEvent evt) {
                if (evt.getPropertyName().equals("page")) {
                    loaded = true;
                }
            }
        });
        editorPane.setPage(url);
        editorPane.validate();
        editorPane.repaint();
        while (!loaded) {
            Thread.yield();
        }

		System.out.println("created JEditorPane - " + editorPane.getWidth() + " : " + editorPane.getHeight());
		
		/*
		 * Create a BufferedImage
		 */
		/*
		Dimension prefSize = editorPane.getPreferredSize();
        System.out.println("prefSize = " + prefSize);
        BufferedImage img = new BufferedImage(prefSize.width + 1, prefSize.height + 1, BufferedImage.TYPE_INT_ARGB);
        Graphics graphics = img.getGraphics();
        editorPane.setSize(prefSize);
        editorPane.paint(graphics);
        
        System.out.println("created image");
        
        //	dispose of unused objects.
		graphics.dispose();
		*/
		
		
		BufferedImage img = new BufferedImage(editorPane.getWidth(), editorPane
				.getHeight(), BufferedImage.TYPE_INT_ARGB);
		Graphics2D g = img.createGraphics();
		
		JPanel container = new JPanel();
		SwingUtilities.paintComponent(g, editorPane, container, 0, 0, img.getWidth(), img.getHeight());
		g.dispose();
		container = null;
		

		
		editorPane = null;
		return img;
	 }
}
