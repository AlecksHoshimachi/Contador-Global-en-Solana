use anchor_lang::prelude::*;

declare_id!("9uEtRDvWL8JB1iAXW52LBLADxQpf19xDZ52tZnycSS8F"); // Playground lo cambia al guardar/compilar

#[program]
pub mod global_counter {
    use super::*;

    /// Inicializa el contador global en 0
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        msg!("Contador global inicializado en 0");
        Ok(())
    }

    /// Incrementa el contador global en +1
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1).ok_or(ErrorCode::Overflow)?;
        msg!("Contador global ahora es: {}", counter.count);
        Ok(())
    }

    /// (Opcional) Decrementa -1 (con chequeo para no ir negativo)
    pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        if counter.count == 0 {
            return err!(ErrorCode::CannotDecrementZero);
        }
        counter.count -= 1;
        msg!("Contador global ahora es: {}", counter.count);
        Ok(())
    }
}

#[account]
pub struct Counter {
    pub count: u64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 8,               // discriminator + u64
        seeds = [b"global-counter"], // semilla fija → PDA global
        bump
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"global-counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct Decrement<'info> {
    #[account(
        mut,
        seeds = [b"global-counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("No se puede decrementar cuando ya está en 0")]
    CannotDecrementZero,
    #[msg("Overflow aritmético: el contador no puede ser más grande")]
    Overflow,
}
