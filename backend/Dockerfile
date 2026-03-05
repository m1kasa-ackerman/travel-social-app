# Build stage — Eclipse Temurin 21 JDK
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy pom.xml first for layer caching (dependencies won't redownload unless pom changes)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests -q

# ---- Runtime stage — minimal JRE only ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S wandrly && adduser -S wandrly -G wandrly
USER wandrly

# Copy built jar from builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]
