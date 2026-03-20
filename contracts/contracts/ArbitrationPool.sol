// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IArbitrationPool.sol";
import "./interfaces/IReputationNFT.sol";

contract ArbitrationPool is AccessControl, IArbitrationPool {
    bytes32 public constant ESCROW_ROLE = keccak256("ESCROW_ROLE");
    
    IReputationNFT public reputationNFT;
    
    mapping(address => ArbitratorDetails) public arbitrators;
    address[] public activeArbitrators;

    event ArbitratorRegistered(address indexed arb, uint256 tokenId);
    event ArbitratorAssigned(address indexed arb, uint256 contractId);
    event ArbitratorSlashed(address indexed arb, uint256 tokenId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setReputationNFT(address _nft) external onlyRole(DEFAULT_ADMIN_ROLE) {
        reputationNFT = IReputationNFT(_nft);
    }

    function register(uint256 reputationTokenId, string[] calldata specialties) external {
        require(!arbitrators[msg.sender].isActive, "Already registered");

        arbitrators[msg.sender] = ArbitratorDetails({
            reputationTokenId: reputationTokenId,
            specialties: specialties,
            activeCases: 0,
            slashHistory: 0,
            isActive: true
        });
        activeArbitrators.push(msg.sender);
        
        emit ArbitratorRegistered(msg.sender, reputationTokenId);
    }

    function assignArbitrator(uint256 contractId) external onlyRole(ESCROW_ROLE) returns (address) {
        require(activeArbitrators.length > 0, "No arbitrators available");
        
        address bestArb = address(0);
        uint256 minCases = type(uint256).max;
        uint256 bestScore = 0;
        
        for (uint256 i = 0; i < activeArbitrators.length; i++) {
            address arb = activeArbitrators[i];
            if (arbitrators[arb].isActive) {
                if (arbitrators[arb].activeCases < minCases) {
                    minCases = arbitrators[arb].activeCases;
                    bestArb = arb;
                    ScoreBreakdown memory sb = reputationNFT.getReputationScore(arb);
                    bestScore = sb.score;
                } else if (arbitrators[arb].activeCases == minCases) {
                    ScoreBreakdown memory sb = reputationNFT.getReputationScore(arb);
                    if (sb.score > bestScore) {
                        bestScore = sb.score;
                        bestArb = arb;
                    }
                }
            }
        }
        
        require(bestArb != address(0), "No suitable arbitrator");
        arbitrators[bestArb].activeCases++;
        emit ArbitratorAssigned(bestArb, contractId);
        return bestArb;
    }

    function slashArbitrator(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        reputationNFT.slashCredential(tokenId);
        for(uint256 i = 0; i < activeArbitrators.length; i++) {
            address arb = activeArbitrators[i];
            if (arbitrators[arb].reputationTokenId == tokenId) {
                arbitrators[arb].slashHistory++;
                if (arbitrators[arb].slashHistory >= 2) {
                    arbitrators[arb].isActive = false;
                }
                emit ArbitratorSlashed(arb, tokenId);
                break;
            }
        }
    }

    function getArbitratorDetails(address arb) external view returns (ArbitratorDetails memory) {
        return arbitrators[arb];
    }
}
