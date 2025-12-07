# 1단계: Gradle로 Spring Boot JAR 빌드
FROM gradle:8.10.1-jdk21 AS build
WORKDIR /app

# Gradle 설정 파일들 복사
COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle ./gradle

COPY src ./src

RUN ./gradlew bootJar -x test

# 2단계: 실제 런타임 이미지 (JRE만)
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
