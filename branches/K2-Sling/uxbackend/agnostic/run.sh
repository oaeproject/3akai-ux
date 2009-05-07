#!/bin/sh
if [[ a$1 = 'aclean' ]]
then
  echo cleaning
  rm -rf apache-tomcat-5.5.26
  tar xzf ../../../tars/apache-tomcat-5.5.26.tar.gz
fi
cd apache-tomcat-5.5.26
unzip -o $HOME/.m2/repository/org/sakaiproject/kernel2/agnostic/assembly/0.1-SNAPSHOT/assembly-0.1-SNAPSHOT-kernel-loader.zip
# add in the kernel to the component locations already listed.

export SAKAI_KERNEL_PROPERTIES="inline://+core.component.locations=;$HOME/.m2/repository/org/sakaiproject/kernel2/agnostic/kernel/0.1-SNAPSHOT/kernel-0.1-SNAPSHOT.jar"
sh bin/catalina.sh run
