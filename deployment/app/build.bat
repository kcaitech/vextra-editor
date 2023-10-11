:: 构建镜像并上传到仓库
@echo off
chcp 65001 > nul

docker build -t webapp:latest -f Dockerfile ../../
docker tag webapp:latest docker-registry.protodesign.cn:35000/webapp:latest
docker login docker-registry.protodesign.cn:35000 -u kcai -p kcai1212
docker push docker-registry.protodesign.cn:35000/webapp:latest
