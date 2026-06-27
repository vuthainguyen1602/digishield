plugins {
    id("digishield.spring-module-conventions")
}

dependencies {
    api("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("org.postgresql:postgresql")

    // Tenant context used by the RLS aspect.
    implementation(project(":shared:tenant-context"))
}
