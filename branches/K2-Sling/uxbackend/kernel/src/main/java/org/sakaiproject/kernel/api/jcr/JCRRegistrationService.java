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

package org.sakaiproject.kernel.api.jcr;

import java.io.InputStream;

/**
 * This allows other projects outside the Sakai JCR Package to add nodetypes in
 * the backing implementations xml format, as well as register additional
 * namespaces.
 *
 */
public interface JCRRegistrationService
{

	/**
	 * Register node types using an XML input stream
	 * @param xml
	 */
	public void registerNodetypes(InputStream xml);

	/**
	 * Register a namespace.
	 * You should register all namespaces in your input stream prior to
	 * registering the node types
	 * @param prefix
	 * @param url
	 */
	public void registerNamespace(String prefix, String url);

}
