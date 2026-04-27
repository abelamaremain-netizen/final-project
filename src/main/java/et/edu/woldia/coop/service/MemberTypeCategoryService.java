package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.MemberTypeCategoryDto;
import et.edu.woldia.coop.entity.MemberTypeCategory;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.repository.MemberTypeCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberTypeCategoryService {

    private final MemberTypeCategoryRepository repository;

    @Transactional(readOnly = true)
    public List<MemberTypeCategoryDto> getAll() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MemberTypeCategoryDto> getActive() {
        return repository.findByActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public MemberTypeCategoryDto create(String name, String description) {
        if (repository.existsByName(name)) {
            throw new ValidationException("Member type category already exists: " + name);
        }
        MemberTypeCategory cat = new MemberTypeCategory();
        cat.setName(name);
        cat.setDescription(description);
        cat.setActive(true);
        return toDto(repository.save(cat));
    }

    @Transactional
    public MemberTypeCategoryDto update(UUID id, String name, String description, Boolean active) {
        MemberTypeCategory cat = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Member type category not found: " + id));
        if (name != null) cat.setName(name);
        if (description != null) cat.setDescription(description);
        if (active != null) cat.setActive(active);
        return toDto(repository.save(cat));
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Member type category not found: " + id);
        }
        repository.deleteById(id);
    }

    public boolean isValid(String name) {
        return repository.findByName(name).map(MemberTypeCategory::getActive).orElse(false);
    }

    private MemberTypeCategoryDto toDto(MemberTypeCategory cat) {
        return MemberTypeCategoryDto.builder()
            .id(cat.getId())
            .name(cat.getName())
            .description(cat.getDescription())
            .active(cat.getActive())
            .build();
    }
}
