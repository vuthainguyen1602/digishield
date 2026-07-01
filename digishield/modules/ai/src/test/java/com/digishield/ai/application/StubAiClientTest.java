package com.digishield.ai.application;

import com.digishield.ai.api.dto.ClassificationView;
import com.digishield.ai.api.dto.ModerationView;
import com.digishield.ai.domain.TemplateChannel;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the deterministic {@link StubAiClient} (no Spring, no DB).
 */
class StubAiClientTest {

    private final StubAiClient client = new StubAiClient();

    @Test
    void classify_flagsThreatSignals() {
        ClassificationView result = client.classify("Please verify your account and enter your password");

        assertThat(result.label()).isEqualTo("threat");
        assertThat(result.confidence()).isBetween(0.0, 1.0);
        assertThat(result.reason()).isNotBlank();
    }

    @Test
    void classify_returnsCleanForBenignContent() {
        assertThat(client.classify("Hello, see you at the team lunch tomorrow.").label()).isEqualTo("clean");
    }

    @Test
    void moderate_passesSafeContent() {
        ModerationView result = client.moderate("hello world");

        assertThat(result.verdict()).isEqualTo("pass");
        assertThat(result.reasons()).isEmpty();
    }

    @Test
    void moderate_blocksContentWithMultipleUnsafeWords() {
        ModerationView result = client.moderate("this ransomware can exploit your system");

        assertThat(result.verdict()).isEqualTo("block");
        assertThat(result.reasons()).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    void generate_buildsSubjectBodyRefAndDifficulty() {
        GeneratedTemplate t = client.generate(TemplateChannel.EMAIL, "banking", "summer");

        assertThat(t.subject()).contains("banking");
        assertThat(t.bodyRef()).startsWith("tmpl/email/");
        assertThat(t.difficulty()).isNotNull();
    }
}
