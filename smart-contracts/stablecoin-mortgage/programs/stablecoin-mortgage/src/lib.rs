use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

mod state;
mod instructions;
mod errors;
mod rewards;
mod risk_assessment;
mod governance;

use state::*;
use instructions::*;
use errors::*;
use rewards::*;
use risk_assessment::*;
use governance::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod stablecoin_mortgage {
    use super::*;

    // System initialization
    pub fn initialize_program(
        ctx: Context<InitializeProgram>,
        min_loan_amount: u64,
        max_loan_amount: u64,
        min_loan_duration: u64,
        max_loan_duration: u64,
        min_interest_rate: u64,
        max_interest_rate: u64,
        liquidation_threshold: u64,
    ) -> Result<()> {
        instructions::init::initialize_program(
            ctx,
            min_loan_amount,
            max_loan_amount,
            min_loan_duration,
            max_loan_duration,
            min_interest_rate,
            max_interest_rate,
            liquidation_threshold,
        )
    }

    // Lending pool instructions
    pub fn create_lending_pool(
        ctx: Context<CreateLendingPool>,
        interest_rate: u64,
        loan_duration: u64,
    ) -> Result<()> {
        instructions::lending::create_lending_pool(ctx, interest_rate, loan_duration)
    }

    pub fn deposit_to_pool(ctx: Context<DepositToPool>, amount: u64) -> Result<()> {
        instructions::lending::deposit_to_pool(ctx, amount)
    }

    pub fn withdraw_from_pool(ctx: Context<WithdrawFromPool>, amount: u64) -> Result<()> {
        instructions::lending::withdraw_from_pool(ctx, amount)
    }

    // Mortgage instructions
    pub fn create_mortgage(
        ctx: Context<CreateMortgage>,
        loan_amount: u64,
        property_value: u64,
    ) -> Result<()> {
        instructions::mortgage::create_mortgage(ctx, loan_amount, property_value)
    }

    pub fn fund_mortgage(ctx: Context<FundMortgage>) -> Result<()> {
        instructions::mortgage::fund_mortgage(ctx)
    }

    pub fn make_mortgage_payment(ctx: Context<MakeMortgagePayment>, amount: u64) -> Result<()> {
        instructions::mortgage::make_mortgage_payment(ctx, amount)
    }

    pub fn liquidate_mortgage(ctx: Context<LiquidateMortgage>) -> Result<()> {
        instructions::mortgage::liquidate_mortgage(ctx)
    }

    pub fn close_mortgage(ctx: Context<CloseMortgage>) -> Result<()> {
        instructions::mortgage::close_mortgage(ctx)
    }

    // NFT collateral instructions
    pub fn register_property_nft(
        ctx: Context<RegisterPropertyNFT>,
        property_value: u64,
        property_address: String,
    ) -> Result<()> {
        instructions::nft::register_property_nft(ctx, property_value, property_address)
    }

    pub fn lock_property_nft(ctx: Context<LockPropertyNFT>) -> Result<()> {
        instructions::nft::lock_property_nft(ctx)
    }

    pub fn unlock_property_nft(ctx: Context<UnlockPropertyNFT>) -> Result<()> {
        instructions::nft::unlock_property_nft(ctx)
    }

    // Rewards instructions
    pub fn initialize_rewards(
        ctx: Context<InitializeRewards>,
        rewards_per_payment: u64,
    ) -> Result<()> {
        rewards::initialize_rewards(ctx, rewards_per_payment)
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        rewards::claim_rewards(ctx)
    }

    // Risk assessment instructions
    pub fn create_risk_assessment(
        ctx: Context<CreateRiskAssessment>,
        appraised_value: u64,
        risk_score: u8,
    ) -> Result<()> {
        risk_assessment::create_risk_assessment(ctx, appraised_value, risk_score)
    }

    pub fn update_risk_assessment(
        ctx: Context<UpdateRiskAssessment>,
        new_appraised_value: u64,
        new_risk_score: u8,
    ) -> Result<()> {
        risk_assessment::update_risk_assessment(ctx, new_appraised_value, new_risk_score)
    }

    pub fn invalidate_risk_assessment(ctx: Context<UpdateRiskAssessment>) -> Result<()> {
        risk_assessment::invalidate_risk_assessment(ctx)
    }

    // Governance instructions
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        parameter_key: String,
        new_value: u64,
        execution_delay: i64,
    ) -> Result<()> {
        governance::create_proposal(ctx, title, description, parameter_key, new_value, execution_delay)
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        amount: u64,
        support: bool,
    ) -> Result<()> {
        governance::cast_vote(ctx, amount, support)
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        governance::execute_proposal(ctx)
    }
}

