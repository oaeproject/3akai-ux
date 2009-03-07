/**
 * $Id$
 * $URL$
 * CourseDataEntityProvider.java - UXdataFeeds - Aug 26, 2008 5:00:27 PM - azeckoski
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.sakaiproject.component.api.ServerConfigurationService;
import org.sakaiproject.component.cover.ComponentManager;
import org.sakaiproject.coursemanagement.api.AcademicSession;
import org.sakaiproject.coursemanagement.api.CourseManagementService;
import org.sakaiproject.coursemanagement.api.CourseOffering;
import org.sakaiproject.coursemanagement.api.CourseSet;
import org.sakaiproject.coursemanagement.api.Section;
import org.sakaiproject.entitybroker.EntityReference;
import org.sakaiproject.entitybroker.EntityView;
import org.sakaiproject.entitybroker.entityprovider.annotations.EntityCustomAction;
import org.sakaiproject.entitybroker.entityprovider.capabilities.ActionsExecutable;
import org.sakaiproject.entitybroker.entityprovider.capabilities.Describeable;
import org.sakaiproject.entitybroker.entityprovider.capabilities.Outputable;
import org.sakaiproject.entitybroker.entityprovider.extension.ActionReturn;
import org.sakaiproject.entitybroker.entityprovider.extension.EntityData;
import org.sakaiproject.entitybroker.entityprovider.extension.Formats;
import org.sakaiproject.entitybroker.util.AbstractEntityProvider;


/**
 * This entity provider is specially made to provider data about the course management system
 * 
 * @author Aaron Zeckoski (azeckoski @ gmail.com)
 */
public class CourseDataEntityProvider extends AbstractEntityProvider implements Outputable, ActionsExecutable, Describeable {

    public static String PREFIX = "course-data";
    public String getEntityPrefix() {
        return PREFIX;
    }

    private ServerConfigurationService serverConfigurationService;
    public void setServerConfigurationService(ServerConfigurationService serverConfigurationService) {
        this.serverConfigurationService = serverConfigurationService;
    }

    @EntityCustomAction(action="terms",viewKey=EntityView.VIEW_LIST)
    public Object getTerms(Map<String, Object> params) {
        List<Holder> l = getCourseTerms();
        if (params.containsKey("testing")) {
            l.clear();
            l.add( new Holder("T1","Term1","term") );
            l.add( new Holder("T2","Term2","term") );
        }
        // NOTE: this wrapper (EntityData) is optional, you can just return the list or to avoid any post processing, wrap the object in an ActionReturn
        // Example of wrapping: return new ActionReturn(l);
        // Example of just returning: return l;
        EntityData ed = new EntityData(new EntityReference(PREFIX, "terms"), "terms", l);
        return ed;
    }

    @EntityCustomAction(action="subjects",viewKey=EntityView.VIEW_LIST)
    public Object getSubjects(Map<String, Object> params) {
        List<Holder> l = getCourseSubjects();
        if (params.containsKey("testing")) {
            l.clear();
            l.add( new Holder("S1","Subject1","subject") );
            l.add( new Holder("S2","Subject2","subject") );
            l.add( new Holder("S3","Subject3","subject") );
        }
        EntityData ed = new EntityData(new EntityReference(PREFIX, "subjects"), "subjects", l);
        return ed;
    }

    @EntityCustomAction(action="courses",viewKey=EntityView.VIEW_LIST)
    public Object getCourses(Map<String, Object> params) {
        if (!params.containsKey("subjectId") || !params.containsKey("termId")) {
            throw new IllegalArgumentException("Must include the 'subjectId' and the 'termId' when attempting to retrieve a list of courses");
        }
        String subjectId = (String) params.get("subjectId");
        String termId = (String) params.get("termId");
        List<Holder> l = getCourseCourses(subjectId, termId);
        if (params.containsKey("testing")) {
            l.clear();
            l.add( new Holder("C1","Course1","course") );
            l.add( new Holder("C2","Course2","course") );
            l.add( new Holder("C3","Course3","course") );
            l.add( new Holder("C4","Course4","course") );
        }
        EntityData ed = new EntityData(new EntityReference(PREFIX, "courses"), "courses", l);
        return ed;
    }

