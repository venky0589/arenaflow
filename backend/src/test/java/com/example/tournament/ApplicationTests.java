package com.example.tournament;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Basic test to verify Spring Boot application context loads successfully
 */
@SpringBootTest
@ActiveProfiles("test")
class ApplicationTests {

    @Test
    void contextLoads() {
        // This test passes if the application context loads successfully
        // It verifies all beans are properly configured and wired
    }
}
