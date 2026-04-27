package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Member entity.
 */
@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {
    
    /**
     * Find member by national ID
     */
    Optional<Member> findByNationalId(String nationalId);
    
    /**
     * Check if national ID exists
     */
    boolean existsByNationalId(String nationalId);
    
    /**
     * Find members by status
     */
    List<Member> findByStatus(Member.MemberStatus status);
    
    /**
     * Find members by member type
     */
    List<Member> findByMemberType(String memberType);
    
    /**
     * Count active members
     */
    @Query("SELECT COUNT(m) FROM Member m WHERE m.status = 'ACTIVE'")
    long countActiveMembers();
    
    /**
     * Find members with outstanding loans (for withdrawal validation)
     */
    @Query("SELECT m FROM Member m WHERE m.id IN " +
           "(SELECT l.memberId FROM Loan l WHERE l.status IN ('ACTIVE', 'DISBURSED', 'APPROVED'))")
    List<Member> findMembersWithOutstandingLoans();

    /**
     * Paginated list of all members
     */
    Page<Member> findAll(Pageable pageable);

    /**
     * Paginated list filtered by status
     */
    Page<Member> findByStatus(Member.MemberStatus status, Pageable pageable);

    /**
     * Paginated search across name, national ID, phone
     */
    @Query(value = "SELECT * FROM members m WHERE " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:memberType IS NULL OR m.member_type = :memberType) AND " +
           "(:search IS NULL OR LOWER(m.first_name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(m.last_name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR m.national_id LIKE CONCAT('%', :search, '%') " +
           " OR m.phone_number LIKE CONCAT('%', :search, '%'))",
           countQuery = "SELECT COUNT(*) FROM members m WHERE " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:memberType IS NULL OR m.member_type = :memberType) AND " +
           "(:search IS NULL OR LOWER(m.first_name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(m.last_name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR m.national_id LIKE CONCAT('%', :search, '%') " +
           " OR m.phone_number LIKE CONCAT('%', :search, '%'))",
           nativeQuery = true)
    Page<Member> searchMembers(
        @Param("status") String status,
        @Param("memberType") String memberType,
        @Param("search") String search,
        Pageable pageable
    );

    /**
     * Count members by status
     */
    @Query("SELECT m.status, COUNT(m) FROM Member m GROUP BY m.status")
    List<Object[]> countMembersByStatus();

    /**
     * Count members by type
     */
    @Query("SELECT m.memberType, COUNT(m) FROM Member m GROUP BY m.memberType")
    List<Object[]> countMembersByType();

    /**
     * Count new members registered between two dates
     */
    @Query("SELECT COUNT(m) FROM Member m WHERE m.registrationDate BETWEEN :from AND :to")
    long countNewMembersBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    /**
     * Count members registered in a given year
     */
    @Query("SELECT COUNT(m) FROM Member m WHERE YEAR(m.registrationDate) = :year")
    long countNewMembersInYear(@Param("year") int year);

    /**
     * Count members by status and registration month/year for growth chart
     */
    @Query("SELECT YEAR(m.registrationDate), MONTH(m.registrationDate), COUNT(m) " +
           "FROM Member m WHERE m.registrationDate >= :since GROUP BY YEAR(m.registrationDate), MONTH(m.registrationDate)")
    List<Object[]> countNewMembersByMonth(@Param("since") LocalDate since);
}
