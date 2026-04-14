# Blockchain_CertificateVerificationSystem

VeriChain Academics is a certificate issuance and verification dApp backed by the `AcademicRegistry` smart contract.

## Recommended Mode: Sepolia (Persistent)

Use Sepolia if you want certificates to remain available across sessions.

### 1. Install Dependencies

```bash
npm install
npm --prefix frontend install
```

### 2. Configure Backend Environment

Create `.env` in the project root (copy from `.env.example`):

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

### 3. Configure Frontend Environment

Create `frontend/.env` (copy from `frontend/.env.example`):

```env
VITE_CHAIN_ID=11155111
VITE_CHAIN_NAME=Sepolia
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### 4. Deploy Contract to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

This rewrites `frontend/src/utils/contractData.json` with the deployed contract address and ABI.

### 5. Run Frontend

```bash
npm --prefix frontend run dev
```

Then connect MetaMask on Sepolia (`Chain ID 11155111`).

## Redeploy Note

Any redeploy updates the contract address. Always run the deploy script before using the UI, otherwise the frontend may call an old address.

## Persistence Note

Sepolia is persistent, so issued certificates remain available across sessions.

## Security Notes

1. Never commit `.env` files.
2. Use a burner wallet for `SEPOLIA_PRIVATE_KEY`.
3. Keep only small test funds in that wallet.