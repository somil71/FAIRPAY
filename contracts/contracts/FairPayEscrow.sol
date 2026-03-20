// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IFairPayEscrow.sol";
import "./interfaces/IReputationNFT.sol";
import "./interfaces/IArbitrationPool.sol";

contract FairPayEscrow is IFairPayEscrow, ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    IReputationNFT public reputationNFT;
    IArbitrationPool public arbitrationPool;
    
    uint256 private _nextContractId;
    mapping(uint256 => EscrowContract) public contracts;
    mapping(address => uint256[]) public userContracts;

    event ContractCreated(uint256 indexed contractId, address indexed client, address indexed freelancer, uint256 totalAmount, address paymentToken);
    event MilestoneSubmitted(uint256 indexed contractId, uint256 indexed milestoneIndex, bytes32 submittedHash, uint256 windowDeadline);
    event MilestoneReleased(uint256 indexed contractId, uint256 indexed milestoneIndex, uint256 amount, address indexed recipient);
    event MilestoneRefunded(uint256 indexed contractId, uint256 indexed milestoneIndex, uint256 amount);
    event PartialReleaseExecuted(uint256 indexed contractId, uint256 indexed milestoneIndex, uint256 freelancerAmount, uint256 clientAmount);
    event DisputeRaised(uint256 indexed contractId, uint256 indexed milestoneIndex, address indexed raisedBy, uint256 disputedBps);
    event DisputeResolved(uint256 indexed contractId, uint256 indexed milestoneIndex, address indexed arbitrator, uint256 freelancerBps);
    event ContractCompleted(uint256 indexed contractId);
    event ContractCancelled(uint256 indexed contractId, uint256 refundAmount);
    event AutoVerified(uint256 indexed contractId, uint256 indexed milestoneIndex, bytes32 commitHash);

    error NotAuthorized(address caller, address expected);
    error InvalidMilestoneIndex(uint256 index, uint256 length);
    error InvalidMilestoneStatus(uint256 index, MilestoneStatus current, MilestoneStatus required);
    error DisputeWindowOpen(uint256 contractId, uint256 milestoneIndex, uint256 windowDeadline);
    error DisputeWindowExpired(uint256 contractId, uint256 milestoneIndex);
    error InvalidBpsTotal(uint256 sum);
    error InsufficientDisputeBond(uint256 sent, uint256 required);
    error ContractNotActive(uint256 contractId, ContractStatus status);
    error HashMismatch(bytes32 expected, bytes32 submitted);
    error TransferFailed();

    constructor(address _reputationNFT, address _arbitrationPool) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        reputationNFT = IReputationNFT(_reputationNFT);
        arbitrationPool = IArbitrationPool(_arbitrationPool);
    }

    modifier onlyActive(uint256 contractId) {
        if (contracts[contractId].status != ContractStatus.Active) {
            revert ContractNotActive(contractId, contracts[contractId].status);
        }
        _;
    }

    function createContract(
        address freelancer,
        address paymentToken,
        uint256 totalAmount,
        string calldata githubRepo,
        string calldata ipfsBriefCID,
        uint256 disputeBond,
        Milestone[] calldata _milestones
    ) external payable override nonReentrant whenNotPaused returns (uint256) {
        uint256 sumBps = 0;
        for(uint256 i = 0; i < _milestones.length; i++) {
            sumBps += _milestones[i].paymentBps;
        }
        if (sumBps != 10000) revert InvalidBpsTotal(sumBps);

        if (paymentToken == address(0)) {
            if (msg.value != totalAmount) revert TransferFailed();
        } else {
            IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), totalAmount);
        }

        uint256 contractId = _nextContractId++;
        
        EscrowContract storage ec = contracts[contractId];
        ec.client = msg.sender;
        ec.freelancer = freelancer;
        ec.paymentToken = paymentToken;
        ec.totalAmount = totalAmount;
        ec.releasedAmount = 0;
        ec.status = ContractStatus.Active;
        ec.githubRepo = githubRepo;
        ec.ipfsBriefCID = ipfsBriefCID;
        ec.createdAt = block.timestamp;
        ec.disputeBond = disputeBond;
        ec.retainerMode = false;
        
        for(uint256 i = 0; i < _milestones.length; i++) {
            ec.milestones.push(_milestones[i]);
            ec.milestones[i].status = MilestoneStatus.Pending;
        }

        userContracts[msg.sender].push(contractId);
        userContracts[freelancer].push(contractId);

        emit ContractCreated(contractId, msg.sender, freelancer, totalAmount, paymentToken);
        return contractId;
    }

    function submitMilestone(uint256 contractId, uint256 milestoneIndex, bytes32 deliverableHash) external override onlyActive(contractId) {
        EscrowContract storage ec = contracts[contractId];
        if (msg.sender != ec.freelancer) revert NotAuthorized(msg.sender, ec.freelancer);
        if (milestoneIndex >= ec.milestones.length) revert InvalidMilestoneIndex(milestoneIndex, ec.milestones.length);
        
        Milestone storage m = ec.milestones[milestoneIndex];
        if (m.status != MilestoneStatus.Pending) revert InvalidMilestoneStatus(milestoneIndex, m.status, MilestoneStatus.Pending);
        
        m.submittedHash = deliverableHash;
        m.submittedAt = block.timestamp;
        m.status = MilestoneStatus.Submitted;
        
        emit MilestoneSubmitted(contractId, milestoneIndex, deliverableHash, m.submittedAt + 48 hours);
    }

    function approveAndRelease(uint256 contractId, uint256 milestoneIndex) external override nonReentrant onlyActive(contractId) {
        EscrowContract storage ec = contracts[contractId];
        if (msg.sender != ec.client) revert NotAuthorized(msg.sender, ec.client);
        _release(contractId, milestoneIndex);
    }

    function releaseByDefault(uint256 contractId, uint256 milestoneIndex) external override nonReentrant onlyActive(contractId) {
        EscrowContract storage ec = contracts[contractId];
        if (milestoneIndex >= ec.milestones.length) revert InvalidMilestoneIndex(milestoneIndex, ec.milestones.length);
        Milestone storage m = ec.milestones[milestoneIndex];
        
        if (m.status != MilestoneStatus.Submitted) revert InvalidMilestoneStatus(milestoneIndex, m.status, MilestoneStatus.Submitted);
        if (block.timestamp < m.submittedAt + 48 hours) revert DisputeWindowOpen(contractId, milestoneIndex, m.submittedAt + 48 hours);
        
        _release(contractId, milestoneIndex);
    }

    function autoVerifyMilestone(uint256 contractId, uint256 milestoneIndex, bytes32 commitHash) external override nonReentrant onlyRole(VERIFIER_ROLE) onlyActive(contractId) {
        EscrowContract storage ec = contracts[contractId];
        if (milestoneIndex >= ec.milestones.length) revert InvalidMilestoneIndex(milestoneIndex, ec.milestones.length);
        Milestone storage m = ec.milestones[milestoneIndex];
        
        if (m.verificationMethod != VerificationMethod.GitHubCommit) {
            revert("Not a GitHub milestone");
        }
        
        m.submittedHash = commitHash;
        m.submittedAt = block.timestamp;
        m.status = MilestoneStatus.Submitted;
        emit AutoVerified(contractId, milestoneIndex, commitHash);
        
        _release(contractId, milestoneIndex);
    }

    function raiseDispute(uint256 contractId, uint256 milestoneIndex, uint256 disputedBps) external payable override nonReentrant onlyActive(contractId) {
        EscrowContract storage ec = contracts[contractId];
        if (msg.sender != ec.client) revert NotAuthorized(msg.sender, ec.client);
        if (msg.value < ec.disputeBond) revert InsufficientDisputeBond(msg.value, ec.disputeBond);
        if (disputedBps == 0 || disputedBps > 10000) revert InvalidBpsTotal(disputedBps);

        Milestone storage m = ec.milestones[milestoneIndex];
        if (m.status != MilestoneStatus.Submitted) revert InvalidMilestoneStatus(milestoneIndex, m.status, MilestoneStatus.Submitted);
        if (block.timestamp >= m.submittedAt + 48 hours) revert DisputeWindowExpired(contractId, milestoneIndex);

        m.disputedBps = disputedBps;
        m.arbitrator = arbitrationPool.assignArbitrator(contractId);

        if (disputedBps < 10000) {
            m.status = MilestoneStatus.PartialDispute;
            uint256 totalPayment = (ec.totalAmount * m.paymentBps) / 10000;
            uint256 undisputedAmount = (totalPayment * (10000 - disputedBps)) / 10000;
            
            ec.releasedAmount += undisputedAmount;
            _transfer(ec.paymentToken, ec.freelancer, undisputedAmount);
            emit PartialReleaseExecuted(contractId, milestoneIndex, undisputedAmount, 0);
        } else {
            m.status = MilestoneStatus.InDispute;
        }
        
        ec.status = ContractStatus.Disputed;
        emit DisputeRaised(contractId, milestoneIndex, msg.sender, disputedBps);
    }

    function resolveDispute(uint256 contractId, uint256 milestoneIndex, uint256 freelancerBps) external override nonReentrant {
        EscrowContract storage ec = contracts[contractId];
        Milestone storage m = ec.milestones[milestoneIndex];
        if (msg.sender != m.arbitrator) revert NotAuthorized(msg.sender, m.arbitrator);
        if (m.status != MilestoneStatus.InDispute && m.status != MilestoneStatus.PartialDispute) {
            revert InvalidMilestoneStatus(milestoneIndex, m.status, MilestoneStatus.InDispute);
        }
        
        m.resolution.freelancerBps = freelancerBps;
        m.resolution.arbitratorSigned = true;
        m.resolution.signatureDeadline = block.timestamp + 24 hours;
        
        emit DisputeResolved(contractId, milestoneIndex, msg.sender, freelancerBps);
    }

    function acknowledgeRuling(uint256 contractId, uint256 milestoneIndex) external nonReentrant {
        EscrowContract storage ec = contracts[contractId];
        Milestone storage m = ec.milestones[milestoneIndex];
        
        if (msg.sender == ec.client) {
            m.resolution.clientAcknowledged = true;
        } else if (msg.sender == ec.freelancer) {
            m.resolution.freelancerAcknowledged = true;
        } else {
            revert NotAuthorized(msg.sender, ec.client);
        }

        if ((m.resolution.clientAcknowledged && m.resolution.freelancerAcknowledged) || block.timestamp >= m.resolution.signatureDeadline) {
            _executeRuling(contractId, milestoneIndex);
        }
    }

    function _executeRuling(uint256 contractId, uint256 milestoneIndex) internal {
        EscrowContract storage ec = contracts[contractId];
        Milestone storage m = ec.milestones[milestoneIndex];
        
        if (!m.resolution.arbitratorSigned) revert("Arbitrator has not ruled");
        
        uint256 totalPayment = (ec.totalAmount * m.paymentBps) / 10000;
        uint256 disputedAmount = (totalPayment * m.disputedBps) / 10000;
        
        uint256 freelancerShare = (disputedAmount * m.resolution.freelancerBps) / 10000;
        uint256 clientShare = disputedAmount - freelancerShare;
        
        if (freelancerShare > 0) {
            ec.releasedAmount += freelancerShare;
            _transfer(ec.paymentToken, ec.freelancer, freelancerShare);
        }
        if (clientShare > 0) {
            _transfer(ec.paymentToken, ec.client, clientShare);
        }
        
        _transfer(address(0), ec.client, ec.disputeBond);

        m.status = MilestoneStatus.Released;
        _checkCompletion(contractId);
    }

    function cancelContract(uint256 contractId) external override nonReentrant onlyActive(contractId) {
        EscrowContract storage ec = contracts[contractId];
        if (msg.sender != ec.client && msg.sender != ec.freelancer) revert NotAuthorized(msg.sender, ec.client);
        
        for(uint256 i = 0; i < ec.milestones.length; i++) {
            if (ec.milestones[i].status != MilestoneStatus.Pending) {
                revert("Cannot cancel after progress");
            }
        }
        
        ec.status = ContractStatus.Cancelled;
        uint256 refundAmount = ec.totalAmount;
        _transfer(ec.paymentToken, ec.client, refundAmount);
        emit ContractCancelled(contractId, refundAmount);
    }

    function _release(uint256 contractId, uint256 milestoneIndex) internal {
        EscrowContract storage ec = contracts[contractId];
        Milestone storage m = ec.milestones[milestoneIndex];
        m.status = MilestoneStatus.Released;
        
        uint256 amount = (ec.totalAmount * m.paymentBps) / 10000;
        ec.releasedAmount += amount;
        
        _transfer(ec.paymentToken, ec.freelancer, amount);
        emit MilestoneReleased(contractId, milestoneIndex, amount, ec.freelancer);
        
        _checkCompletion(contractId);
    }

    function _transfer(address token, address to, uint256 amount) internal {
        if (amount == 0) return;
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    function _checkCompletion(uint256 contractId) internal {
        EscrowContract storage ec = contracts[contractId];
        bool allDone = true;
        for(uint256 i = 0; i < ec.milestones.length; i++) {
            if (ec.milestones[i].status != MilestoneStatus.Released && ec.milestones[i].status != MilestoneStatus.Refunded && ec.milestones[i].status != MilestoneStatus.PartialRelease) {
                allDone = false;
                break;
            }
        }
        
        if (allDone) {
            ec.status = ContractStatus.Completed;
            emit ContractCompleted(contractId);
        } else {
            ec.status = ContractStatus.Active;
        }
    }

    function getContract(uint256 contractId) external view override returns (EscrowContract memory) {
        return contracts[contractId];
    }

    function getMilestone(uint256 contractId, uint256 milestoneIndex) external view override returns (Milestone memory) {
        return contracts[contractId].milestones[milestoneIndex];
    }

    function getAllContracts(address party) external view override returns (uint256[] memory) {
        return userContracts[party];
    }
}