    @EntityCustomAction(action="sections",viewKey=EntityView.VIEW_LIST)
    public Object getSections(Map<String, Object> params) {
        if (!params.containsKey("courseId")) {
            throw new IllegalArgumentException("Must include the 'courseId' when attempting to retrieve a list of sections");
        }
        String courseId = (String) params.get("courseId");
        List<Holder> l = getCourseSections(courseId);
        if (params.containsKey("testing")) {
            l.clear();
            l.add( new Holder("Sec1","Section1","section") );
            l.add( new Holder("Sec2","Section2","section") );
            l.add( new Holder("Sec3","Section3","section") );
            l.add( new Holder("Sec4","Section4","section") );
            l.add( new Holder("Sec5","Section5","section") );
        }
        EntityData ed = new EntityData(new EntityReference(PREFIX, "sections"), "sections", l);
        return ed;
    }

    public String[] getHandledOutputFormats() {
        return new String[] {Formats.HTML, Formats.XML, Formats.JSON};
    }


    // INTERNAL methods for getting the course data

    private List<Holder> getCourseTerms() {
        ArrayList<Holder> terms = new ArrayList<Holder>();
        if (getCMS() != null) {
            List<AcademicSession> acadsesss = getCMS().getAcademicSessions();
            for (AcademicSession academicSession : acadsesss) {
                String id = academicSession.getEid();
                String title = academicSession.getTitle();
                terms.add( new Holder(id, title, "term") );
            }
        }
        // this should stay in the retrieved order
        // Collections.sort(terms, new Holder.TitleComparator());
        return terms;
    }

    private List<Holder> getCourseSubjects() {
        ArrayList<Holder> subjects = new ArrayList<Holder>();
        if (getCMS() != null) {
            String subjectCategory = serverConfigurationService.getString("site-manage.cms.subject.category");
            if (subjectCategory != null) {
                List<CourseSet> courseSets = getCMS().findCourseSets(subjectCategory);
                for (CourseSet courseSet : courseSets) {
                    String id = courseSet.getEid();
                    String title = courseSet.getTitle();
                    subjects.add( new Holder(id, title, "subject") );
                }
            }
        }
        Collections.sort(subjects, new Holder.TitleComparator());
        return subjects;
    }

    private List<Holder> getCourseCourses(String subjectId, String termId) {
        ArrayList<Holder> courses = new ArrayList<Holder>();
        if (getCMS() != null) {
            if (subjectId != null && termId != null) {
                Set<CourseOffering> offerings = getCMS().getCourseOfferingsInCourseSet(subjectId);
                for (CourseOffering courseOffering : offerings) {
                    // limit by term? (why is this done here instead of in the subjects?)
                    AcademicSession as = courseOffering.getAcademicSession();
                    if (as != null && as.getEid().equals(termId)) {
                        String id = courseOffering.getEid();
                        String title = courseOffering.getTitle();
                        courses.add( new Holder(id, title, "course") );
                    }
                }
            }
        }
        Collections.sort(courses, new Holder.TitleComparator());
        return courses;
    }

    private List<Holder> getCourseSections(String courseId) {
        ArrayList<Holder> sections = new ArrayList<Holder>();
        if (getCMS() != null) {
            if (courseId != null 
                    && courseId.length() > 0) {
                Set<Section> s = getCMS().getSections(courseId);
                for (Section section : s) {
                    String id = section.getEid();
                    String title = section.getTitle();
                    sections.add( new Holder(id, title, "section") );
                }
            }
        }
        Collections.sort(sections, new Holder.TitleComparator());
        return sections;
    }


    // this is a little wacky but it lets us get the CMS if it is around or not get it otherwise without doing lots of attempts
    boolean attemptLookup = false;
    CourseManagementService cms = null;
    protected CourseManagementService getCMS() {
        if (!attemptLookup && cms == null) {
            cms = (CourseManagementService) ComponentManager.get(CourseManagementService.class);
            attemptLookup = true;
        }
        return cms;
    }

}
