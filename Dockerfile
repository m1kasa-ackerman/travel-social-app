# Build stage — Eclipse Temurin 21 JDK
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy maven wrapper & pom first for layer caching
COPY backend/pom.xml .
COPY backend/.mvn .mvn
COPY backend/mvnw mvnw
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -q

# Copy source and build
COPY backend/src ./src
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
  "-jar", "app.jar"]
