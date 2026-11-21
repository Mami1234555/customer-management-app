package backend.security;

import backend.entity.Staff;
import backend.repository.StaffRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class StaffDetailsService implements UserDetailsService {

    private final StaffRepository staffRepository;

    public StaffDetailsService(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Staff staff = staffRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("スタッフが見つかりません")
                );

        return User.withUsername(staff.getUsername())
                .password(staff.getPassword())
                .roles(staff.getRole().name())
                .build();
    }
}
