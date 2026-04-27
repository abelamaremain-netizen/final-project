package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.MemberTypeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberTypeCategoryRepository extends JpaRepository<MemberTypeCategory, UUID> {
    List<MemberTypeCategory> findByActiveTrue();
    Optional<MemberTypeCategory> findByName(String name);
    boolean existsByName(String name);
}
