#! /bin/sh -
workdir=${project_dir:-`pwd`}

pushd .
cd ${workdir}

npm install
npm run build:web

docker build -f ./deploy/build/client/DockerFile -t sktest/client ./dist

popd