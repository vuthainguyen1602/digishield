package com.digishield.shared.messaging;

/**
 * Abstraction for publishing domain events between modules.
 * Business modules depend on this interface instead of depending directly
 * on Spring's infrastructure.
 */
public interface EventPublisher {

    /**
     * Publishes an event to the registered listeners.
     *
     * @param event the event object (typically a record in the contracts.events package)
     */
    void publish(Object event);
}
