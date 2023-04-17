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

## Entity RelationShip

OneToMany ———————————————————— AssetCollection - Asset

User - AssetCollection

User(creator) - Asset

ManyToMany ———————————————————— AssetCollection - Asset

## Apollo GraphQL Explorer

```
# local
http://localhost:4000/graphql

```