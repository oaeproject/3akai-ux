#/bin/sh
if [ $# -lt 1 ] ; then
  echo "Usage: $0 <version number>"
  echo "Don't include -SNAPSHOT."
  exit 0
fi
set -o nounset
set -o errexit
cversion=$1
nversion=$2

function simple_replace {
    sed "s/$cversion-SNAPSHOT/$nversion/g" $1 > $1.new
    restore $1
}

function artifact_version_replace {
    perl -pi.bak -e "undef $/; s/($1<\/artifactId>\n\s+<version)>$cversion-SNAPSHOT/\$1>$nversion/" $2
    rm $2.bak
    git add $2
}

function restore {
    mv $1.new $1
    git add $1
}

echo "Moving config files from $cversion-SNAPSHOT to $cversion"
simple_replace build.xml
artifact_version_replace org.sakaiproject.nakamura.hashfiles pom-bundle.xml

git commit -m "release_pre_process: Moving config files from $cversion-SNAPSHOT to $nversion"