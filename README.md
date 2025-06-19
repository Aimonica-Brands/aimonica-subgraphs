## Dependencies

- [Graph CLI](https://github.com/graphprotocol/graph-cli)
    - Required to generate and build local GraphQL dependencies
    - Install with npm: `npm install -g @graphprotocol/graph-cli`

```shell
# Install project dependencies
npm install
```

## Deployment Guide

### 1. Subgraph Setup
- Create a new subgraph at [The Graph Studio](https://thegraph.com/studio/)
- Name format suggestion: `<project-name>-<subgraph-name>` (e.g. `aim-staking`)

### 2. Authentication
```shell
# Authenticate with Graph CLI
graph auth <DEPLOY_KEY>
```
- Find DEPLOY_KEY in Subgraph Studio Dashboard

### 3. Configuration
```shell
cd subgraphs/aim-staking
```
- Edit `subgraph.yaml`:
  - Verify `network` name matches chain (e.g. "mainnet/base/arbitrum-one")
  - Update `address` with contract addresses
  - Set `startBlock` to contract creation block

### 4. Code Generation
```shell
# Generate TypeScript types and schema
graph codegen
```

### 5. Build Process
```shell
# Compile subgraph and verify configuration
graph build
```
- Fix any compilation errors before proceeding

### 6. Initial Deployment
```shell
# Deploy to Studio development environment, SUBGRAPH_NAME is the name of the subgraph you created in the first step
graph deploy <SUBGRAPH_NAME>
```

### 7. Post-Deployment
1. In Graph Studio:
   - Find Development Query URL under "Endpoints" tab (Rate limited)
   - Format: `https://api.studio.thegraph.com/query/<ID>/<subgraph>/version/latest`

### 8. Production Deployment
1. In Subgraph Studio:
   - Click "Publish" to deploy to Arbitrum Mainnet
   - Requirements:
     - ARB_ETH for gas fees
     - Optional GRT signaling for indexing priority

### 9. Production Endpoints
```shell
# Mainnet Query URL format:
https://gateway.thegraph.com/api/<API_KEY>/subgraphs/id/<DEPLOYMENT_ID>
```
- Find Production Query URL under "Endpoints" tab
- Manage API keys at [Graph Studio API Dashboard](https://thegraph.com/studio/apikeys/)
- Monitor usage and remaining quota regularly

## Important Notes
- 💡 Always test in development environment before mainnet deployment
- 💡 Free tier includes daily query quota (check current limits)
- 💡 Keep subgraph versioning consistent with contract deployments