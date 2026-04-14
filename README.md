# Blockchain_CertificateVerificationSystem

## Local Development

1. Install dependencies in both workspaces.

```bash
npm install
npm --prefix frontend install
```

2. Start Hardhat local node on the port used by this project.

```bash
npx hardhat node --port 8546
```

3. In a new terminal, deploy the contract and sync frontend contract metadata.

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This updates `frontend/src/utils/contractData.json` with the current deployed address and ABI.

4. Start the frontend.

```bash
npm --prefix frontend run dev
```

## Important Redeploy Note

Whenever you redeploy `AcademicRegistry.sol`, run the deploy script again before using the UI:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

If you skip this, the frontend may call an old contract address and fail with selector/revert errors.

## Persistent Network Deployment

For real persistence across sessions, use Sepolia instead of the local Hardhat node.

1. Copy `.env.example` to `.env` and fill in your Sepolia RPC URL and private key.
2. Deploy to Sepolia:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. Connect MetaMask to Sepolia and use the deployed contract address written to `frontend/src/utils/contractData.json`.

Unlike the local Hardhat node, Sepolia keeps the contract state after you close the frontend or restart your machine.

## Local Chain Persistence

The `hardhat node` network is ephemeral. If you stop or restart the node, all issued certificates and contract state are cleared.

If a certificate verifies successfully in one session but fails later, make sure:

1. The same Hardhat node instance is still running on `8546`.
2. You have not redeployed the contract without reissuing the certificate.
3. MetaMask is connected to `Chain ID 31337`.