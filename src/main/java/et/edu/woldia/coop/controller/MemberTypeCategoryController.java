package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.MemberTypeCategoryDto;
import et.edu.woldia.coop.service.MemberTypeCategoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/member-type-categories")
@RequiredArgsConstructor
@Tag(name = "Member Type Categories", description = "Configurable member type categories")
@SecurityRequirement(name = "bearerAuth")
public class MemberTypeCategoryController {

    private final MemberTypeCategoryService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'ADMINISTRATOR')")
    public ResponseEntity<List<MemberTypeCategoryDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'ADMINISTRATOR')")
    public ResponseEntity<List<MemberTypeCategoryDto>> getActive() {
        return ResponseEntity.ok(service.getActive());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<MemberTypeCategoryDto> create(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.create(body.get("name"), body.get("description")));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<MemberTypeCategoryDto> update(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        Boolean active = body.get("active") != null ? (Boolean) body.get("active") : null;
        return ResponseEntity.ok(service.update(id,
            (String) body.get("name"),
            (String) body.get("description"),
            active));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
