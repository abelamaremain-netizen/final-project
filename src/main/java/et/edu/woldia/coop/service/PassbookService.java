package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.PassbookDto;
import et.edu.woldia.coop.entity.*;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for passbook management operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PassbookService {
    
    private final MemberRepository memberRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final ShareRecordRepository shareRecordRepository;
    private final LoanRepository loanRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final ConfigurationService configurationService;
    
    /**
     * Generate member passbook
     */
    @Transactional(readOnly = true)
    public PassbookDto generatePassbook(UUID memberId) {
        log.info("Generating passbook for member: {}", memberId);
        
        // Get member
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));
        
        PassbookDto passbook = new PassbookDto();
        passbook.setMemberId(member.getId());
        passbook.setMemberName(member.getFullName());
        passbook.setNationalId(member.getNationalId());
        passbook.setRegistrationDate(member.getRegistrationDate());
        passbook.setGeneratedDate(LocalDate.now());
        
        // Get Regular Saving account
        accountRepository.findByMemberIdAndAccountType(
            memberId, Account.AccountType.REGULAR_SAVING)
            .ifPresent(regularAccount -> {
                passbook.setRegularSavingsBalance(regularAccount.getBalance().getAmount());
                
                // Get Regular Saving transactions
                List<Transaction> regularTransactions = transactionRepository
                    .findByAccountIdOrderByTimestampDesc(regularAccount.getId());
                
                passbook.setRegularSavingsTransactions(
                    regularTransactions.stream()
                        .map(this::toPassbookTransaction)
                        .collect(Collectors.toList())
                );
            });
        
        if (passbook.getRegularSavingsBalance() == null) {
            passbook.setRegularSavingsBalance(BigDecimal.ZERO);
            passbook.setRegularSavingsTransactions(new ArrayList<>());
        }
        
        // Get Non-Regular Saving account
        accountRepository.findByMemberIdAndAccountType(
            memberId, Account.AccountType.NON_REGULAR_SAVING)
            .ifPresent(nonRegularAccount -> {
                passbook.setNonRegularSavingsBalance(nonRegularAccount.getBalance().getAmount());
                
                // Get Non-Regular Saving transactions
                List<Transaction> nonRegularTransactions = transactionRepository
                    .findByAccountIdOrderByTimestampDesc(nonRegularAccount.getId());
                
                passbook.setNonRegularSavingsTransactions(
                    nonRegularTransactions.stream()
                        .map(this::toPassbookTransaction)
                        .collect(Collectors.toList())
                );
            });
        
        if (passbook.getNonRegularSavingsBalance() == null) {
            passbook.setNonRegularSavingsBalance(BigDecimal.ZERO);
            passbook.setNonRegularSavingsTransactions(new ArrayList<>());
        }
        
        // Calculate total savings
        BigDecimal totalSavings = passbook.getRegularSavingsBalance()
            .add(passbook.getNonRegularSavingsBalance());
        passbook.setTotalSavings(totalSavings);
        
        // Get share capital — member.shareCount is the authoritative count
        // ShareRecord only tracks explicit purchases after registration
        int totalShares = member.getShareCount();
        List<ShareRecord> shares = shareRecordRepository.findByMemberIdOrderByPurchaseDateDesc(memberId);
        BigDecimal shareValue;
        if (!shares.isEmpty()) {
            shareValue = shares.stream()
                .map(s -> s.getTotalAmount().getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            // Estimate from current price × share count (covers registration shares)
            BigDecimal pricePerShare = configurationService.getCurrentConfiguration()
                .getSharePricePerShare().getAmount();
            shareValue = pricePerShare.multiply(BigDecimal.valueOf(totalShares));
        }
        
        passbook.setShareCount(totalShares);
        passbook.setShareValue(shareValue);
        
        // Calculate pledged amounts
        BigDecimal totalPledged = BigDecimal.ZERO;
        for (Account account : accountRepository.findByMemberId(memberId)) {
            totalPledged = totalPledged.add(account.getPledgedAmount().getAmount());
        }
        
        passbook.setPledgedAmount(totalPledged);
        passbook.setAvailableBalance(totalSavings.subtract(totalPledged));
        
        // Get loans
        List<Loan> loans = loanRepository.findByMemberIdOrderByApprovalDateDesc(memberId);
        List<PassbookDto.PassbookLoanDto> passbookLoans = new ArrayList<>();
        
        for (Loan loan : loans) {
            PassbookDto.PassbookLoanDto loanDto = new PassbookDto.PassbookLoanDto();
            loanDto.setLoanId(loan.getId());
            loanDto.setDisbursementDate(loan.getDisbursementDate());
            loanDto.setPrincipal(loan.getPrincipalAmount().getAmount());
            loanDto.setInterestRate(loan.getInterestRate());
            loanDto.setDuration(loan.getDurationMonths());
            loanDto.setOutstandingBalance(
                loan.getOutstandingPrincipal().getAmount().add(loan.getOutstandingInterest().getAmount())
            );
            loanDto.setStatus(loan.getStatus().name());
            
            // Get repayments ordered oldest-first to compute running outstanding balance
            List<LoanRepayment> repayments = loanRepaymentRepository.findByLoanIdOrderByPaymentDateDesc(loan.getId());
            // Reverse to oldest-first for running balance calculation
            List<LoanRepayment> repaymentsAsc = new ArrayList<>(repayments);
            java.util.Collections.reverse(repaymentsAsc);

            BigDecimal runningPrincipal = loan.getPrincipalAmount().getAmount();
            BigDecimal runningInterest = loan.getOutstandingInterest().getAmount()
                .add(repaymentsAsc.stream()
                    .map(r -> r.getInterestPaid().getAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add));

            List<PassbookDto.PassbookRepaymentDto> repaymentDtos = new ArrayList<>();
            for (LoanRepayment r : repaymentsAsc) {
                runningPrincipal = runningPrincipal.subtract(r.getPrincipalPaid().getAmount()).max(BigDecimal.ZERO);
                runningInterest = runningInterest.subtract(r.getInterestPaid().getAmount()).max(BigDecimal.ZERO);
                PassbookDto.PassbookRepaymentDto rDto = new PassbookDto.PassbookRepaymentDto();
                rDto.setDate(r.getPaymentDate());
                rDto.setAmount(r.getPaymentAmount().getAmount());
                rDto.setPrincipalPortion(r.getPrincipalPaid().getAmount());
                rDto.setInterestPortion(r.getInterestPaid().getAmount());
                rDto.setOutstandingAfter(runningPrincipal.add(runningInterest));
                repaymentDtos.add(rDto);
            }
            // Return in descending order (most recent first) for display
            java.util.Collections.reverse(repaymentDtos);
            loanDto.setRepayments(repaymentDtos);
            
            passbookLoans.add(loanDto);
        }
        
        passbook.setLoans(passbookLoans);
        
        log.info("Passbook generated for member: {}", memberId);
        
        return passbook;
    }
    
    /**
     * Convert transaction to passbook transaction
     */
    private PassbookDto.PassbookTransactionDto toPassbookTransaction(Transaction transaction) {
        PassbookDto.PassbookTransactionDto dto = new PassbookDto.PassbookTransactionDto();
        dto.setDate(transaction.getTimestamp().toLocalDate());
        dto.setType(transaction.getTransactionType().name());
        dto.setDescription(transaction.getNotes() != null ? transaction.getNotes() : 
            transaction.getSource() != null ? transaction.getSource() : "");
        dto.setAmount(transaction.getAmount().getAmount());
        dto.setBalance(transaction.getBalanceAfter().getAmount());
        
        return dto;
    }
    
}
