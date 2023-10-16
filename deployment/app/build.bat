:: 构建镜像并上传到仓库
@echo off
chcp 65001 > nul

set VERSION_TAG=%1
if "%VERSION_TAG%"=="" (
    set VERSION_TAG=latest
)

call npm run build:web

docker build -t webapp:%VERSION_TAG% -f Dockerfile ../../
docker tag webapp:%VERSION_TAG% docker-registry.protodesign.cn:35000/webapp:%VERSION_TAG%
docker login docker-registry.protodesign.cn:35000 -u kcai -p kcai1212
docker push docker-registry.protodesign.cn:35000/webapp:latest
