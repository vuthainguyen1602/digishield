plugins {
    // Aggregates JaCoCo coverage data from every subproject into one report.
    `jacoco-report-aggregation`
}

allprojects {
    group = "com.digishield"
    version = "0.1.0-SNAPSHOT"

    repositories {
        mavenCentral()
    }
}

// ---------------------------------------------------------------------------
// Aggregated coverage report across all subprojects.
//
//   ./gradlew testCodeCoverageReport
//
// Output (HTML): build/reports/jacoco/testCodeCoverageReport/html/index.html
// Output (XML) : build/reports/jacoco/testCodeCoverageReport/testCodeCoverageReport.xml
// ---------------------------------------------------------------------------
dependencies {
    jacocoAggregation(project(":boot:app"))
    jacocoAggregation(project(":contracts"))

    jacocoAggregation(project(":shared:persistence"))
    jacocoAggregation(project(":shared:tenant-context"))
    jacocoAggregation(project(":shared:messaging"))
    jacocoAggregation(project(":shared:security"))
    jacocoAggregation(project(":shared:observability"))

    jacocoAggregation(project(":modules:auth"))
    jacocoAggregation(project(":modules:tenancy"))
    jacocoAggregation(project(":modules:learning"))
    jacocoAggregation(project(":modules:simulation"))
    jacocoAggregation(project(":modules:reporting"))
    jacocoAggregation(project(":modules:analytics"))
    jacocoAggregation(project(":modules:notification"))
    jacocoAggregation(project(":modules:ai"))
    jacocoAggregation(project(":modules:interception"))
}
