package com.digishield.ai.application;

import com.digishield.ai.domain.Difficulty;

/**
 * Output of {@link AiClient#generate}: the generated template content the
 * service persists as an {@code AiTemplate} draft.
 *
 * @param subject    subject / hook line
 * @param bodyRef    reference key for the rendered body
 * @param difficulty difficulty level
 */
public record GeneratedTemplate(String subject, String bodyRef, Difficulty difficulty) {
}
