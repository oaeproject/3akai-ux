#/bin/sh
if [ $# -lt 2 ] ; then
  echo "Usage: $0 <current version number> <next version number>"
  echo "Don't include -SNAPSHOT."
  exit 0
fi
set -o nounset
set -o errexit
cversion=$1
nversion=$2

function simple_replace {
    sed "s/$cversion/$nversion-SNAPSHOT/g" $1 > $1.new
    restore $1
}

function artifact_version_replace {
    perl -pi.bak -e "undef $/; s/($1<\/artifactId>\n\s+<version)>$cversion/\$1>$nversion-SNAPSHOT/" $2
    rm $2.bak
    git add $2
}

function restore {
    mv $1.new $1
    git add $1
}

echo "Moving config files from $cversion to $nversion-SNAPSHOT"
simple_replace build.xml
artifact_version_replace org.sakaiproject.nakamura.hashfiles pom-bundle.xml

git commit -m "release_post_process: Moving config files from $cversion to $nversion-SNAPSHOT"
