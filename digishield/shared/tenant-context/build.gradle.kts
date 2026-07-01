plugins {
    id("digishield.spring-module-conventions")
}

dependencies {
    // spring-web needed for OncePerRequestFilter / servlet API.
    api("org.springframework:spring-web")
    implementation("jakarta.servlet:jakarta.servlet-api")
    // Read the tenant from the validated JWT (resource-server) in production.
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
}
