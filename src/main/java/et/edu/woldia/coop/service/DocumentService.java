package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.DocumentDto;
import et.edu.woldia.coop.entity.DocumentReference;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.repository.DocumentReferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for document management operations.
 *
 * NOTE: This implementation stores files on the local filesystem.
 * For production deployments with multiple instances or containers,
 * replace the storage backend with an object storage service (e.g. S3, MinIO).
 * The storage path is configurable via the DOCUMENT_STORAGE_PATH environment variable.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {
    
    private final DocumentReferenceRepository documentRepository;
    private final AuditService auditService;
    
    @Value("${app.document.storage.path:./documents}")
    private String storageBasePath;
    
    /**
     * Upload a document
     */
    @Transactional
    public DocumentDto uploadDocument(MultipartFile file, String documentType, 
                                     String entityType, UUID entityId, 
                                     String description, String uploadedBy) {
        log.info("Uploading document: {} type: {}", file.getOriginalFilename(), documentType);
        
        if (file.isEmpty()) {
            throw new ValidationException("File is empty");
        }
        
        try {
            // Create storage directory if it doesn't exist
            Path storageDir = Paths.get(storageBasePath);
            if (!Files.exists(storageDir)) {
                Files.createDirectories(storageDir);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            
            // Save file
            Path filePath = storageDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Create document reference
            DocumentReference document = new DocumentReference();
            document.setDocumentName(originalFilename);
            document.setDocumentType(documentType);
            document.setFilePath(filePath.toString());
            document.setFileSize(file.getSize());
            document.setMimeType(file.getContentType());
            document.setEntityType(entityType);
            document.setEntityId(entityId);
            document.setUploadDate(LocalDateTime.now());
            document.setUploadedBy(uploadedBy);
            document.setDescription(description);
            document.setStatus(DocumentReference.DocumentStatus.ACTIVE);
            
            DocumentReference saved = documentRepository.save(document);
            
            log.info("Document uploaded successfully: {}", saved.getId());

            try { auditService.logAction(null, uploadedBy, "CREATE", "DOCUMENT", saved.getId(),
                "Document uploaded: " + originalFilename + " (" + documentType + ") for " + entityType + " " + entityId); } catch (Exception ignored) {}

            return toDto(saved);
            
        } catch (IOException e) {
            log.error("Error uploading document: {}", e.getMessage());
            throw new ValidationException("Failed to upload document: " + e.getMessage());
        }
    }
    
    /**
     * Retrieve a document
     */
    @Transactional(readOnly = true)
    public Resource retrieveDocument(UUID documentId) {
        log.info("Retrieving document: {}", documentId);
        
        DocumentReference document = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        
        if (document.getStatus() == DocumentReference.DocumentStatus.DELETED) {
            throw new ValidationException("Document has been deleted");
        }
        
        try {
            Path filePath = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Document file not found or not readable");
            }
        } catch (MalformedURLException e) {
            throw new ValidationException("Invalid file path: " + e.getMessage());
        }
    }
    
    /**
     * Get document metadata
     */
    @Transactional(readOnly = true)
    public DocumentDto getDocumentMetadata(UUID documentId) {
        DocumentReference document = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        
        return toDto(document);
    }
    
    /**
     * List documents by entity
     */
    @Transactional(readOnly = true)
    public List<DocumentDto> listDocumentsByEntity(String entityType, UUID entityId) {
        return documentRepository.findByEntityTypeAndEntityId(entityType, entityId).stream()
            .filter(d -> d.getStatus() == DocumentReference.DocumentStatus.ACTIVE)
            .map(this::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * List documents by type
     */
    @Transactional(readOnly = true)
    public List<DocumentDto> listDocumentsByType(String documentType) {
        return documentRepository.findByDocumentType(documentType).stream()
            .filter(d -> d.getStatus() == DocumentReference.DocumentStatus.ACTIVE)
            .map(this::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Delete a document (soft delete)
     */
    @Transactional
    public void deleteDocument(UUID documentId, String deletedBy) {
        log.info("Deleting document: {}", documentId);
        
        DocumentReference document = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        
        document.setStatus(DocumentReference.DocumentStatus.DELETED);
        documentRepository.save(document);
        
        log.info("Document deleted: {}", documentId);

        try { auditService.logAction(null, deletedBy, "DELETE", "DOCUMENT", documentId,
            "Document deleted: " + document.getDocumentName()); } catch (Exception ignored) {}
    }
    
    /**
     * Convert entity to DTO
     */
    private DocumentDto toDto(DocumentReference document) {
        DocumentDto dto = new DocumentDto();
        dto.setId(document.getId());
        dto.setDocumentName(document.getDocumentName());
        dto.setDocumentType(document.getDocumentType());
        dto.setFilePath(null); // Never expose server-side file path to clients
        dto.setFileSize(document.getFileSize());
        dto.setMimeType(document.getMimeType());
        dto.setEntityType(document.getEntityType());
        dto.setEntityId(document.getEntityId());
        dto.setUploadDate(document.getUploadDate());
        dto.setUploadedBy(document.getUploadedBy());
        dto.setDescription(document.getDescription());
        dto.setStatus(document.getStatus().name());
        
        return dto;
    }
}
