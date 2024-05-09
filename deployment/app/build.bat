:: 构建镜像并上传到仓库
@echo off
chcp 65001 > nul

set VERSION_TAG=%1
if "%VERSION_TAG%"=="" (
    set VERSION_TAG=latest
)

set MODE=%2
:: 设置NPM_CMD变量，MODE为空或MODE=prod时NPM_CMD=build:web，MODE=test时NPM_CMD=build:web-dev
if "%MODE%"=="" (
    set NPM_CMD=build:web
) else (
    if "%MODE%"=="prod" (
        set NPM_CMD=build:web
    ) else (
        if "%MODE%"=="test" (
            set NPM_CMD=build:web-dev
        )
    )
)

call npm i
call npm run %NPM_CMD%

docker build -t webapp:%VERSION_TAG% -f Dockerfile ../../
docker tag webapp:%VERSION_TAG% registry.protodesign.cn:36000/kcserver/webapp:%VERSION_TAG%
docker login registry.protodesign.cn:36000 -u admin -p Kcai1212
docker push registry.protodesign.cn:36000/kcserver/webapp:%VERSION_TAG%
