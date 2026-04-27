package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Document reference entity for tracking uploaded documents.
 */
@Entity
@Table(name = "documents")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class DocumentReference extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "document_name", nullable = false)
    private String documentName;
    
    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;  // e.g., "loan_contract", "appraisal", "consent_form"
    
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "mime_type", length = 100)
    private String mimeType;
    
    @Column(name = "entity_type", length = 50)
    private String entityType;  // e.g., "loan", "member", "collateral"
    
    @Column(name = "entity_id", columnDefinition = "uuid")
    private UUID entityId;
    
    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;
    
    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;
    
    @Column(length = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.ACTIVE;
    
    public enum DocumentStatus {
        ACTIVE,
        ARCHIVED,
        DELETED
    }
}
