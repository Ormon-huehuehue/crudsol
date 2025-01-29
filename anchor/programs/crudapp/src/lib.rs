#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("4L2hQmYz9v1xqVB3ChoTakUPSGwwodCwB5jgpqDhxfVe");

#[program]
pub mod journal {
    use super::*;

    pub fn create_journal_entry(ctx : Context<CreateEntry>, title : String, message : String) -> Result<()>{
        let entry = &mut ctx.accounts.journal_entry;

        entry.owner = *ctx.accounts.owner.key;
        entry.title = title;
        entry.message = message;
        Ok(())
    }

    pub fn update_journal_entry(ctx : Context<UpdateEntry>, _title : String, message : String) -> Result<()>{

      let entry = &mut ctx.accounts.journal_entry;

      entry.message = message;

      Ok(())
    }

    pub fn delete_journal_entry(_ctx : Context<DeleteEntry>, title : String)-> Result<()>{
      msg!("Journal Entry : {} has been deleted", title);

      Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState{
  pub owner : Pubkey,
  #[max_len(50)]
  pub title : String,
  #[max_len(200)]
  pub message : String
}




#[derive(Accounts)]
#[instruction(title : String)]
pub struct CreateEntry<'info>{

  #[account(mut)]
  pub owner : Signer<'info>,

  #[account(
    init, 
    payer = owner,
    space = 8 + JournalEntryState::INIT_SPACE,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump
  )]

  pub journal_entry : Account<'info, JournalEntryState>,
  pub system_program : Program<'info, System>
}


#[derive(Accounts)]
#[instruction(title : String)]
pub struct UpdateEntry<'info>{
  #[account(mut)]
  pub owner : Signer<'info>,

  #[account(
    mut, 
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    realloc = 8 + JournalEntryState::INIT_SPACE,
    realloc::payer = owner,
    realloc::zero = true
  )]
  pub journal_entry : Account<'info, JournalEntryState>,
  pub system_program : Program<'info, System>
}



#[derive(Accounts)]
#[instruction(title : String)]
pub struct DeleteEntry<'info>{
  #[account(mut)]
  pub owner : Signer<'info>,

  #[account(
    mut, 
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    close = owner
  )]
  pub journal_entry : Account<'info, JournalEntryState>,
  pub system_program : Program<'info, System>
}