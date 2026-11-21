package backend.security;

import backend.entity.Staff;
import backend.enums.Role;
import backend.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class InitialAdminConfig {

    @Value("${app.initial-admin.username}")
    private String adminUsername;

    @Value("${app.initial-admin.name}")
    private String adminName;

    @Value("${app.initial-admin.password}")
    private String adminPassword;

    @Bean
    public CommandLineRunner createInitialAdmin(
            StaffRepository staffRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // パスワードが設定されているか確認
            if (adminPassword == null || adminPassword.isBlank()) {
                throw new IllegalStateException(
                        "管理者パスワードが設定されていません。.envを確認してください。"
                );
            }

            // 管理者がすでに存在する場合は何もしない
            if (staffRepository.findByUsername(adminUsername).isPresent()) {
                System.out.println("管理者アカウントは登録済みです。");
                return;
            }

            // 管理者アカウントを作成
            Staff admin = new Staff();
            admin.setStaffName(adminName);
            admin.setUsername(adminUsername);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);

            staffRepository.save(admin);

            System.out.println("管理者アカウントを作成しました。");
        };
    }
}
