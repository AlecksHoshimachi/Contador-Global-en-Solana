# Contador Global - Solana

Un contador global en la blockchain de Solana donde **todos pueden participar** y el número es el mismo para todos.

## Cómo usar

### Opción 1: Desde Solana Playground (más fácil)

1. Ve a [Solana Playground](https://beta.solpg.io/)
2. Crea un proyecto nuevo
3. Pega el código de `client.ts`
4. Cambia arriba a **"devnet"**
5. Conecta tu wallet
6. Ejecuta: `await subir()` para sumar +1 al contador global

### Opción 2: Local con Anchor

```bash
# Clonar repo
git clone https://github.com/tu-usuario/contador-global.git
cd contador-global

# Instalar dependencias
yarn install

# Tests
anchor test

# Ver contador
anchor run check

*Características*
Contador único global
Cualquiera puede incrementar/decrementar
Protección contra números negativos
Desplegado en devnet

*Program ID (Devnet)*
9uEtRDvWL8JB1iAXW52LBLADxQpf19xDZ52tZnycSS8F

