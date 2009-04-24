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
package org.sakaiproject.kernel.jcr.jackrabbit.persistance;

import java.io.File;

import org.apache.jackrabbit.core.fs.local.LocalFileSystem;
import org.apache.jackrabbit.core.persistence.PMContext;
import org.apache.jackrabbit.core.persistence.bundle.MSSqlPersistenceManager;

public class MSSqlSharedPersistenceManager  extends MSSqlPersistenceManager{
	private String sharedLocation;
	private boolean useSharedFsBlobStore;

	/**
	 * Creates a blob store that is based on a local fs. This is called by init
	 * if {@link #useLocalFsBlobStore()} returns <code>true</code>.
	 *
	 * If {@link #useSharedFsBlobStore} is <code>true</code>, then the store will be in a
	 * shared location.
	 *
	 * @param context
	 *            the persistence manager context
	 * @return a blob store
	 * @throws Exception
	 *             if an error occurs.
	 */
	@Override
	protected CloseableBLOBStore createLocalFSBlobStore(PMContext context)
			throws Exception {
		/**
		 * store blob's in local file system in a sub directory of the workspace
		 * home directory
		 *
		 */
		File baseLocation = context.getHomeDir();
		if ( useSharedFsBlobStore ) {
			baseLocation = new File(sharedLocation);
		}
		LocalFileSystem blobFS = new LocalFileSystem();
		blobFS.setRoot(new File(baseLocation, "blobs"));
		blobFS.init();
		return new FSBlobStore(blobFS);
	}

	public String getSharedLocation() {
		return sharedLocation;
	}

	public void setSharedLocation(String sharedLocation) {
		this.sharedLocation = sharedLocation;
	}

	public boolean isUseSharedFsBlobStore() {
		return useSharedFsBlobStore;
	}

	public void setUseSharedFsBlobStore(boolean useSharedFsBlobStore) {
		this.useSharedFsBlobStore = useSharedFsBlobStore;
	}

}
