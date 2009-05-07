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

package org.sakaiproject.kernel.rest.messages;

import java.util.Comparator;

import net.sf.json.JSONObject;

public class MessageComparator implements Comparator<JSONObject> {

	private String field;

	public int compare(JSONObject o1, JSONObject o2) {
		if (getField().equals("to")) {
			String s1 = o1.getJSONObject("userTo").getJSONObject("profile").getString("firstName") + " "
			 			+ o1.getJSONObject("userTo").getJSONObject("profile").getString("lastName");

			String s2 = o2.getJSONObject("userTo").getJSONObject("profile").getString("firstName") + " "
			 			+ o2.getJSONObject("userTo").getJSONObject("profile").getString("lastName");
			return compareStrings(s1, s2);
		}
		else if (getField().equals("from")) {
			String s1 = o1.getJSONObject("userFrom").getJSONObject("profile").getString("firstName") + " "
 						+ o1.getJSONObject("userFrom").getJSONObject("profile").getString("lastName");

			String s2 = o2.getJSONObject("userFrom").getJSONObject("profile").getString("firstName") + " "
 						+ o2.getJSONObject("userFrom").getJSONObject("profile").getString("lastName");

			return compareStrings(s1, s2);
		}
		else {
			String s1 = o1.getString(getField());
			String s2 = o2.getString(getField());
			
			return compareStrings(s1, s2);
		}
	}
	
	
	private int compareStrings(String s1, String s2) {
		return s1.compareTo(s2);
	}
	

	/**
	 * @param field the field to set
	 */
	public void setField(String field) {
		this.field = field;
	}

	/**
	 * @return the field
	 */
	public  String getField() {
		return field;
	}
	

}
