plugins {
    id("digishield.spring-module-conventions")
}

dependencies {
    // Contracts need the ApplicationEvent API / spring-context, NOT JPA.
    api("org.springframework:spring-context")
}
