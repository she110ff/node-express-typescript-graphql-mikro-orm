# boa-space-backend

## Set Environment file

```
# 임시 파일 저장 디렉토리 생성
mkdir temp_image

# 환경변수 파일 생성
cp ./src/.env.example ./src/.env
```

## Run Server locally

```
# 데이터베이스를 다시 생성허며 실행
yarn start:refresh

# 기존 데이버베이스 및 데이터를 유지하며 실행
yarn start
```


## Apollo GraphQL Explorer

```
# local
http://localhost:4001/graphql

```


## Initialize Database and Deploy
1. Remove migrations - Only Local
   : migration files in the source folder

2. Create migration - Only Local
```
npx mikro-orm migration:create --initial
```
3. Delete data from migration table

4. Drop schema
```
# local
ts-node drop-schema

# dev
ts-node drop-schema-dev/test/prod
```
5. Deploy and Re-run server


## Migrate up from diff
1. Create migration
```
npx mikro-orm migration:create
```

2. Deploy and Re-run server for up

## Migrate down - Only Test
1. migration down one step
```
npx mikro-orm migration:down
```

2. Deploy and Re-run server for up



## REST API - V1
```
a. Test 사이트에서 사용자 등록 및 API Key 요청 - 게임사
https://testnet.boaspace.io/

b. Test 사이트에서 아이템 생성 - 게임사

c. 등록된 사용자에게 API client Key 발급 - BoaSpace

d. API Playground 확인 - 게임사
https://api.dev.boaspace.io/api-docs

e. API 를 호출하여 사용 - 게임사
```


## Docker CMD
```

docker ps -a

docker images

docker system info

docker exec -it boa-space-backend sh

docker run -it bosagora/boa-space-backend:dev sh

docker logs boa-space-backend

docker logs --tail 30 -f  boa-space-backend

docker rm -vf $(docker ps -aq)

docker rmi -f $(docker images -aq)
```

