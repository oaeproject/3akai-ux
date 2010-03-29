3akai-ux - Sakai 3 UX/UI development
====================================


Essential Information
---------------------

The main form of communication for the project is the UX email list. Here both technical and design related topics are discussed:  
[sakai-ux@collab.sakaiproject.org](sakai-ux@collab.sakaiproject.org)

We track bugs, issues and tasks in JIRA:  
[http://jira.sakaiproject.org/browse/SAKIII](http://jira.sakaiproject.org/browse/SAKIII)

A collection of resources and documents can be found on our Confluence page:  
[http://confluence.sakaiproject.org/display/3AK/Sakai+3+Home](http://confluence.sakaiproject.org/display/3AK/Sakai+3+Home)

Most time Sakai 3 UX/UI developers can be found on IRC:  
server: irc.freenode.net  
room: #sakai

General information about Sakai:  
[http://sakaiproject.org](http://sakaiproject.org)

If you would like to contribute to this project, feel free to fork this git repository, push your changes and send a pull request.


Quickstart
----------

To get a Sakai 3 development instance up and running on your cmputer quickly follow these steps:  

First make sure you have all the following installed on your machine:  
[Git version control system](http://git-scm.com/)  
[Java JDK 1.5 or newer](http://java.sun.com/javase/downloads/index.jsp)  
[Maven build system](http://maven.apache.org/)  

Then you can set up an instance with the following Terminal commands on a Unix/Mac:  

1. Create a "sakai3" folder in your home folder:  
`mkdir ~/sakai3`
`cd ~/sakai3`

2. Check which stable tags are available:  
`git tag`

3. Check out and switch to the latest stable tag (0.4 in this case):  
`git co 0.4`
`git co -b 0.4`

4. Check out the latest Nakamura code. This will create an "open-experiments" folder  
`git clone git://github.com/ieb/open-experiments.git`
`cd open-experiments/slingtests/osgikernel`


5. Build the kernel:  
`mvn clean install`

6. Start the kernel:  
`tools/clean_restart.sh`

7. Open a browser and type "http://localhost:8080/dev" into the address bar  

Done. Now you have a the latest stable kernel with latest UX code running on your local machine.


If you would like to do UI/UX development you will need to additionally to the following:

1 Switch to the previously created "sakai3" folder in your home folder  
`cd ~/sakai3`

2. Check out the UX code from Github, this will create a "3akai-ux" folder:  
`git clone git@github.com:oszkarnagy/3akai-ux.git`

3. Go to the kernel's Felix console by typing the following address into the browser's address bar:  
"http://localhost:8080/system/console"

4. Log in using "admin" for username and password

5. Select the "Configuration" tab on the top part of the console

6. Open up the "Apache Sling Filesystem Resource Provider" module`s window (towards bottom of page)

7. Enter "/dev" in Provider Root field, enter the path to the "dev" folder in you checked out UX code to "Filesystem Root" field , and click "Save"

9. Open up the "Apache Sling Filesystem Resource Provider" again

10. Enter "/devwidgets" in Provider Root field, enter the path to the "devwidgets" folder in you checked out UX code to "Filesystem Root" field , and click "Save"

Done. Now if you go to "http://localhost:8080/dev" the kernel should load the files from your local machine, from the paths you`ve specified earlier.  
You should be able to start modifying files and see changes in browser.


Development Guidelines
----------------------

You can find our guidelines and more information about the project on our Confluence page:  
[http://confluence.sakaiproject.org/display/3AK/Sakai+3+UX+Development+Guidelines+and+Information](http://confluence.sakaiproject.org/display/3AK/Sakai+3+UX+Development+Guidelines+and+Information).

Getting started guide:  
[http://confluence.sakaiproject.org/display/3AK/Sakai+3+UX+Prototype+development](http://confluence.sakaiproject.org/display/3AK/Sakai+3+UX+Prototype+development)


Demo Servers
------------

Stable demo server:  
[http://3akai.sakaiproject.org/dev/](http://3akai.sakaiproject.org/dev/)

Unstable nightly server:  
[http://sakai3-nightly.uits.indiana.edu:8080/dev/index.html](http://sakai3-nightly.uits.indiana.edu:8080/dev/index.html)

Prototype server:  
[http://sakai3sam.caret.cam.ac.uk/dev/index.html](http://sakai3sam.caret.cam.ac.uk/dev/index.html)


Nakamura: Sakai 3 kernel
------------------------

Nakamura is the kernel project for Sakai 3  

The Nakamura source code can be found in Github:  
[http://github.com/ieb/open-experiments](http://github.com/ieb/open-experiments)

Discussion and information on various kernel topics can be found in the following Google group:  
[http://groups.google.com/group/sakai-kernel](http://groups.google.com/group/sakai-kernel)

Documentation for Nakamura can be found here:  
[http://confluence.sakaiproject.org/display/KERNDOC/Nakamura+Documentation](http://confluence.sakaiproject.org/display/KERNDOC/Nakamura+Documentation)

They track bugs and issues in JIRA here:  
[http://jira.sakaiproject.org/browse/KERN](http://jira.sakaiproject.org/browse/KERN)
