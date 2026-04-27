package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.DocumentReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for DocumentReference entity.
 */
@Repository
public interface DocumentReferenceRepository extends JpaRepository<DocumentReference, UUID> {
    
    /**
     * Find documents by entity type and ID
     */
    List<DocumentReference> findByEntityTypeAndEntityId(String entityType, UUID entityId);
    
    /**
     * Find documents by document type
     */
    List<DocumentReference> findByDocumentType(String documentType);
    
    /**
     * Find documents by status
     */
    List<DocumentReference> findByStatus(DocumentReference.DocumentStatus status);
    
    /**
     * Find documents uploaded by user
     */
    List<DocumentReference> findByUploadedBy(String uploadedBy);
}
