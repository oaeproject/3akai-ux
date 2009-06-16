echo on

set CATALINA_HOME=%cd%\target\runtime

set SAKAI_KERNEL_PROPERTIES=%cd%\localkernel.properties

"%cd%\target\runtime\bin\catalina.bat" %1
