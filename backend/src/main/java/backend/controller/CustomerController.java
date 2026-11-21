package backend.controller;

import backend.entity.Customer;
import backend.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // 顧客一覧取得・検索
    @GetMapping
    public List<Customer> getCustomers(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate visitDay) {

        if (customerId == null
                && (customerName == null || customerName.isBlank())
                && visitDay == null) {
            return customerService.getAllCustomers();
        }

        String name = (customerName == null || customerName.isBlank())
                ? null
                : customerName.trim();

        return customerService.searchCustomers(
                customerId,
                name,
                visitDay
        );
    }

    // 顧客登録
    @PostMapping
    public Customer createCustomer(@Valid @RequestBody Customer customer) {
        return customerService.saveCustomer(customer);
    }

    // 顧客情報更新
    @PutMapping("/{id}")
    public Customer updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody Customer customer) {

        return customerService.updateCustomer(id, customer);
    }
}
