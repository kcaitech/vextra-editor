:: 构建镜像并上传到仓库
@echo off
chcp 65001 > nul

set VERSION_TAG=%1
if "%VERSION_TAG%"=="" (
    set VERSION_TAG=latest
)

call npm i
call npm run build:web

docker build -t webapp:%VERSION_TAG% -f Dockerfile ../../
docker tag webapp:%VERSION_TAG% registry.protodesign.cn:36000/kcserver/webapp:%VERSION_TAG%
docker login registry.protodesign.cn:36000 -u admin -p Kcai1212
docker push registry.protodesign.cn:36000/kcserver/webapp:%VERSION_TAG%
