use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    // General errors
    #[msg("Operation overflowed")]
    Overflow,
    #[msg("Invalid parameter value")]
    InvalidParameter,
    #[msg("Unauthorized access")]
    Unauthorized,
    
    // Lending pool errors
    #[msg("Pool is not active")]
    PoolInactive,
    #[msg("Insufficient liquidity in pool")]
    InsufficientLiquidity,
    #[msg("Amount exceeds pool limit")]
    ExceedsPoolLimit,
    
    // Mortgage errors
    #[msg("Loan amount outside allowed range")]
    InvalidLoanAmount,
    #[msg("Loan duration outside allowed range")]
    InvalidLoanDuration,
    #[msg("Interest rate outside allowed range")]
    InvalidInterestRate,
    #[msg("Mortgage is not active")]
    MortgageInactive,
    #[msg("Mortgage is in default")]
    MortgageDefaulted,
    #[msg("Payment amount too low")]
    InsufficientPayment,
    #[msg("No payment due yet")]
    NoPaymentDue,
    
    // NFT errors
    #[msg("NFT is already locked")]
    NFTAlreadyLocked,
    #[msg("NFT is not locked")]
    NFTNotLocked,
    #[msg("Invalid NFT owner")]
    InvalidNFTOwner,
    
    // Rewards errors
    #[msg("No rewards available to claim")]
    NoRewardsToClaim,
    #[msg("Rewards pool is empty")]
    RewardsPoolEmpty,
    #[msg("Invalid rewards configuration")]
    InvalidRewardsConfig,
    
    // Risk assessment errors
    #[msg("Assessment is not valid")]
    InvalidAssessment,
    #[msg("Too early for new assessment")]
    AssessmentTooEarly,
    #[msg("Risk score out of range")]
    InvalidRiskScore,
    
    // Governance errors
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Parameter key too long")]
    ParameterKeyTooLong,
    #[msg("Vote overflow")]
    VoteOverflow,
    #[msg("Already voted on this proposal")]
    AlreadyVoted,
    #[msg("Insufficient votes to execute")]
    InsufficientVotes,
    #[msg("Proposal not ready for execution")]
    ProposalNotReady,
    #[msg("Proposal already executed")]
    ProposalAlreadyExecuted,
}
