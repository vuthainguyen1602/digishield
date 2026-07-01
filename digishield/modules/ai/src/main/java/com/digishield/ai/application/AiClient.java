package com.digishield.ai.application;

import com.digishield.ai.api.dto.ClassificationView;
import com.digishield.ai.api.dto.ModerationView;
import com.digishield.ai.domain.TemplateChannel;

/**
 * Internal abstraction over the "AI" behaviour (classification, moderation and
 * template generation). Two implementations exist:
 * <ul>
 *   <li>{@code StubAiClient} — deterministic, dependency-free demo logic (default).</li>
 *   <li>{@code ClaudeAiClient} — real Anthropic Claude calls, enabled via
 *       {@code digishield.ai.claude.enabled=true} and registered {@code @Primary}.</li>
 * </ul>
 */
public interface AiClient {

    /** Classifies reported content as clean / spam / threat with a confidence. */
    ClassificationView classify(String payload);

    /** Moderates AI-generated content and returns a verdict with reasons. */
    ModerationView moderate(String content);

    /** Generates a simulation-template draft (subject + body reference + difficulty). */
    GeneratedTemplate generate(TemplateChannel channel, String industry, String season);
}
