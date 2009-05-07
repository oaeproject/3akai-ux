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
package org.sakaiproject.kernel.api;

/**
 * 
 */
public class ClassLoaderMisconfigurationException extends RuntimeException {

  /**
   * @param service
   * @param myClass
   */
  public ClassLoaderMisconfigurationException(Class<?> remoteClass,
      Class<?> kernelClass) {
    super(createMessage(remoteClass, kernelClass));
  }

  /**
   * @param remoteClass
   * @param kernelClass
   * @return
   */
  private static String createMessage(Class<?> remoteClass, Class<?> kernelClass) {
    StringBuilder message = new StringBuilder();
    message
        .append("Classloader Misconfiguration: The Client Classloader is not connected to the kernel\n");
    message
        .append("\thence the classes you will be loading for the service interfaces\n");
    message
        .append("\twill not be the same classes that the kernel is using for the service interfaces\n");
    message
        .append("\tyou will either get ClassCastExcetions that make no sense, or you will not be able\n");
    message
        .append("\tto retrieve the services. I would recommend that you get this fixed before anything else\n");
    message
        .append("\tas it *will* drive you slowly mad. Components must be loaded by a ComponentClassLoader using the \n");
    message
        .append("\tcomponent bootstrap mechanism, and webapps must be loaded in the webapp container with a modified \n");
    message
        .append("\twebapp lifecycle. The classloaders dont have to be the same, but they should have a common parent, the shared classloader\n");
    message.append("\tYour Class is:").append(
        remoteClass.getName()).append("\n");
    message.append("\tThe Service is:").append(
        kernelClass.getName()).append("\n");
    message.append("\tYour Classloader is:").append(
        remoteClass.getClassLoader()).append("\n");
    message.append("\tThe Service Classloader is:").append(
        kernelClass.getClassLoader()).append("\n");
    message.append("\tAlso check that the service API you are loading has been exported");
    
    return message.toString();
  }

  /**
   * 
   */
  private static final long serialVersionUID = 4582337612391443737L;

}
