package com.digishield.shared.messaging;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Implementation of {@link EventPublisher} based on Spring's
 * {@link ApplicationEventPublisher}. Combined with Spring Modulith to relay
 * cross-module events (can be upgraded to a publication registry/outbox later).
 */
@Component
public class SpringEventPublisher implements EventPublisher {

    private final ApplicationEventPublisher delegate;

    public SpringEventPublisher(ApplicationEventPublisher delegate) {
        this.delegate = delegate;
    }

    @Override
    public void publish(Object event) {
        delegate.publishEvent(event);
    }
}
