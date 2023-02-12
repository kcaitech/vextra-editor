#! /bin/sh -
# project_dir
workdir=${project_dir:-`pwd`}

pushd .
cd ${workdir}

# clean
rm -rf dist_server

npm install
npm run build:server

# cp package*.json dist_server/
# mv node_modules dist_server/

{   # 生成精简的node_modules
    pushd .
    cd build/server
    # 需要在server目录提前install，生成好package-lock文件
    # npm ci
    npm i
    mv node_modules ${workdir}/dist_server
    popd
}

docker build -f ./build/server/DockerFile -t sktest/server ./dist_server

# mv dist_server/node_modules ./
popd