:: 构建镜像并上传到仓库
@echo off
chcp 65001 > nul

<<<<<<< HEAD
set VERSION_TAG=%1
if "%VERSION_TAG%"=="" (
    set VERSION_TAG=latest
)

docker build -t webapp:%VERSION_TAG% -f Dockerfile ../../
docker tag webapp:%VERSION_TAG% docker-registry.protodesign.cn:35000/webapp:%VERSION_TAG%
docker login docker-registry.protodesign.cn:35000 -u kcai -p kcai1212
docker push docker-registry.protodesign.cn:35000/webapp:%VERSION_TAG%
=======
docker build -t webapp:latest -f Dockerfile ../../
docker tag webapp:latest docker-registry.protodesign.cn:35000/webapp:latest
docker login docker-registry.protodesign.cn:35000 -u kcai -p kcai1212
docker push docker-registry.protodesign.cn:35000/webapp:latest
>>>>>>> b93af47e20411dd70c70f38b28ac09a2ebbce99c
