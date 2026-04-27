package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.DocumentDto;
import et.edu.woldia.coop.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for document management operations.
 */
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document management API")
@SecurityRequirement(name = "bearerAuth")
public class DocumentController {
    
    private final DocumentService documentService;
    
    /**
     * Upload a document
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Upload a document")
    public ResponseEntity<DocumentDto> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "entityType", required = false) String entityType,
            @RequestParam(value = "entityId", required = false) UUID entityId,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) {
        
        String userId = authentication.getName();
        DocumentDto document = documentService.uploadDocument(
            file, documentType, entityType, entityId, description, userId);
        
        return ResponseEntity.ok(document);
    }
    
    /**
     * Retrieve a document
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'AUDITOR')")
    @Operation(summary = "Download a document")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID id) {
        Resource resource = documentService.retrieveDocument(id);
        DocumentDto metadata = documentService.getDocumentMetadata(id);
        
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(metadata.getMimeType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + metadata.getDocumentName() + "\"")
            .body(resource);
    }
    
    /**
     * Get document metadata
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'AUDITOR')")
    @Operation(summary = "Get document metadata")
    public ResponseEntity<DocumentDto> getDocumentMetadata(@PathVariable UUID id) {
        DocumentDto document = documentService.getDocumentMetadata(id);
        return ResponseEntity.ok(document);
    }
    
    /**
     * List documents by entity
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'AUDITOR')")
    @Operation(summary = "List documents by entity")
    public ResponseEntity<List<DocumentDto>> listDocuments(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(required = false) String documentType) {
        
        List<DocumentDto> documents;
        
        if (entityType != null && entityId != null) {
            documents = documentService.listDocumentsByEntity(entityType, entityId);
        } else if (documentType != null) {
            documents = documentService.listDocumentsByType(documentType);
        } else {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(documents);
    }
    
    /**
     * Delete a document
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Delete a document")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userId = authentication.getName();
        documentService.deleteDocument(id, userId);
        
        return ResponseEntity.ok().build();
    }
}
