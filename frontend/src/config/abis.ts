const ABI = {
  FairPayEscrow: [
    {
      "inputs": [
        {"internalType": "uint256","name": "contractId","type": "uint256"},
        {"internalType": "uint256","name": "milestoneIndex","type": "uint256"},
        {"internalType": "bytes32","name": "deliverableHash","type": "bytes32"}
      ],
      "name": "submitMilestone",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "uint256","name": "contractId","type": "uint256"},
        {"internalType": "uint256","name": "milestoneIndex","type": "uint256"}
      ],
      "name": "approveAndRelease",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "uint256","name": "contractId","type": "uint256"},
        {"internalType": "uint256","name": "milestoneIndex","type": "uint256"},
        {"internalType": "uint256","name": "disputedBps","type": "uint256"}
      ],
      "name": "raiseDispute",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ]
};
export default ABI;
