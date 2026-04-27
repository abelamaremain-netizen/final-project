package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for document data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    
    private UUID id;
    private String documentName;
    private String documentType;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private String entityType;
    private UUID entityId;
    private LocalDateTime uploadDate;
    private String uploadedBy;
    private String description;
    private String status;
}
