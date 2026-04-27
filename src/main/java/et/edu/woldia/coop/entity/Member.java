package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "members")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "member_type", nullable = false, length = 100)
    private String memberType;

    // Personal Info
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "national_id", nullable = false, unique = true, length = 50)
    private String nationalId;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(length = 255)
    private String email;

    // Address (merged street, city, region, country into single field)
    @Column(name = "address", length = 500)
    private String address;

    // Employment Info
    @Column(name = "employment_status", nullable = false, length = 20)
    private String employmentStatus;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "committed_deduction_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "committed_deduction_currency", length = 3))
    })
    private Money committedDeduction;

    @Column(name = "last_deduction_change_date")
    private LocalDate lastDeductionChangeDate;

    // External Cooperative Info
    @Column(name = "external_cooperative_name")
    private String externalCooperativeName;

    @Column(name = "external_cooperative_member_id", length = 100)
    private String externalCooperativeMemberId;

    // Registration Info
    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate;

    @Column(name = "registration_config_version", nullable = false)
    private Integer registrationConfigVersion;

    @Column(name = "share_count", nullable = false)
    private Integer shareCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status = MemberStatus.ACTIVE;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MemberSuspension> suspensionHistory = new ArrayList<>();

    public enum MemberStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        WITHDRAWN,
        DECEASED
    }

    public void addSuspension(MemberSuspension suspension) {
        suspensionHistory.add(suspension);
        suspension.setMember(this);
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}