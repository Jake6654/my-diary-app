# 1단계: 빌드
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# 컨텍스트 루트 기준이므로 모두 backend/ 를 붙여야 함
COPY backend/gradle ./gradle
COPY backend/build.gradle backend/settings.gradle backend/gradlew backend/gradlew.bat ./
COPY backend/src ./src

RUN ./gradlew bootJar -x test

# 2단계: 런타임
FROM eclipse-temurin:21-jre

WORKDIR /app

# 위 build 단계에서 만든 jar 복사
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
