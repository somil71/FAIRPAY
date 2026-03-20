// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IFairPayEscrow.sol";

contract RetainerEscrow is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    struct RetainerPeriod {
        uint256 startDate;
        uint256 endDate;
        MilestoneStatus status;
        bytes32 deliverableHash;
        uint256 submittedAt;
    }

    struct RetainerContract {
        address client;
        address freelancer;
        address paymentToken;
        uint256 monthlyRate;
        uint256 totalMonthsLocked;
        uint256 periodsCompleted;
        ContractStatus status;
        RetainerPeriod[] periods;
    }

    mapping(uint256 => RetainerContract) public retainers;
    uint256 private _nextRetainerId;

    event RetainerOpened(uint256 indexed id, address indexed client, address indexed freelancer);
    event PeriodSubmitted(uint256 indexed id, uint256 periodIndex, bytes32 hash);
    event PeriodReleased(uint256 indexed id, uint256 periodIndex, uint256 amount);
    event RetainerCancelled(uint256 indexed id, uint256 noticePeriodMonths);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function openRetainer(address freelancer, address paymentToken, uint256 monthlyRate, uint256 months) external payable returns (uint256) {
        uint256 totalAmount = monthlyRate * months;
        if (paymentToken == address(0)) {
            require(msg.value == totalAmount, "Invalid ETH amount");
        } else {
            IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), totalAmount);
        }

        uint256 id = _nextRetainerId++;
        RetainerContract storage rc = retainers[id];
        rc.client = msg.sender;
        rc.freelancer = freelancer;
        rc.paymentToken = paymentToken;
        rc.monthlyRate = monthlyRate;
        rc.totalMonthsLocked = months;
        rc.status = ContractStatus.Active;

        rc.periods.push(RetainerPeriod({
            startDate: block.timestamp,
            endDate: block.timestamp + 30 days,
            status: MilestoneStatus.Pending,
            deliverableHash: bytes32(0),
            submittedAt: 0
        }));

        emit RetainerOpened(id, msg.sender, freelancer);
        return id;
    }

    function submitPeriod(uint256 id, uint256 periodIndex, bytes32 hash) external {
        RetainerContract storage rc = retainers[id];
        require(msg.sender == rc.freelancer, "Not freelancer");
        require(periodIndex == rc.periods.length - 1, "Not active period");
        RetainerPeriod storage rp = rc.periods[periodIndex];
        require(rp.status == MilestoneStatus.Pending, "Not pending");

        rp.deliverableHash = hash;
        rp.status = MilestoneStatus.Submitted;
        rp.submittedAt = block.timestamp;

        emit PeriodSubmitted(id, periodIndex, hash);
    }

    function releasePeriod(uint256 id, uint256 periodIndex) external nonReentrant {
        RetainerContract storage rc = retainers[id];
        RetainerPeriod storage rp = rc.periods[periodIndex];
        require(rp.status == MilestoneStatus.Submitted, "Not submitted");
        
        bool isClient = msg.sender == rc.client;
        bool isDefault = block.timestamp >= rp.submittedAt + 48 hours;
        require(isClient || isDefault, "Cannot release yet");

        rp.status = MilestoneStatus.Released;
        rc.periodsCompleted++;
        
        if (rc.paymentToken == address(0)) {
            (bool s, ) = rc.freelancer.call{value: rc.monthlyRate}("");
            require(s, "Transfer fail");
        } else {
            IERC20(rc.paymentToken).safeTransfer(rc.freelancer, rc.monthlyRate);
        }

        emit PeriodReleased(id, periodIndex, rc.monthlyRate);
    }

    function openNextPeriod(uint256 id) external {
        RetainerContract storage rc = retainers[id];
        require(rc.periods.length < rc.totalMonthsLocked, "All periods complete");
        RetainerPeriod storage lastRp = rc.periods[rc.periods.length - 1];
        require(lastRp.status == MilestoneStatus.Released, "Last period not released");

        rc.periods.push(RetainerPeriod({
            startDate: block.timestamp,
            endDate: block.timestamp + 30 days,
            status: MilestoneStatus.Pending,
            deliverableHash: bytes32(0),
            submittedAt: 0
        }));
    }

    function cancelRetainer(uint256 id, uint256 noticePeriodMonths) external {
        RetainerContract storage rc = retainers[id];
        require(msg.sender == rc.client, "Only client");
        require(rc.status == ContractStatus.Active, "Not active");

        rc.status = ContractStatus.Cancelled;
        uint256 remainingMonths = rc.totalMonthsLocked - rc.periodsCompleted;
        if (remainingMonths > noticePeriodMonths) {
            uint256 refundMonths = remainingMonths - noticePeriodMonths;
            uint256 refundAmount = refundMonths * rc.monthlyRate;
            
            if (rc.paymentToken == address(0)) {
                (bool s, ) = rc.client.call{value: refundAmount}("");
                require(s, "Refund fail");
            } else {
                IERC20(rc.paymentToken).safeTransfer(rc.client, refundAmount);
            }
        }
        
        emit RetainerCancelled(id, noticePeriodMonths);
    }
}
