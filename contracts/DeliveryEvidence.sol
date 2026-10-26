// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DeliveryEvidence
 * @dev Page 4 of the FlashRelief Public Notebook (Polygon PoS).
 * Implements the "Third Number" audit: mathematical proof that relief
 * reached verified citizens at exact GPS coordinates.
 */
contract DeliveryEvidence {
    struct DeliveryProof {
        bytes32 lineItemId;       // SDRF norm code (e.g. keccak256("SDRF-01-RATIONS"))
        string itemType;          // "Ration Kits" | "Emergency Shelter" | "Cattle Fodder"
        string vendorName;        // e.g. "Assam State Civil Supplies Corp"
        string ipfsCid;           // IPFS CID of photos, biometric logs, weighbridge slips
        int32 latitudeE6;         // Latitude * 1,000,000 (e.g. 27.472800 -> 27472800)
        int32 longitudeE6;        // Longitude * 1,000,000 (e.g. 94.912000 -> 94912000)
        uint32 beneficiaryCount;  // Verified recipients count
        uint256 deliveredPaise;   // Monetary value of delivered tranche
        uint64 timestamp;         // Delivery timestamp
        address submitter;        // Field delivery officer or verified NGO
    }

    address public admin;
    mapping(bytes32 => DeliveryProof[]) public lineItemProofs;
    mapping(bytes32 => uint256) public totalProvenPaise;
    uint256 public totalGlobalProofs;

    event DeliveryProofRegistered(
        bytes32 indexed lineItemId,
        string itemType,
        string ipfsCid,
        int32 latitudeE6,
        int32 longitudeE6,
        uint32 beneficiaryCount,
        uint256 deliveredPaise,
        address indexed submitter
    );

    constructor() {
        admin = msg.sender;
    }

    function recordProof(
        bytes32 lineItemId,
        string calldata itemType,
        string calldata vendorName,
        string calldata ipfsCid,
        int32 latitudeE6,
        int32 longitudeE6,
        uint32 beneficiaryCount,
        uint256 deliveredPaise
    ) external returns (bytes32 proofHash) {
        DeliveryProof memory proof = DeliveryProof({
            lineItemId: lineItemId,
            itemType: itemType,
            vendorName: vendorName,
            ipfsCid: ipfsCid,
            latitudeE6: latitudeE6,
            longitudeE6: longitudeE6,
            beneficiaryCount: beneficiaryCount,
            deliveredPaise: deliveredPaise,
            timestamp: uint64(block.timestamp),
            submitter: msg.sender
        });

        lineItemProofs[lineItemId].push(proof);
        totalProvenPaise[lineItemId] += deliveredPaise;
        totalGlobalProofs += 1;

        proofHash = keccak256(abi.encode(proof, block.number));

        emit DeliveryProofRegistered(
            lineItemId,
            itemType,
            ipfsCid,
            latitudeE6,
            longitudeE6,
            beneficiaryCount,
            deliveredPaise,
            msg.sender
        );
    }

    function getProofCount(bytes32 lineItemId) external view returns (uint256) {
        return lineItemProofs[lineItemId].length;
    }

    function getProof(bytes32 lineItemId, uint256 index) external view returns (DeliveryProof memory) {
        require(index < lineItemProofs[lineItemId].length, "Index out of bounds");
        return lineItemProofs[lineItemId][index];
    }
}
