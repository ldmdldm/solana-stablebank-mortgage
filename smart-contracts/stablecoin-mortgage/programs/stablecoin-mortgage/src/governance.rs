use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Proposal {
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub execution_time: i64,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub status: ProposalStatus,
    pub parameter_key: String,
    pub new_value: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Default)]
pub enum ProposalStatus {
    #[default]
    Active,
    Executed,
    Rejected,
    Expired,
}

impl Proposal {
    pub const BASE_LEN: usize = 8 + // discriminator
                               32 + // proposer
                               4 + // title string prefix
                               4 + // description string prefix
                               8 + // execution_time
                               8 + // yes_votes
                               8 + // no_votes
                               1 + // status
                               4 + // parameter_key string prefix
                               8; // new_value
    
    pub const MAX_TITLE_LEN: usize = 100;
    pub const MAX_DESCRIPTION_LEN: usize = 500;
    pub const MAX_PARAMETER_KEY_LEN: usize = 50;
}

#[account]
#[derive(Default)]
pub struct Vote {
    pub voter: Pubkey,
    pub proposal: Pubkey,
    pub amount: u64,
    pub support: bool,
}

impl Vote {
    pub const LEN: usize = 8 + // discriminator
                          32 + // voter
                          32 + // proposal
                          8 + // amount
                          1; // support
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    #[account(init, payer = proposer, space = 8 + Proposal::BASE_LEN + Proposal::MAX_TITLE_LEN + Proposal::MAX_DESCRIPTION_LEN + Proposal::MAX_PARAMETER_KEY_LEN)]
    pub proposal: Account<'info, Proposal>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        init,
        payer = voter,
        space = Vote::LEN,
        constraint = !vote.exists() @ ErrorCode::AlreadyVoted,
    )]
    pub vote: Account<'info, Vote>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = proposal.status == ProposalStatus::Active,
        constraint = Clock::get()?.unix_timestamp >= proposal.execution_time,
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub program_state: Account<'info, ProgramState>,
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    title: String,
    description: String,
    parameter_key: String,
    new_value: u64,
    execution_delay: i64,
) -> Result<()> {
    require!(
        title.len() <= Proposal::MAX_TITLE_LEN,
        ErrorCode::TitleTooLong
    );
    require!(
        description.len() <= Proposal::MAX_DESCRIPTION_LEN,
        ErrorCode::DescriptionTooLong
    );
    require!(
        parameter_key.len() <= Proposal::MAX_PARAMETER_KEY_LEN,
        ErrorCode::ParameterKeyTooLong
    );
    
    let proposal = &mut ctx.accounts.proposal;
    let clock = Clock::get()?;
    
    proposal.proposer = ctx.accounts.proposer.key();
    proposal.title = title;
    proposal.description = description;
    proposal.execution_time = clock.unix_timestamp + execution_delay;
    proposal.yes_votes = 0;
    proposal.no_votes = 0;
    proposal.status = ProposalStatus::Active;
    proposal.parameter_key = parameter_key;
    proposal.new_value = new_value;
    
    Ok(())
}

pub fn cast_vote(
    ctx: Context<CastVote>,
    amount: u64,
    support: bool,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let vote = &mut ctx.accounts.vote;
    
    vote.voter = ctx.accounts.voter.key();
    vote.proposal = proposal.key();
    vote.amount = amount;
    vote.support = support;
    
    if support {
        proposal.yes_votes = proposal.yes_votes.checked_add(amount)
            .ok_or(ErrorCode::VoteOverflow)?;
    } else {
        proposal.no_votes = proposal.no_votes.checked_add(amount)
            .ok_or(ErrorCode::VoteOverflow)?;
    }
    
    Ok(())
}

pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let program_state = &mut ctx.accounts.program_state;
    
    require!(
        proposal.yes_votes > proposal.no_votes,
        ErrorCode::InsufficientVotes
    );
    
    match proposal.parameter_key.as_str() {
        "min_loan_amount" => program_state.min_loan_amount = proposal.new_value,
        "max_loan_amount" => program_state.max_loan_amount = proposal.new_value,
        "min_loan_duration" => program_state.min_loan_duration = proposal.new_value,
        "max_loan_duration" => program_state.max_loan_duration = proposal.new_value,
        "min_interest_rate" => program_state.min_interest_rate = proposal.new_value,
        "max_interest_rate" => program_state.max_interest_rate = proposal.new_value,
        "liquidation_threshold" => program_state.liquidation_threshold = proposal.new_value,
        _ => return Err(ErrorCode::InvalidParameter.into()),
    }
    
    proposal.status = ProposalStatus::Executed;
    
    Ok(())
}
