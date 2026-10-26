// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FundEscrowLedger
 * @dev Page 3 of the FlashRelief Public Notebook (Polygon PoS).
 * Enforces programmatic departmental fund locks. Ensures relief money
 * cannot be diverted to general treasury expenditures.
 */
contract FundEscrowLedger {
    enum VaultState { PRE_ALLOCATED, LOCKED, RELEASING, SETTLED }

    struct DepartmentVault {
        bytes32 departmentId;     // e.g. keccak256("food_civil_supplies")
        string departmentName;   // e.g. "Food, Civil Supplies & Consumer Affairs"
        uint256 allocatedPaise;  // Approved by Budget Quorum
        uint256 disbursedPaise;  // Released to district field accounts
        uint256 provenPaise;     // Mathematically backed by Stage 05 receipts
        VaultState state;
        uint64 createdAt;
        uint64 updatedAt;
    }

    address public admin;
    address public treasuryOfficer;
    
    // eventId => departmentId => Vault
    mapping(bytes32 => mapping(bytes32 => DepartmentVault)) public vaults;
    mapping(bytes32 => bytes32[]) public eventDepartments;

    event VaultCreated(bytes32 indexed eventId, bytes32 indexed departmentId, string departmentName, uint256 allocatedPaise);
    event FundsDisbursed(bytes32 indexed eventId, bytes32 indexed departmentId, uint256 tranchePaise, uint256 totalDisbursedPaise);
    event ProofAttested(bytes32 indexed eventId, bytes32 indexed departmentId, uint256 provenPaiseIncrement, uint256 totalProvenPaise);
    event VaultSettled(bytes32 indexed eventId, bytes32 indexed departmentId, uint256 finalDisbursed, uint256 finalProven);

    modifier onlyTreasury() {
        require(msg.sender == treasuryOfficer || msg.sender == admin, "FundEscrowLedger: caller is not treasury officer");
        _;
    }

    constructor(address _treasuryOfficer) {
        admin = msg.sender;
        treasuryOfficer = _treasuryOfficer;
    }

    function createVault(
        bytes32 eventId,
        bytes32 departmentId,
        string calldata departmentName,
        uint256 allocatedPaise
    ) external onlyTreasury {
        require(vaults[eventId][departmentId].createdAt == 0, "Vault already exists");

        vaults[eventId][departmentId] = DepartmentVault({
            departmentId: departmentId,
            departmentName: departmentName,
            allocatedPaise: allocatedPaise,
            disbursedPaise: 0,
            provenPaise: 0,
            state: VaultState.LOCKED,
            createdAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp)
        });

        eventDepartments[eventId].push(departmentId);
        emit VaultCreated(eventId, departmentId, departmentName, allocatedPaise);
    }

    function recordDisbursement(
        bytes32 eventId,
        bytes32 departmentId,
        uint256 tranchePaise
    ) external onlyTreasury {
        DepartmentVault storage v = vaults[eventId][departmentId];
        require(v.createdAt > 0, "Vault does not exist");
        require(v.disbursedPaise + tranchePaise <= v.allocatedPaise, "Exceeds approved allocation");

        v.disbursedPaise += tranchePaise;
        v.state = VaultState.RELEASING;
        v.updatedAt = uint64(block.timestamp);

        emit FundsDisbursed(eventId, departmentId, tranchePaise, v.disbursedPaise);
    }

    function attestDeliveryProof(
        bytes32 eventId,
        bytes32 departmentId,
        uint256 verifiedPaise
    ) external {
        DepartmentVault storage v = vaults[eventId][departmentId];
        require(v.createdAt > 0, "Vault does not exist");

        v.provenPaise += verifiedPaise;
        v.updatedAt = uint64(block.timestamp);

        emit ProofAttested(eventId, departmentId, verifiedPaise, v.provenPaise);

        if (v.provenPaise >= v.disbursedPaise && v.disbursedPaise > 0) {
            v.state = VaultState.SETTLED;
            emit VaultSettled(eventId, departmentId, v.disbursedPaise, v.provenPaise);
        }
    }
}
