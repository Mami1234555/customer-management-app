package backend.repository;

import backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("""
        SELECT c FROM Customer c
        WHERE (:customerId IS NULL OR c.customerId = :customerId)
        AND (:customerName IS NULL OR LOWER(c.customerName)
             LIKE LOWER(CONCAT('%', :customerName, '%')))
        AND (:visitDay IS NULL OR c.visitDay = :visitDay)
        """)
    List<Customer> searchCustomers(
            @Param("customerId") Long customerId,
            @Param("customerName") String customerName,
            @Param("visitDay") LocalDate visitDay
    );
}
