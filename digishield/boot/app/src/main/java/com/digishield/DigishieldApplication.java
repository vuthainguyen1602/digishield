package com.digishield;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.modulith.Modulithic;

/**
 * DigiShield application entry point.
 *
 * <p>This is the single Spring Boot bootstrap class for the whole modular
 * monolith. All business modules and shared libraries are wired in as
 * dependencies so Spring Modulith can detect and verify the module structure
 * rooted at this package ({@code com.digishield}).
 */
@Modulithic(systemName = "DigiShield")
@SpringBootApplication
public class DigishieldApplication {

    public static void main(String[] args) {
        SpringApplication.run(DigishieldApplication.class, args);
    }
}
