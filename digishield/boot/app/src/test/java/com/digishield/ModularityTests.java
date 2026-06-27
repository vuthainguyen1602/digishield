package com.digishield;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

/**
 * Verifies the Spring Modulith structure of the application:
 * <ul>
 *   <li>{@code verify()} enforces module boundaries / allowed dependencies.</li>
 *   <li>{@code writeDocumentation()} renders PlantUML / C4 docs into
 *       {@code build/spring-modulith-docs}.</li>
 * </ul>
 */
class ModularityTests {

    private final ApplicationModules modules =
            ApplicationModules.of(DigishieldApplication.class);

    @Test
    void verifiesModularStructure() {
        modules.verify();
    }

    @Test
    void writesDocumentation() {
        new Documenter(modules)
                .writeDocumentation()
                .writeIndividualModulesAsPlantUml();
    }
}
