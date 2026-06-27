plugins {
    id("digishield.spring-module-conventions")
}

dependencies {
    api("org.springframework.boot:spring-boot-starter-actuator")
    api("io.micrometer:micrometer-registry-prometheus")

    // Servlet API needed for the MDC filter's OncePerRequestFilter.
    api("org.springframework:spring-web")
    implementation("jakarta.servlet:jakarta.servlet-api")
}
