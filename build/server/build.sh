#! /bin/sh -
# project_dir
workdir=${project_dir:-`pwd`}

pushd .
cd ${workdir}

npm install
npm run build:server

docker build -f ./build/server/DockerFile -t sktest/server

popd