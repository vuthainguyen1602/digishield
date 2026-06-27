plugins {
    id("digishield.spring-module-conventions")
}

dependencies {
    // spring-web needed for OncePerRequestFilter / servlet API.
    api("org.springframework:spring-web")
    implementation("jakarta.servlet:jakarta.servlet-api")
}
