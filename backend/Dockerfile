# 1단계: Gradle로 Spring Boot JAR 빌드
FROM gradle:8.8-jdk-21 AS build
WORKDIR /app

# Gradle 설정 파일들 복사
COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle ./gradle

# 소스 코드 복사
COPY src ./src

# 테스트는 건너뛰고 bootJar 빌드
RUN ./gradlew bootJar -x test

# 2단계: 실제 런타임 이미지 (JRE만)
FROM eclipse-temurin:21-jre
WORKDIR /app

# 빌드된 JAR 복사
COPY --from=build /app/build/libs/*.jar app.jar

# Render가 PORT 환경변수를 넣어줌 (application.yml에 ${PORT:8080} 있는 상태)
ENV PORT=8080
EXPOSE 8080

# Spring Boot 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
