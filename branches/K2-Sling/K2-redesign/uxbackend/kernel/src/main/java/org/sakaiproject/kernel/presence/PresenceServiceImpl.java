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
package org.sakaiproject.kernel.presence;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.inject.Inject;

import org.apache.commons.lang.StringUtils;
import org.sakaiproject.kernel.api.memory.Cache;
import org.sakaiproject.kernel.api.memory.CacheManagerService;
import org.sakaiproject.kernel.api.memory.CacheScope;
import org.sakaiproject.kernel.api.presence.PresenceService;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of the presence service that uses replicated cache.
 */
public class PresenceServiceImpl implements PresenceService {

	private static final String LOCATION_CACHE = "presence.location";
	private static final String USER_STATUS_CACHE = "presence.status";
	private static final long PRESENCE_TTL = 5L * 60L * 1000L; // 5 minutes
	// private static final int USER_ELEMENT = 0;
	private static final int TIMESTAMP_ELEMENT = 1;
	private static final int LOCATION_ELEMENT = 2;
	private static final int STATUS_ELEMENT = 3;
	private static final int STATUS_SIZE = 4;
	private Cache<String> userStatusCache;
	private Cache<Map<String, String>> locationCache;

	/**
   *
   */
	@Inject
	public PresenceServiceImpl(CacheManagerService cacheManagerService) {
		// the caches must be replicating in the cluster.
		locationCache = cacheManagerService.getCache(LOCATION_CACHE,
				CacheScope.CLUSTERREPLICATED);
		userStatusCache = cacheManagerService.getCache(USER_STATUS_CACHE,
				CacheScope.CLUSTERREPLICATED);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.presence.PresenceService#setStatus(java.lang.String,
	 *      java.lang.String)
	 */
	public void setStatus(String uuid, String status) {
		updateLocationCache(uuid, getTimeStamp(), null, status);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.presence.PresenceService#getStatus(java.lang.String)
	 */
	public String getStatus(String uuid) {
		String[] currentStatus = getCurrentStatus(uuid);
		if (currentStatus != null) {
			if (currentStatus.length > STATUS_ELEMENT) {
				return currentStatus[STATUS_ELEMENT];
			} else {
				return "online";
			}
		}
		return "offline";
	}

	private String[] getCurrentStatus(String uuid) {
		String currentStatus = userStatusCache.get(uuid);
		long timeout = getTimeStamp() - PRESENCE_TTL;
		// load the current status or the defaults.
		if (currentStatus != null) {
			String[] locationStatus = StringUtils.split(currentStatus, ":",
					STATUS_SIZE);
			if (locationStatus != null
					&& locationStatus.length > TIMESTAMP_ELEMENT) {
				// timed out ?
				long lastTs = Long.parseLong(locationStatus[TIMESTAMP_ELEMENT]);
				if (lastTs > timeout) {
					return locationStatus;
				}
			}
		}
		return null;
	}
	
	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.presence.PresenceService#setChatStatus(java.lang.String,
	 *      java.lang.String)
	 */
	public void setChatStatus(String userId, String status) {
		// TODO Auto-generated method stub

	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.presence.PresenceService#online(java.lang.String,
	 *      java.util.List)
	 */
	public Map<String, String> online(List<String> connections) {

		Map<String, String> online = Maps.newHashMap();
		for (String uuid : connections) {

			online.put(uuid, getStatus(uuid));
		}
		return online;
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.presence.PresenceService#online(java.lang.String)
	 */
	public Map<String, String> online(String location) {
		Map<String, String> locationInstanceCache = locationCache.get(location);
		if (locationInstanceCache != null) {
			Map<String, String> onlineMap = Maps.newHashMap();
			for (Entry<String, String> e : locationInstanceCache.entrySet()) {
				String[] currentStatus = getCurrentStatus(e.getKey());
				if (currentStatus != null
						&& location.equals(currentStatus[LOCATION_ELEMENT])) {
					onlineMap.put(e.getKey(), currentStatus[STATUS_ELEMENT]);
				}
			}
			return onlineMap;
		}
		return ImmutableMap.of();
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see org.sakaiproject.kernel.api.presence.PresenceService#ping(java.lang.String,
	 *      java.lang.String)
	 */
	public void ping(String uuid, String location) {
		long now = getTimeStamp();
		if (StringUtils.isEmpty(location)) {
			location = "none";
		}
		if (StringUtils.isEmpty(uuid)) {
			uuid = "none";
		}
		if (updateLocationCache(uuid, now, location, null)) {
			// need to update
			if (!"none".equals(location)) {
				Map<String, String> locationInstanceCache = locationCache
						.get(location);
				if (locationInstanceCache == null) {
					synchronized (locationCache) {
						locationInstanceCache = locationCache.get(location);
						if (locationInstanceCache == null) {
							locationInstanceCache = new ConcurrentHashMap<String, String>();
							locationCache.put(location, locationInstanceCache);
						}
					}
				}

				String userKey = getLocationKey(uuid, location);
				if (!locationInstanceCache.containsKey(uuid)) {
					locationInstanceCache.put(uuid, userKey);
				}
			}
		}
	}

	/**
	 * @return
	 */
	private long getTimeStamp() {
		long now = System.currentTimeMillis();
		// make now slow changing, 20s resolution
		return now / 20000;
	}

	/**
	 * Update the users location cache.
	 * 
	 * @param uuid
	 *            the user id
	 * @param now
	 *            the timestamp
	 * @param location
	 *            the location, null if not provided in this update
	 * @param status
	 *            the status, null if not provided in this update
	 * @return true if an update was performed.
	 */
	private boolean updateLocationCache(String uuid, long now, String location,
			String status) {
		String currentStatus = userStatusCache.get(uuid);
		// load the current status or the defaults.
		String[] locationStatus = new String[] { uuid, String.valueOf(now - 1),
				"none", "online" };
		if (currentStatus != null) {
			locationStatus = StringUtils.split(currentStatus, ":", STATUS_SIZE);

		}
		// compare with non null current versions.
		String[] ls = new String[] { uuid, String.valueOf(now), location,
				status };
		boolean update = false;
		if (locationStatus != null) {
			for (int i = 0; i < locationStatus.length; i++) {
				if (ls[i] != null) {
					if (!locationStatus[i].equals(ls[i])) {
						update = true;
					}
				}
			}
		}

		if (update) {
			// set any null values to what they were previously
			if (locationStatus != null) {
				for (int i = 0; i < locationStatus.length; i++) {
					if (ls[i] == null) {
						ls[i] = locationStatus[i];
					}
				}
			}
			String newStatus = ':' + StringUtils.join(ls, ':');
			if (!newStatus.equals(currentStatus)) {
				userStatusCache.put(uuid, newStatus);
			} else {
				update = false;
			}
		}
		return update;
	}

	/**
	 * @param uuid
	 * @param location
	 * @return
	 */
	private String getLocationKey(String uuid, String location) {
		return uuid + ":" + location;
	}

}
