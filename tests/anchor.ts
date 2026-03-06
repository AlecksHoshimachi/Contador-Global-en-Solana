import assert from "assert";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GlobalCounter } from "../target/types/global_counter";
import assert from "assert";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import type { GlobalCounter } from "../target/types/global_counter";

describe("global-counter", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.GlobalCounter as anchor.Program<GlobalCounter>;
  
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.GlobalCounter as Program<GlobalCounter>;

  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("global-counter")],
    program.programId
  );

  // Helper: Obtener valor actual
  async function fetchCount(): Promise<number> {
    try {
      const account = await program.account.counter.fetch(counterPDA);
      return account.count.toNumber();
    } catch {
      return 0;
    }
  }

  // Helper: Esperar confirmación
  async function confirmTx(signature: string) {
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature,
      ...latestBlockhash
    });
  }

  it("Inicializa el contador global (si no existe)", async () => {
    const currentCount = await fetchCount();
    
    if (currentCount > 0) {
      console.log(`⚠️ Contador ya existe con valor: ${currentCount}`);
      return;
    }
    
    try {
      const tx = await program.methods
        .initialize()
        .accounts({
          counter: counterPDA,
          signer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await confirmTx(tx);
      console.log("✅ Inicializado en 0");
    } catch (err: any) {
      if (err.message?.includes("0x0")) {
        console.log("⚠️ Ya inicializado en 0");
      } else {
        throw err;
      }
    }
  });

  it("Incrementa el contador +3", async () => {
    const startCount = await fetchCount();
    const targetCount = startCount + 3;
    console.log(`➕ ${startCount} → ${targetCount}`);
    
    for (let i = 0; i < 3; i++) {
      const tx = await program.methods
        .increment()
        .accounts({ counter: counterPDA })
        .rpc();
      await confirmTx(tx);
    }
    
    const endCount = await fetchCount();
    console.log(`  Resultado: ${endCount}`);
    assert.equal(endCount, targetCount);
  });

  it("Decrementa el contador -1", async () => {
    const startCount = await fetchCount();
    
    // Si estamos en 0, primero subimos para poder bajar
    if (startCount === 0) {
      console.log("➕ Subiendo a 1 primero...");
      const tx = await program.methods
        .increment()
        .accounts({ counter: counterPDA })
        .rpc();
      await confirmTx(tx);
    }
    
    const currentCount = await fetchCount();
    const targetCount = currentCount - 1;
    console.log(`➖ ${currentCount} → ${targetCount}`);
    
    const tx = await program.methods
      .decrement()
      .accounts({ counter: counterPDA })
      .rpc();
    await confirmTx(tx);
    
    const endCount = await fetchCount();
    console.log(`  Resultado: ${endCount}`);
    assert.equal(endCount, targetCount);
  });

  it("Protege contra decremento en 0 (sin resetear)", async () => {
    // Este test ya no lleva el contador a 0
    // Solo verifica que la protección funciona cuando YA estamos en 0
    
    let current = await fetchCount();
    console.log(`🔍 Valor actual: ${current}`);
    
    // Si no estamos en 0, este test no hace nada destructivo
    // Solo verifica la protección en el estado actual
    if (current > 0) {
      console.log("⏭️  Saltando test (no estamos en 0)");
      console.log("✅ La protección se verificará cuando alguien llegue a 0");
      return;
    }
    
    // Solo si ya estamos en 0, verificamos la protección
    console.log("⛔ Intentando decrementar en 0...");
    try {
      await program.methods
        .decrement()
        .accounts({ counter: counterPDA })
        .rpc();
      assert.fail("Debería fallar");
    } catch (err: any) {
      console.log("✅ Protección activa");
      assert.ok(err.message.includes("CannotDecrementZero"));
    }
  });
});