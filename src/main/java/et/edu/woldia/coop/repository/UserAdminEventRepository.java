package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.UserAdminEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserAdminEventRepository extends JpaRepository<UserAdminEvent, UUID> {
    List<UserAdminEvent> findByUserIdOrderByPerformedAtDesc(UUID userId);
    List<UserAdminEvent> findByPerformedByOrderByPerformedAtDesc(String performedBy);
}
