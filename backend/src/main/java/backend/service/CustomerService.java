package backend.service;

import backend.entity.Customer;
import backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    // 顧客検索
    public List<Customer> searchCustomers(
            Long customerId,
            String customerName,
            LocalDate visitDay) {

        return customerRepository.searchCustomers(
                customerId,
                customerName,
                visitDay
        );
    }

    // 顧客情報を更新
    public Customer updateCustomer(Long customerId, Customer updatedCustomer) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("顧客が見つかりません"));

        customer.setCustomerName(updatedCustomer.getCustomerName());
        customer.setVisitDay(updatedCustomer.getVisitDay());
        customer.setTreatmentDetails(updatedCustomer.getTreatmentDetails());
        customer.setTopic(updatedCustomer.getTopic());
        customer.setHandover(updatedCustomer.getHandover());

        return customerRepository.save(customer);
    }
}
