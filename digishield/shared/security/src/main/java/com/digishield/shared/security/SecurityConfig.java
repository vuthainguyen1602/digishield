package com.digishield.shared.security;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Production security configuration for the business modules:
 * <ul>
 *   <li>Stateless, using a JWT resource server.</li>
 *   <li>Allows access to {@code /actuator/**} without authentication (health/metrics).</li>
 *   <li>Enables method security ({@code @PreAuthorize}).</li>
 *   <li>Wires in the shared CORS configuration (if a {@link CorsConfigurationSource}
 *       bean is present) so the frontend can call the API in any profile.</li>
 * </ul>
 *
 * <p>Active for every profile <em>except</em> {@code dev}: the {@code dev} profile
 * supplies its own permissive {@code DevSecurityConfig} (in {@code boot:app}) and
 * having both chains active would create a bean conflict.
 */
@Configuration
@Profile("!dev")
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   ObjectProvider<CorsConfigurationSource> corsSource)
            throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                    CorsConfigurationSource source = corsSource.getIfAvailable();
                    if (source != null) {
                        cors.configurationSource(source);
                    } else {
                        cors.disable();
                    }
                })
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }
}
