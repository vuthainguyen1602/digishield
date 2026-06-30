package com.digishield.simulation.it;

import static org.assertj.core.api.Assertions.assertThat;

import com.digishield.contracts.events.UserClickedSimulationEvent;
import com.digishield.shared.tenantcontext.TenantContext;
import com.digishield.simulation.api.SimulationService;
import com.digishield.simulation.domain.Channel;
import com.digishield.simulation.domain.SimAction;
import com.digishield.simulation.domain.SimCampaign;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.ActiveProfiles;

/**
 * Spring Modulith slice test for the {@code simulation} module.
 *
 * <p>{@link ApplicationModuleTest} bootstraps only the simulation module (plus
 * the shared infrastructure it depends on) and stubs out the rest of the system.
 * We then verify the module's contract with the outside world: recording a
 * {@link SimAction#CLICK} must publish a {@link UserClickedSimulationEvent} so
 * downstream modules (learning, analytics, ...) can react.
 *
 * <p>The module persists a {@code SimEvent} via JPA, so a real PostgreSQL is
 * provided by Testcontainers. Hibernate creates the schema for the slice
 * ({@code ddl-auto=create-drop}) since Flyway is disabled here.
 *
 * <p>Requires Docker and JDK 25.
 */
@ApplicationModuleTest(module = "simulation")
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect",
        "spring.datasource.driver-class-name=org.postgresql.Driver",
        // The resource-server starter (pulled in transitively via shared:security)
        // is on the test classpath, so in this MOCK web slice Spring Boot would
        // auto-configure an OAuth2 resource-server SecurityFilterChain that needs a
        // JwtDecoder. The real one lives in shared:security's SecurityConfig, which
        // a single-module slice does not scan — so exclude that auto-config here.
        // (The full-context @SpringBootTest ITs keep it.)
        "spring.autoconfigure.exclude="
                + "org.springframework.boot.security.oauth2.server.resource.autoconfigure.OAuth2ResourceServerAutoConfiguration,"
                + "org.springframework.boot.security.oauth2.server.resource.autoconfigure.web.OAuth2ResourceServerWebSecurityAutoConfiguration"
})
@ActiveProfiles("dev")
class SimulationModuleIT {

    private static final String TENANT = "33333333-3333-3333-3333-333333333333";

    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        POSTGRES.start();
    }

    @org.springframework.boot.test.context.TestConfiguration
    static class TestEventConfig {
        @org.springframework.context.annotation.Bean
        public TestEventListener testEventListener() {
            return new TestEventListener();
        }
    }

    static class TestEventListener {
        private final java.util.List<Object> events = new java.util.concurrent.CopyOnWriteArrayList<>();

        @org.springframework.context.event.EventListener
        public void onEvent(Object event) {
            events.add(event);
        }

        public void clear() {
            events.clear();
        }

        public <T> java.util.List<T> ofType(Class<T> type) {
            return events.stream()
                    .filter(type::isInstance)
                    .map(type::cast)
                    .toList();
        }
    }

    @Autowired
    private SimulationService simulationService;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private com.digishield.shared.messaging.EventPublisher eventPublisher;

    // The composition-root adapters (com.digishield.AuthRecipientResolver /
    // AuthUserDirectory) live in the application base package, so they leak into
    // every module slice and require an AuthService bean — which the auth module
    // is not part of this simulation slice. Mock it so the context can start.
    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private com.digishield.auth.api.AuthService authService;

    @Autowired
    private org.springframework.context.ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    private TestEventListener testEventListener;

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @org.junit.jupiter.api.BeforeEach
    void setUpMockPublisher() {
        testEventListener.clear();
        org.mockito.Mockito.doAnswer(invocation -> {
            Object event = invocation.getArgument(0);
            applicationEventPublisher.publishEvent(event);
            return null;
        }).when(eventPublisher).publish(org.mockito.Mockito.any());
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    /**
     * Recording a CLICK event publishes exactly one UserClickedSimulationEvent
     * carrying the current tenant, user and campaign.
     */
    @Test
    void recordingClickPublishesUserClickedEvent() {
        TenantContext.set(TENANT);

        UUID userId = UUID.randomUUID();
        SimCampaign campaign = simulationService.createCampaign(Channel.EMAIL, null);

        simulationService.recordEvent(campaign.getId(), userId, SimAction.CLICK);

        var published = testEventListener.ofType(UserClickedSimulationEvent.class);
        assertThat(published).hasSize(1);

        UserClickedSimulationEvent event = published.iterator().next();
        assertThat(event.tenantId().toString()).isEqualTo(TENANT);
        assertThat(event.userId()).isEqualTo(userId);
        assertThat(event.campaignId()).isEqualTo(campaign.getId());
    }

    /**
     * Non-CLICK actions (e.g. DELIVERED) must NOT emit the click event.
     */
    @Test
    void recordingNonClickPublishesNoEvent() {
        TenantContext.set(TENANT);

        SimCampaign campaign = simulationService.createCampaign(Channel.SMS, null);
        simulationService.recordEvent(campaign.getId(), UUID.randomUUID(), SimAction.DELIVERED);

        assertThat(testEventListener.ofType(UserClickedSimulationEvent.class)).isEmpty();
    }
}
