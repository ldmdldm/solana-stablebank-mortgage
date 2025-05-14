use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

#[account]
#[derive(Default)]
pub struct RewardsPool {
    pub authority: Pubkey,
    pub reward_mint: Pubkey,
    pub reward_vault: Pubkey,
    pub rewards_per_payment: u64,
    pub total_rewards_distributed: u64,
    pub is_active: bool,
}

impl RewardsPool {
    pub const LEN: usize = 8 + // discriminator
                          32 + // authority
                          32 + // reward_mint
                          32 + // reward_vault
                          8 + // rewards_per_payment
                          8 + // total_rewards_distributed
                          1; // is_active
}

#[account]
#[derive(Default)]
pub struct UserRewards {
    pub user: Pubkey,
    pub rewards_earned: u64,
    pub rewards_claimed: u64,
    pub last_claim_timestamp: i64,
}

impl UserRewards {
    pub const LEN: usize = 8 + // discriminator
                          32 + // user
                          8 + // rewards_earned
                          8 + // rewards_claimed
                          8; // last_claim_timestamp
}

#[derive(Accounts)]
pub struct InitializeRewards<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(init, payer = authority, space = RewardsPool::LEN)]
    pub rewards_pool: Account<'info, RewardsPool>,
    
    pub reward_mint: Account<'info, token::Mint>,
    
    #[account(
        init,
        payer = authority,
        token::mint = reward_mint,
        token::authority = rewards_pool,
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        constraint = user_rewards.user == user.key()
    )]
    pub user_rewards: Account<'info, UserRewards>,
    
    #[account(mut)]
    pub rewards_pool: Account<'info, RewardsPool>,
    
    #[account(mut)]
    pub reward_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_reward_account.owner == user.key()
    )]
    pub user_reward_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn initialize_rewards(
    ctx: Context<InitializeRewards>,
    rewards_per_payment: u64,
) -> Result<()> {
    let rewards_pool = &mut ctx.accounts.rewards_pool;
    rewards_pool.authority = ctx.accounts.authority.key();
    rewards_pool.reward_mint = ctx.accounts.reward_mint.key();
    rewards_pool.reward_vault = ctx.accounts.reward_vault.key();
    rewards_pool.rewards_per_payment = rewards_per_payment;
    rewards_pool.total_rewards_distributed = 0;
    rewards_pool.is_active = true;
    Ok(())
}

pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
    let rewards_pool = &mut ctx.accounts.rewards_pool;
    let user_rewards = &mut ctx.accounts.user_rewards;
    
    let claimable_amount = user_rewards.rewards_earned.saturating_sub(user_rewards.rewards_claimed);
    require!(claimable_amount > 0, ErrorCode::NoRewardsToClaim);
    
    // Transfer rewards
    let seeds = &[
        b"rewards_pool".as_ref(),
        &[rewards_pool.bump],
    ];
    let signer = &[&seeds[..]];
    
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.reward_vault.to_account_info(),
                to: ctx.accounts.user_reward_account.to_account_info(),
                authority: rewards_pool.to_account_info(),
            },
            signer,
        ),
        claimable_amount,
    )?;
    
    user_rewards.rewards_claimed = user_rewards.rewards_claimed.saturating_add(claimable_amount);
    user_rewards.last_claim_timestamp = Clock::get()?.unix_timestamp;
    
    Ok(())
}
