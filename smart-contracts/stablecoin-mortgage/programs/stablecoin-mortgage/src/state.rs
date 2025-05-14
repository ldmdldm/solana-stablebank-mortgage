use anchor_lang::prelude::*;
use std::convert::TryFrom;

/// Global program state account
#[account]
#[derive(Default)]
pub struct ProgramState {
    /// Admin authority that can update program parameters
    pub authority: Pubkey,
    
    /// Treasury account that receives fees
    pub treasury: Pubkey,
    
    /// Stablecoin mint used in the program
    pub stablecoin_mint: Pubkey,
    
    /// Minimum loan amount allowed
    pub min_loan_amount: u64,
    
    /// Maximum loan amount allowed
    pub max_loan_amount: u64,
    
    /// Minimum loan duration in seconds
    pub min_loan_duration: u64,
    
    /// Maximum loan duration in seconds
    pub max_loan_duration: u64,
    
    /// Minimum interest rate (basis points)
    pub min_interest_rate: u64,
    
    /// Maximum interest rate (basis points)
    pub max_interest_rate: u64,
    
    /// Threshold for liquidation (percent)
    pub liquidation_threshold: u64,
}

impl ProgramState {
    pub const LEN: usize = 8 + // discriminator
                          32 + // authority
                          32 + // treasury
                          32 + // stablecoin_mint
                          8 + // min_loan_amount
                          8 + // max_loan_amount
                          8 + // min_loan_duration
                          8 + // max_loan_duration
                          8 + // min_interest_rate
                          8 + // max_interest_rate
                          8; // liquidation_threshold
}

/// Lending pool account
#[account]
#[derive(Default)]
pub struct LendingPool {
    /// Pool authority (creator)
    pub authority: Pubkey,
    
    /// Associated token account for stablecoins in the pool
    pub stablecoin_vault: Pubkey,
    
    /// Interest rate for loans from this pool (basis points)
    pub interest_rate: u64,
    
    /// Loan duration in seconds
    pub loan_duration: u64,
    
    /// Total deposited amount
    pub total_deposited: u64,
    
    /// Total borrowed amount
    pub total_borrowed: u64,
    
    /// Pool enabled status
    pub is_active: bool,
    
    /// Last updated timestamp
    pub last_updated: i64,
}

impl LendingPool {
    pub const LEN: usize = 8 + // discriminator
                          32 + // authority
                          32 + // stablecoin_vault
                          8 + // interest_rate
                          8 + // loan_duration
                          8 + // total_deposited
                          8 + // total_borrowed
                          1 + // is_active
                          8; // last_updated
}

/// Lender position account tracking deposits
#[account]
#[derive(Default)]
pub struct LenderPosition {
    /// Owner of the position
    pub owner: Pubkey,
    
    /// Reference to the lending pool
    pub lending_pool: Pubkey,
    
    /// Amount deposited by this lender
    pub deposited_amount: u64,
    
    /// Earned interest not yet claimed
    pub earned_interest: u64,
    
    /// Last update timestamp
    pub last_update_timestamp: i64,
}

impl LenderPosition {
    pub const LEN: usize = 8 + // discriminator
                          32 + // owner
                          32 + // lending_pool
                          8 + // deposited_amount
                          8 + // earned_interest
                          8; // last_update_timestamp
}

/// Mortgage account
#[account]
#[derive(Default)]
pub struct Mortgage {
    /// Borrower wallet
    pub borrower: Pubkey,
    
    /// Lending pool providing the loan
    pub lending_pool: Pubkey,
    
    /// NFT representing property collateral
    pub property_nft: Pubkey,
    
    /// Property NFT mint
    pub property_nft_mint: Pubkey,
    
    /// Total loan amount
    pub loan_amount: u64,
    
    /// Value of the property
    pub property_value: u64,
    
    /// Loan duration in seconds
    pub loan_duration: u64,
    
    /// Interest rate (basis points)
    pub interest_rate: u64,
    
    /// Monthly payment amount
    pub monthly_payment: u64,
    
    /// Current remaining balance
    pub remaining_balance: u64,
    
    /// Next payment due timestamp
    pub next_payment_due: i64,
    
    /// Number of payments made
    pub payments_made: u64,
    
    /// True if mortgage is active
    pub is_active: bool,
    
    /// True if mortgage is in default
    pub is_default: bool,
    
    /// Date when mortgage was funded
    pub funding_date: i64,
    
    /// Date when mortgage was paid off or liquidated (if applicable)
    pub close_date: Option<i64>,
}

impl Mortgage {
    pub const LEN: usize = 8 + // discriminator
                          32 + // borrower
                          32 + // lending_pool
                          32 + // property_nft
                          32 + // property_nft_mint
                          8 + // loan_amount
                          8 + // property_value
                          8 + // loan_duration
                          8 + // interest_rate
                          8 + // monthly_payment
                          8 + // remaining_balance
                          8 + // next_payment_due
                          8 + // payments_made
                          1 + // is_active
                          1 + // is_default
                          8 + // funding_date
                          9; // Option<i64> close_date (1 byte for option, 8 bytes for i64)
}

/// Property NFT metadata account
#[account]
#[derive(Default)]
pub struct PropertyNFT {
    /// Owner of the property
    pub owner: Pubkey,
    
    /// NFT mint address
    pub mint: Pubkey,
    
    /// Associated token account holding the NFT
    pub token_account: Pubkey,
    
    /// Property value in stablecoin units
    pub property_value: u64,
    
    /// Property address (limited to 100 chars)
    pub property_address: String,
    
    /// True if NFT is locked as collateral
    pub is_locked: bool,
    
    /// If locked, the mortgage account that has locked it
    pub locked_by: Option<Pubkey>,
    
    /// Registration date
    pub registration_date: i64,
}

impl PropertyNFT {
    pub const BASE_LEN: usize = 8 + // discriminator
                            32 + // owner
                            32 + // mint
                            32 + // token_account
                            8 + // property_value
                            4 + // property_address string prefix
                            1 + // is_locked
                            33 + // Option<Pubkey> locked_by (1 byte for option, 32 bytes for Pubkey)
                            8; // registration_date
    
    // Max size includes max address string length (100 chars)
    pub const MAX_LEN: usize = Self::BASE_LEN + 100;
}

