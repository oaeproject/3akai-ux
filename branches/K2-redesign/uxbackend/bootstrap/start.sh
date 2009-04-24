#!/bin/sh 

if [ -n "$CATALINA_HOME" ]
then
  echo "CATALINA_HOME is set, removing it ..."
  unset CATALINA_HOME
fi

if [ "${SAKAI_KERNEL_PROPERTIES}" = "" ] 
then
  export SAKAI_KERNEL_PROPERTIES=`pwd`/localkernel.properties
fi
echo "SAKAI_KERNEL_PROPERTIES is set to $SAKAI_KERNEL_PROPERTIES"

#  for YourKit export JAVA_OPTS="-server -Dcom.sun.management.jmxremote  -Djava.awt.headless=true -agentlib:yjpagent "



target/runtime/bin/catalina.sh $*
