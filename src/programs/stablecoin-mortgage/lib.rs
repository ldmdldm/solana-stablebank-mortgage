use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use std::convert::TryFrom;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod stablecoin_mortgage {
    use super::*;

    // ... [Previous instruction implementations remain the same]

    #[account]
    #[derive(Default)]
    pub struct Mortgage {
        pub borrower: Pubkey,
        pub lending_pool: Pubkey,
        pub property_nft: Pubkey,
        pub loan_amount: u64,
        pub property_value: u64,
        pub loan_duration: u64,
        pub interest_rate: u64,
        pub monthly_payment: u64,
        pub remaining_balance: u64,
        pub next_payment_due: i64,
        pub payments_made: u64,
        pub is_active: bool,
        pub is_default: bool,
        pub funding_date: i64,
    }
}

impl ProgramState {
    pub const LEN: usize = 32 + // authority
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

impl LendingPool {
    pub const LEN: usize = 32 + // authority
                          32 + // stablecoin_vault
                          8 + // interest_rate
                          8 + // loan_duration
                          8 + // total_deposited
                          8; // total_borrowed
}

impl LenderPosition {
    pub const LEN: usize = 32 + // owner
                          32 + // lending_pool
                          8 + // deposited_amount
                          8; // last_update_timestamp
}

impl Mortgage {
    pub const LEN: usize = 32 + // borrower
                          32 + // lending_pool
                          32 + // property_nft
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
                          8; // funding_date
}

#[error_code]
pub enum MortgageError {
    #[msg("Invalid loan amount")]
    InvalidLoanAmount,
    #[msg("Invalid loan duration")]
    InvalidLoanDuration,
    #[msg("Invalid interest rate")]
    InvalidInterestRate,
    #[msg("Loan-to-value ratio too high")]
    LoanToValueTooHigh,
    #[msg("Insufficient liquidity in pool")]
    InsufficientLiquidity,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Invalid owner")]
    InvalidOwner,
    #[msg("Mortgage not active")]
    MortgageNotActive,
    #[msg("Mortgage already active")]
    MortgageAlreadyActive,
    #[msg("Mortgage in default")]
    MortgageInDefault,
    #[msg("Mortgage already in default")]
    MortgageAlreadyInDefault,
    #[msg("Mortgage not in default")]
    MortgageNotInDefault,
    #[msg("Payment not overdue")]
    PaymentNotOverdue,
    #[msg("Insufficient payment amount")]
    InsufficientPayment,
}