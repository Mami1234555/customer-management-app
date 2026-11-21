
package backend.repository;

import backend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    // ログインIDからスタッフ情報を検索する
    Optional<Staff> findByUsername(String username);
}
