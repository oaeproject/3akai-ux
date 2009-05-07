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

package org.sakaiproject.kernel.api.jcr.support;

import java.io.InputStream;

import javax.jcr.Node;
import javax.jcr.RepositoryException;

/**
 * The JCRNodeFactoryService provides simplified content methods to deal with
 * File and Folders.
 */
public interface JCRNodeFactoryService {

  /**
   * Create a file with the supplied path, and return the Node that represents
   * the file. If the path to the file does not exist, it will be created. The
   * patch must be a valid JCR file patch and must not end in /. If the file
   * exists that file will be returned.
   *
   * @param filePath
   *          the path to the file
   * @param mimeType the mime types to use.
   * @return the jcr node representing the file
   * @throws NodeFactoryServiceException
   */
  Node createFile(String filePath, String mimeType) throws JCRNodeFactoryServiceException;

  /**
   * Create a Folder with the supplied name. If the path to the folder does not
   * exist it will be created. The path must be a valid JCR path. If it ends in
   * / the / will be removed before the requested folder is created If the
   * folder alread exists, that node will be returned.
   *
   * @param id
   * @return
   * @throws JCRNodeFactoryServiceException
   */
  Node createFolder(String folderPath) throws JCRNodeFactoryServiceException;

  /**
   * Set the input stream associated with new content for the file specified by
   * the file path. The node on which the input stream has been set is returned.
   * When that node is saved, by the calling code, the stream will be read and
   * streamed into the content of the file inside the JCR. If the node does not
   * exist it will be created.
   *
   * @param filePath the path to the file.
   * @param inputStream the input stream that is the content of the file.
   * @param mimeType the mimeType to use if the file does not exist.
   * @throws NodeFactoryServiceException
   * @throws RepositoryException
   */
  Node setInputStream(String filePath, InputStream inputStream, String mimeType)
      throws JCRNodeFactoryServiceException, RepositoryException;

  /**
   * Get an output stream for the content of a file, that can be read
   *
   * @param the
   *          filePath
   * @return
   * @throws RepositoryException
   * @throws NodeFactoryServiceException
   */
  InputStream getInputStream(String id) throws RepositoryException,
      JCRNodeFactoryServiceException;

  /**
   * Get the node at the given path, if it does not exist, a
   * JCRNodeFactoryService exception will be thrown
   *
   * @param nodePath
   * @return the node at the requested location
   * @throws RepositoryException
   * @throws NodeFactoryServiceException
   */
  Node getNode(String nodePath) throws RepositoryException,
      JCRNodeFactoryServiceException;

  /**
   * Set the owner of the a node.
   * 
   * @param userPrivatePath
   * @param uuid
   * @throws JCRNodeFactoryServiceException
   * @throws RepositoryException
   */
  void setOwner(String path, String uuid) throws RepositoryException,
      JCRNodeFactoryServiceException;
}
