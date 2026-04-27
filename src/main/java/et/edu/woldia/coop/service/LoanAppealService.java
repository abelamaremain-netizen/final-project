package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.LoanAppealDto;
import et.edu.woldia.coop.entity.LoanAppeal;
import et.edu.woldia.coop.entity.LoanApplication;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.LoanAppealMapper;
import et.edu.woldia.coop.repository.LoanAppealRepository;
import et.edu.woldia.coop.repository.LoanApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for loan appeal management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LoanAppealService {
    
    private final LoanAppealRepository loanAppealRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanService loanService;
    private final LoanAppealMapper loanAppealMapper;
    private final AuditService auditService;
    
    /**
     * Submit appeal to general assembly
     */
    @Transactional
    public UUID submitAppeal(UUID applicationId, String appealReason, UUID memberId) {
        log.info("Submitting appeal for application: {}", applicationId);
        
        // Validate application exists and is denied
        LoanApplication application = loanApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));
        
        if (application.getStatus() != LoanApplication.ApplicationStatus.DENIED) {
            throw new ValidationException("Can only appeal denied applications");
        }
        
        if (!application.getMemberId().equals(memberId)) {
            throw new ValidationException("Member ID does not match application");
        }
        
        // Create appeal
        LoanAppeal appeal = new LoanAppeal();
        appeal.setApplicationId(applicationId);
        appeal.setMemberId(memberId);
        appeal.setAppealReason(appealReason);
        appeal.setSubmissionDate(LocalDateTime.now());
        appeal.setStatus(LoanAppeal.AppealStatus.PENDING);
        appeal.setProcessedBy(memberId.toString());
        
        LoanAppeal saved = loanAppealRepository.save(appeal);
        
        log.info("Appeal submitted: {}", saved.getId());

        try { auditService.logAction(memberId, memberId.toString(), "CREATE", "LOAN_APPEAL", saved.getId(),
            "Appeal submitted for application " + applicationId); } catch (Exception ignored) {}

        return saved.getId();
    }
    
    /**
     * Record general assembly decision
     */
    @Transactional
    public void recordDecision(UUID appealId, LoanAppeal.AppealDecision decision, 
                               String decisionNotes, String recordedBy) {
        log.info("Recording decision for appeal: {}", appealId);
        
        LoanAppeal appeal = loanAppealRepository.findById(appealId)
            .orElseThrow(() -> new ResourceNotFoundException("Appeal not found: " + appealId));
        
        if (appeal.getStatus() == LoanAppeal.AppealStatus.DECIDED) {
            throw new ValidationException("Appeal has already been decided");
        }
        
        appeal.setDecision(decision);
        appeal.setDecisionDate(LocalDateTime.now());
        appeal.setDecisionNotes(decisionNotes);
        appeal.setRecordedBy(recordedBy);
        appeal.setStatus(LoanAppeal.AppealStatus.DECIDED);
        
        loanAppealRepository.save(appeal);
        
        // If approved, reprocess the application
        if (decision == LoanAppeal.AppealDecision.APPROVED) {
            LoanApplication application = loanApplicationRepository.findById(appeal.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
            
            // Reset application status to pending for reprocessing
            application.setStatus(LoanApplication.ApplicationStatus.PENDING);
            loanApplicationRepository.save(application);
            
            log.info("Application {} reset to PENDING after appeal approval", application.getId());
        }
        
        log.info("Appeal decision recorded: {} - {}", appealId, decision);

        try { auditService.logAction(null, recordedBy, decision == LoanAppeal.AppealDecision.APPROVED ? "APPROVE" : "DENY",
            "LOAN_APPEAL", appealId, "Appeal decision: " + decision + ". Notes: " + decisionNotes); } catch (Exception ignored) {}
    }
    
    /**
     * Get pending appeals
     */
    @Transactional(readOnly = true)
    public List<LoanAppealDto> getPendingAppeals() {
        return loanAppealRepository.findByStatusOrderBySubmissionDateAsc(LoanAppeal.AppealStatus.PENDING).stream()
            .map(loanAppealMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get appeals for application
     */
    @Transactional(readOnly = true)
    public List<LoanAppealDto> getAppealsForApplication(UUID applicationId) {
        return loanAppealRepository.findByApplicationIdOrderBySubmissionDateDesc(applicationId).stream()
            .map(loanAppealMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get appeals for member
     */
    @Transactional(readOnly = true)
    public List<LoanAppealDto> getAppealsForMember(UUID memberId) {
        return loanAppealRepository.findByMemberIdOrderBySubmissionDateDesc(memberId).stream()
            .map(loanAppealMapper::toDto)
            .collect(Collectors.toList());
    }
}
