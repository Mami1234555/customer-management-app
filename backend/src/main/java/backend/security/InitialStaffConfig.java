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
public class InitialStaffConfig {

    @Value("${app.initial-staff.password}")
    private String staffPassword;

    @Bean
    public CommandLineRunner createInitialStaff(
            StaffRepository staffRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (staffPassword == null || staffPassword.isBlank()) {
                throw new IllegalStateException(
                        "スタッフ用パスワードが設定されていません。.envを確認してください。"
                );
            }

            createStaffIfNotExists(
                    staffRepository,
                    passwordEncoder,
                    "スタッフ①",
                    "staff01"
            );

            createStaffIfNotExists(
                    staffRepository,
                    passwordEncoder,
                    "スタッフ②",
                    "staff02"
            );
        };
    }

    private void createStaffIfNotExists(
            StaffRepository staffRepository,
            PasswordEncoder passwordEncoder,
            String staffName,
            String username) {

        if (staffRepository.findByUsername(username).isPresent()) {
            System.out.println(username + " は登録済みです。");
            return;
        }

        Staff staff = new Staff();
        staff.setStaffName(staffName);
        staff.setUsername(username);
        staff.setPassword(passwordEncoder.encode(staffPassword));
        staff.setRole(Role.STAFF);

        staffRepository.save(staff);

        System.out.println(username + " を作成しました。");
    }
}
