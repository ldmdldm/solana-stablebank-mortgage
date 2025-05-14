use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct RiskAssessment {
    pub authority: Pubkey,
    pub property: Pubkey,
    pub appraised_value: u64,
    pub risk_score: u8,
    pub assessment_date: i64,
    pub next_assessment_date: i64,
    pub is_valid: bool,
}

impl RiskAssessment {
    pub const LEN: usize = 8 + // discriminator
                          32 + // authority
                          32 + // property
                          8 + // appraised_value
                          1 + // risk_score
                          8 + // assessment_date
                          8 + // next_assessment_date
                          1; // is_valid
}

#[derive(Accounts)]
pub struct CreateRiskAssessment<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(init, payer = authority, space = RiskAssessment::LEN)]
    pub risk_assessment: Account<'info, RiskAssessment>,
    
    pub property_nft: Account<'info, PropertyNFT>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateRiskAssessment<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = risk_assessment.authority == authority.key()
    )]
    pub risk_assessment: Account<'info, RiskAssessment>,
}

pub fn create_risk_assessment(
    ctx: Context<CreateRiskAssessment>,
    appraised_value: u64,
    risk_score: u8,
) -> Result<()> {
    let risk_assessment = &mut ctx.accounts.risk_assessment;
    let clock = Clock::get()?;
    
    risk_assessment.authority = ctx.accounts.authority.key();
    risk_assessment.property = ctx.accounts.property_nft.key();
    risk_assessment.appraised_value = appraised_value;
    risk_assessment.risk_score = risk_score;
    risk_assessment.assessment_date = clock.unix_timestamp;
    risk_assessment.next_assessment_date = clock.unix_timestamp + 180 * 24 * 60 * 60; // 180 days
    risk_assessment.is_valid = true;
    
    Ok(())
}

pub fn update_risk_assessment(
    ctx: Context<UpdateRiskAssessment>,
    new_appraised_value: u64,
    new_risk_score: u8,
) -> Result<()> {
    let risk_assessment = &mut ctx.accounts.risk_assessment;
    let clock = Clock::get()?;
    
    require!(
        clock.unix_timestamp >= risk_assessment.next_assessment_date,
        ErrorCode::AssessmentTooEarly
    );
    
    risk_assessment.appraised_value = new_appraised_value;
    risk_assessment.risk_score = new_risk_score;
    risk_assessment.assessment_date = clock.unix_timestamp;
    risk_assessment.next_assessment_date = clock.unix_timestamp + 180 * 24 * 60 * 60;
    
    Ok(())
}

pub fn invalidate_risk_assessment(ctx: Context<UpdateRiskAssessment>) -> Result<()> {
    let risk_assessment = &mut ctx.accounts.risk_assessment;
    risk_assessment.is_valid = false;
    Ok(())
}
