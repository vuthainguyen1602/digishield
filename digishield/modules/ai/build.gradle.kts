plugins {
    id("digishield.spring-module-conventions")
}

dependencies {
    // Shared contracts between modules (events, dtos).
    implementation(project(":contracts"))

    // Shared infrastructure library.
    implementation(project(":shared:tenant-context"))

    // Anthropic Claude SDK — only used by ClaudeAiClient, which is active when
    // digishield.ai.claude.enabled=true (otherwise the deterministic stub runs).
    implementation("com.anthropic:anthropic-java:2.34.0")
}
