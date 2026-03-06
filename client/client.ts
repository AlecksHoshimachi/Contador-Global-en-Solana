import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
// Ver valor del contador global - Solana Playground (CORREGIDO)
import { PublicKey, SystemProgram } from "@solana/web3.js";
import type { GlobalCounter } from "../target/types/global_counter";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.GlobalCounter as anchor.Program<GlobalCounter>;


const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("global-counter")],
  program.programId
);

console.log("🔍 PDA:", counterPDA.toString());

try {
  const account = await program.account.counter.fetch(counterPDA);
  console.log("╔════════════════════════════════════╗");
  console.log("║      🌍 CONTADOR GLOBAL            ║");
  console.log("╠════════════════════════════════════╣");
  console.log("║  Valor actual:", account.count.toNumber(), "              ║");
  console.log("╚════════════════════════════════════╝");
} catch (e) {
  console.log("❌ No inicializado. Ejecuta test primero.");
}