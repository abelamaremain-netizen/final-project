package et.edu.woldia.coop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for Cooperative Management System
 * 
 * This system manages member registration, savings accounts, share capital,
 * loan applications, collateral tracking, and financial reporting for
 * Ma'ed Basic Money and Saving Credit Cooperative Society.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class CooperativeManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(CooperativeManagementSystemApplication.class, args);
    }
}
