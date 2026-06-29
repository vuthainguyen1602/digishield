package com.digishield.ai.application;

import com.digishield.ai.api.dto.AidaRunView;
import com.digishield.ai.api.dto.ClassificationView;
import com.digishield.ai.api.dto.ModerationView;
import com.digishield.ai.api.dto.SimTemplateView;
import com.digishield.ai.domain.AidaRun;
import com.digishield.ai.domain.AiTemplate;
import com.digishield.ai.domain.Difficulty;
import com.digishield.ai.domain.TemplateChannel;
import com.digishield.ai.domain.TemplateStatus;
import com.digishield.ai.infrastructure.AidaRunRepository;
import com.digishield.ai.infrastructure.AiTemplateRepository;
import com.digishield.shared.tenantcontext.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link AiServiceImpl}.
 * <p>
 * The implementation uses deterministic, dependency-free stubs (the real LLM
 * calls are marked TODO). Pure Mockito unit tests: no Spring context, no DB.
 */
@ExtendWith(MockitoExtension.class)
class AiServiceImplTest {

    private static final UUID TENANT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Mock
    private AiTemplateRepository templateRepository;

    @Mock
    private AidaRunRepository aidaRunRepository;

    @InjectMocks
    private AiServiceImpl aiService;

    @BeforeEach
    void setUp() {
        TenantContext.set(TENANT_ID.toString());
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void generateTemplate_persistsDraftAndReturnsSimTemplateShape() {
        // Arrange
        when(templateRepository.save(any(AiTemplate.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        SimTemplateView view = aiService.generateTemplate(TemplateChannel.EMAIL, "banking", "summer");

        // Assert
        assertThat(view).isNotNull();
        assertThat(view.id()).isNotNull();
        assertThat(view.channel()).isEqualTo("email");
        assertThat(view.subject()).contains("banking");
        assertThat(view.bodyRef()).isNotBlank();
        assertThat(view.difficulty()).isIn("easy", "medium", "hard");
        assertThat(view.status()).isEqualTo("draft");
        verify(templateRepository).save(any(AiTemplate.class));
    }

    @Test
    void listTemplates_returnsTenantTemplatesAsLowercaseViews() {
        // Arrange
        AiTemplate t = new AiTemplate(
                UUID.randomUUID(), TENANT_ID, TemplateChannel.SMS, "Thông báo",
                "tmpl/sms/x", Difficulty.EASY, TemplateStatus.APPROVED);
        when(templateRepository.findByTenantId(TENANT_ID)).thenReturn(List.of(t));

        // Act
        List<SimTemplateView> views = aiService.listTemplates();

        // Assert: enum-backed fields emitted as lowercase, mapped per tenant
        assertThat(views).hasSize(1);
        SimTemplateView v = views.get(0);
        assertThat(v.channel()).isEqualTo("sms");
        assertThat(v.difficulty()).isEqualTo("easy");
        assertThat(v.status()).isEqualTo("approved");
        assertThat(v.subject()).isEqualTo("Thông báo");
    }

    @Test
    void classify_flagsThreatSignals() {
        // Act
        ClassificationView result = aiService.classify("Please verify your account and enter your password");

        // Assert
        assertThat(result.label()).isEqualTo("threat");
        assertThat(result.confidence()).isBetween(0.0, 1.0);
        assertThat(result.reason()).isNotBlank();
    }

    @Test
    void classify_returnsCleanForBenignContent() {
        // Act
        ClassificationView result = aiService.classify("Hello, see you at the team lunch tomorrow.");

        // Assert
        assertThat(result.label()).isEqualTo("clean");
    }

    @Test
    void moderate_passesSafeContent() {
        // Act
        ModerationView result = aiService.moderate("hello world");

        // Assert
        assertThat(result.verdict()).isEqualTo("pass");
        assertThat(result.reasons()).isEmpty();
    }

    @Test
    void moderate_blocksContentWithMultipleUnsafeWords() {
        // Act
        ModerationView result = aiService.moderate("this ransomware can exploit your system");

        // Assert
        assertThat(result.verdict()).isEqualTo("block");
        assertThat(result.reasons()).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    void runOrchestration_recordsARunAndLeavesTemplatesUntouched() {
        // Arrange
        UUID scopeId = UUID.randomUUID();
        ArgumentCaptor<AidaRun> runCaptor = ArgumentCaptor.forClass(AidaRun.class);

        // Act
        aiService.runOrchestration("org", scopeId);

        // Assert: a successful run is recorded for the tenant/scope...
        verify(aidaRunRepository).save(runCaptor.capture());
        AidaRun saved = runCaptor.getValue();
        assertThat(saved.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(saved.getScope()).isEqualTo("org");
        assertThat(saved.getScopeId()).isEqualTo(scopeId);
        assertThat(saved.getStatus()).isEqualTo("success");
        assertThat(saved.getSummary()).isNotBlank();
        assertThat(saved.getCreatedAt()).isNotNull();
        // ...and the template library is not touched.
        verifyNoInteractions(templateRepository);
    }

    @Test
    void listRuns_returnsTenantRunsAsViews() {
        // Arrange
        AidaRun run = new AidaRun(
                UUID.randomUUID(), TENANT_ID, "Phòng Kế toán", null, "success",
                "34 người được cập nhật lộ trình học.", java.time.Instant.now());
        when(aidaRunRepository.findByTenantIdOrderByCreatedAtDesc(TENANT_ID)).thenReturn(List.of(run));

        // Act
        List<AidaRunView> views = aiService.listRuns();

        // Assert
        assertThat(views).hasSize(1);
        AidaRunView v = views.get(0);
        assertThat(v.scope()).isEqualTo("Phòng Kế toán");
        assertThat(v.status()).isEqualTo("success");
        assertThat(v.summary()).contains("34 người");
    }
}
