# ETH Todo List — Solidity + Truffle dApp

> A blockchain todo-list decentralized application built with Solidity and
> Truffle, demonstrating on-chain state management and event emission on
> Ethereum.

## Overview

A simple Ethereum dApp where tasks are stored on-chain in a smart contract.
Each task has an `id`, `content`, and `completed` flag. The contract emits
events on task creation and completion, enabling off-chain UI synchronization
and an auditable transaction log.

## Tech Stack

| Layer | Technology |
|---|---|
| Smart contract | Solidity ^0.5.0 |
| Framework | Truffle 5.0.2 |
| Dev blockchain | Ganache (127.0.0.1:7545) |
| Frontend dev server | lite-server |
| Testing | Chai · chai-as-promised · chai-bignumber |

## Smart Contract (`contracts/TodoList.sol`)

```solidity
pragma solidity ^0.5.0;

contract TodoList {
    uint public taskCount = 0;

    struct Task {
        uint id;
        string content;
        bool completed;
    }

    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content, bool completed);
    event TaskCompleted(uint id, bool completed);

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleCompleted(uint _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCompleted(_id, _task.completed);
    }
}
```

- `createTask` — increments `taskCount`, stores the task, emits `TaskCreated`.
- `toggleCompleted` — flips the completed flag, emits `TaskCompleted`.

## Setup & Usage

```bash
# 1. Install dependencies
npm install

# 2. Start a local Ganache blockchain on port 7545
#    Ganache GUI, or: npx ganache-cli -p 7545

# 3. Compile and migrate the contract
npx truffle compile
npx truffle migrate

# 4. Run the test suite
npx truffle test

# 5. Launch the frontend dev server
npm run dev     # lite-server → http://localhost:3000
```

## Project Structure

```
contracts/
  ├── Migrations.sol       # Truffle migration helper
  └── TodoList.sol         # Main todo-list contract
migrations/                # Deployment scripts
src/                       # Frontend (HTML / JS)
test/                      # Chai-based contract tests
build/                     # Compiled contract artifacts (Truffle output)
truffle-config.js          # Network + compiler config (Ganache :7545, optimizer 200 runs)
```

## Security Takeaways

- **On-chain state** — tasks live in contract storage; no central database can
  be altered without a valid signed transaction.
- **Event emission** — `TaskCreated` / `TaskCompleted` provide a tamper-evident,
  auditable log of all state changes.
- **Solidity ^0.5.0** — demonstrates pre-0.8 integer semantics, making this a
  useful baseline for discussing overflow protections (SafeMath → Solidity 0.8+
  checked arithmetic) and access-control patterns in a smart-contract security
  review.

## Note

This project is based on the
[Dapp University](https://www.dappuniversity.com/) Ethereum todo-list tutorial
and serves as a foundation for smart-contract security review practice —
reentrancy, integer overflow, and access-control analysis.
