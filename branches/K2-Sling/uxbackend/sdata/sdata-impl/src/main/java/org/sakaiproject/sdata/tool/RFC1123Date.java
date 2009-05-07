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


package org.sakaiproject.sdata.tool;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * An implentation of RFC1123 Data parsing and formatting
 * 
 * @author ieb
 */
public class RFC1123Date
{

	private static final Date DEFAULT_TWO_DIGIT_YEAR_START;

	static
	{
		Calendar calendar = Calendar.getInstance();
		calendar.set(2000, Calendar.JANUARY, 1, 0, 0);
		DEFAULT_TWO_DIGIT_YEAR_START = calendar.getTime();
	}

	private static final TimeZone GMT = TimeZone.getTimeZone("GMT");

	/**
	 * Date format pattern used to parse HTTP date headers in RFC 1123 format.
	 */
	public static final String PATTERN_RFC1123 = "EEE, dd MMM yyyy HHmmss zzz";

	/**
	 * Parse a RFC1123 Formatted date
	 * 
	 * @param dateValue
	 * @return
	 * @throws ParseException
	 */
	public static Date parseDate(String dateValue) throws ParseException
	{

		if (dateValue == null)
		{
			throw new IllegalArgumentException("dateValue is null");
		}
		Date startDate = DEFAULT_TWO_DIGIT_YEAR_START;
		// trim single quotes around date if present
		// see issue #5279
		if (dateValue.length() > 1 && dateValue.startsWith("'")
				&& dateValue.endsWith("'"))
		{
			dateValue = dateValue.substring(1, dateValue.length() - 1);
		}

		SimpleDateFormat dateParser = null;
		dateParser = new SimpleDateFormat(PATTERN_RFC1123, Locale.US);
		dateParser.setTimeZone(TimeZone.getTimeZone("GMT"));
		dateParser.set2DigitYearStart(startDate);
		return dateParser.parse(dateValue);
	}

	/**
	 * Format a RFC1123 formatted date and output as a string
	 * 
	 * @param date
	 * @return
	 */
	public static String formatDate(Date date)
	{
		if (date == null) throw new IllegalArgumentException("date is null");

		SimpleDateFormat formatter = new SimpleDateFormat(PATTERN_RFC1123, Locale.US);
		formatter.setTimeZone(GMT);
		return formatter.format(date);
	}

}
