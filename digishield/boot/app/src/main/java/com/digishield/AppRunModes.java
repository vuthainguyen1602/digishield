package com.digishield;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Declares the three run modes of the single deployable artifact. The same
 * boot jar is started with a different Spring profile depending on the role it
 * should play in the deployment topology:
 *
 * <ul>
 *   <li>{@code api}       - serves HTTP traffic (REST controllers, actuator).</li>
 *   <li>{@code worker}    - consumes events / messages, runs background work.</li>
 *   <li>{@code scheduler} - owns @Scheduled jobs (cron, periodic tasks).</li>
 * </ul>
 *
 * The bodies are intentionally empty: this class only illustrates how run
 * modes are toggled by profile. Each module contributes its own beans guarded
 * by the appropriate profile.
 */
public final class AppRunModes {

    private AppRunModes() {
    }

    /**
     * API mode - online request/response handling.
     */
    @Configuration
    @Profile("api")
    static class ApiMode {
    }

    /**
     * Worker mode - enables event/message listeners and async processing.
     */
    @Configuration
    @Profile("worker")
    static class WorkerMode {
    }

    /**
     * Scheduler mode - enables Spring scheduling so cron/periodic jobs run.
     */
    @Configuration
    @Profile("scheduler")
    @EnableScheduling
    static class SchedulerMode {
    }
}
