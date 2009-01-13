/**
 * $Id$
 * $URL$
 * Holder.java - UXdataFeeds - Aug 26, 2008 11:53:45 PM - azeckoski
 **************************************************************************
 * Copyright (c) 2008 Aaron Zeckoski
 * Licensed under the Apache License, Version 2.0
 * 
 * A copy of the Apache License has been included in this 
 * distribution and is available at: http://www.apache.org/licenses/LICENSE-2.0.txt
 *
 * Aaron Zeckoski (azeckoski @ gmail.com) (aaronz @ vt.edu) (aaron @ caret.cam.ac.uk)
 */

package org.sakaiproject.ux.entityproviders;

import java.util.Comparator;

/**
 * Simple class to hold the results
 * 
 * @author Aaron Zeckoski (azeckoski @ gmail.com)
 */
public class Holder {

    public String id;
    public String title;
    public String type = "UNKNOWN";

    public Holder(String id, String title) {
        if (id == null) {
            throw new IllegalArgumentException("id cannot be null");
        }
        this.id = id;
        this.title = title;
    }
    public Holder(String id, String title, String type) {
        this(id, title);
        this.type = type;
    }

    public static class TitleComparator implements Comparator<Holder> {
        public int compare(Holder o1, Holder o2) {
            if (o1.title != null && o2.title != null) {
                return o1.title.compareTo(o2.title);
            }
            return o1.id.compareTo(o2.id);
        }
    }

}
