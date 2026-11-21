
package backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @NotNull(message = "来店日は必須です。")
    @Column(name = "visit_day")
    private LocalDate visitDay;

    @Column(name = "treatment_details", columnDefinition = "TEXT")
    private String treatmentDetails;

    @Column(name = "topic", columnDefinition = "TEXT")
    private String topic;

    @Column(name = "handover", columnDefinition = "TEXT")
    private String handover;

    // コンストラクタ
    public Customer() {
    }

    // Getter・Setter
    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public LocalDate getVisitDay() {
        return visitDay;
    }

    public void setVisitDay(LocalDate visitDay) {
        this.visitDay = visitDay;
    }

    public String getTreatmentDetails() {
        return treatmentDetails;
    }

    public void setTreatmentDetails(String treatmentDetails) {
        this.treatmentDetails = treatmentDetails;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getHandover() {
        return handover;
    }

    public void setHandover(String handover) {
        this.handover = handover;
    }
}
