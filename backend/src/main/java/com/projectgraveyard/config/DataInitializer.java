package com.projectgraveyard.config;

import com.projectgraveyard.entity.User;
import com.projectgraveyard.enums.AccountType;
import com.projectgraveyard.enums.Role;
import com.projectgraveyard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        widenProjectUrlColumns();
        migrateLegacyListingTypes();
        seedAdmin();
    }

    /**
     * Hibernate ddl-auto=update does not widen existing varchar(255) columns.
     * Long image/github URLs were failing inserts — force TEXT.
     */
    private void widenProjectUrlColumns() {
        String[] statements = {
                "ALTER TABLE projects ALTER COLUMN image_url TYPE text",
                "ALTER TABLE projects ALTER COLUMN github_url TYPE text",
                "ALTER TABLE projects ALTER COLUMN demo_url TYPE text",
                "ALTER TABLE projects ALTER COLUMN rejection_reason TYPE text",
                "ALTER TABLE projects ALTER COLUMN company_website TYPE text",
                "ALTER TABLE project_images ALTER COLUMN image_url TYPE text"
        };
        for (String sql : statements) {
            try {
                jdbcTemplate.execute(sql);
            } catch (Exception e) {
                log.warn("Schema widen skipped [{}]: {}", sql, e.getMessage());
            }
        }
        log.info("Ensured project URL columns allow long values (TEXT)");
    }

    /** Old enum values break loading projects by reviewStatus */
    private void migrateLegacyListingTypes() {
        try {
            int company = jdbcTemplate.update(
                    "UPDATE projects SET listing_type = 'COMPANY_PROJECT' WHERE listing_type IN ('COMPANY_SHOWCASE')"
            );
            int incomplete = jdbcTemplate.update(
                    "UPDATE projects SET listing_type = 'USER_INCOMPLETE_PROJECT' " +
                    "WHERE listing_type IS NULL OR listing_type NOT IN ('COMPANY_PROJECT', 'USER_INCOMPLETE_PROJECT')"
            );
            int approvedNull = jdbcTemplate.update(
                    "UPDATE projects SET review_status = 'APPROVED' WHERE approved = true AND review_status IS NULL"
            );
            int pendingNull = jdbcTemplate.update(
                    "UPDATE projects SET review_status = 'PENDING_REVIEW' WHERE approved = false AND review_status IS NULL"
            );
            if (company + incomplete + approvedNull + pendingNull > 0) {
                log.info("Migrated listing/review legacy rows: company={}, incomplete={}, approvedNull={}, pendingNull={}",
                        company, incomplete, approvedNull, pendingNull);
            }
        } catch (Exception e) {
            log.warn("listing_type migration skipped: {}", e.getMessage());
        }
        try {
            int roles = jdbcTemplate.update(
                    "UPDATE users SET role = 'USER' WHERE role IN ('BUYER','INDIVIDUAL_SELLER','COMPANY_SELLER')"
            );
            if (roles > 0) {
                log.info("Migrated {} users to role USER", roles);
            }
        } catch (Exception e) {
            log.warn("role migration skipped: {}", e.getMessage());
        }
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@projectgraveyard.com")) {
            User admin = User.builder()
                    .email("admin@projectgraveyard.com")
                    .password(passwordEncoder.encode("admin12345"))
                    .fullName("System Admin")
                    .role(Role.ADMIN)
                    .accountType(AccountType.PREMIUM)
                    .verified(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded default admin: admin@projectgraveyard.com / admin12345");
        }
    }
}
