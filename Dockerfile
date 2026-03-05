# Build stage — Eclipse Temurin 21 JDK + Maven
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Install Maven via apk (no wrapper needed)
RUN apk add --no-cache maven

# Copy pom.xml first for dependency layer caching
COPY backend/pom.xml .

# Download dependencies offline
RUN mvn dependency:go-offline -q

# Copy source and build
COPY backend/src ./src
RUN mvn clean package -DskipTests -q

# ---- Runtime stage — minimal JRE only ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S wandrly && adduser -S wandrly -G wandrly
USER wandrly

# Copy built JAR from builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-8080} -jar app.jar"]
