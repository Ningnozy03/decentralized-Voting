// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Create {
    using Counters for Counters.Counter;

    Counters.Counter public _voterId;
    Counters.Counter public _candidateId;

    address public votingOrganizer;

    // CANDIDATE FOR VOTING
    struct Candidate {
        uint256 candidateId;
        string age;
        string name;
        string image; // Image stored in IPFS
        uint256 voteCount;
        address _address;
        string ipfs; // IPFS reference for candidate details
    }

    event CandidateCreate(
        uint256 indexed candidateId,
        string age,
        string name,
        string image,
        uint256 voteCount,
        address _address,
        string ipfs
    );

    address[] public CandidateAddress;

    mapping(address => Candidate) public candidates;

    // VOTER DATA
    address[] public votedVoters;
    address[] public voterAddress;
    mapping(address => Voter) public voters;

    struct Voter {
        uint256 voter_voterId;
        string voter_name;
        string voter_image; // Image stored in IPFS
        address voter_address;
        uint256 voter_allow;
        bool voter_voted;
        string ipfs; // IPFS reference for voter details
        uint256 voter_voteCount;
    }

    event VoterCreated(
        uint256 indexed voter_voterId,
        string voter_name,
        string voter_image,
        address voter_address,
        uint256 voter_allow,
        bool voter_voted,
        string ipfs
    );

    constructor() {
        votingOrganizer = msg.sender;
    }

    // CANDIDATE FUNCTIONS
    function setCandidate(
        address _address,
        string memory _name,
        string memory _age,
        string memory _image,
        string memory _ipfs
    ) public {
        require(votingOrganizer == msg.sender, "ONLY ORGANIZER CAN AUTHORIZE CANDIDATE");

        _candidateId.increment();
        uint256 idNumber = _candidateId.current();

        Candidate storage candidate = candidates[_address];
        candidate.age = _age;
        candidate.name = _name;
        candidate.candidateId = idNumber;
        candidate.image = _image;
        candidate.voteCount = 0;
        candidate._address = _address;
        candidate.ipfs = _ipfs;

        CandidateAddress.push(_address);

        emit CandidateCreate(idNumber, _age, _name, _image, candidate.voteCount, _address, _ipfs);
    }

    function getCandidate() public view returns (address[] memory) {
        return CandidateAddress;
    }

    function getCandidateLength() public view returns (uint256) {
        return CandidateAddress.length;
    }

    function getCandidatedata(address _address)
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            string memory,
            uint256,
            string memory,
            address
        )
    {
        return (
            candidates[_address].age,
            candidates[_address].name,
            candidates[_address].candidateId,
            candidates[_address].image,
            candidates[_address].voteCount,
            candidates[_address].ipfs,
            candidates[_address]._address
        );
    }

    // VOTER FUNCTIONS
    function voterRight(
        address _address,
        string memory _name,
        string memory _image,
        string memory _ipfs
    ) public {
        require(votingOrganizer == msg.sender, "ONLY ORGANIZER CAN CREATE VOTER");

        _voterId.increment();
        uint256 idNumber = _voterId.current();

        Voter storage voter = voters[_address];
        require(voter.voter_allow == 0, "Voter already exists");

        voter.voter_allow = 1;
        voter.voter_name = _name;
        voter.voter_image = _image;
        voter.voter_address = _address;
        voter.voter_voterId = idNumber;
        voter.voter_voted = false;
        voter.ipfs = _ipfs;

        voterAddress.push(_address);

        emit VoterCreated(idNumber, _name, _image, _address, voter.voter_allow, voter.voter_voted, _ipfs);
    }

    function vote(address _candidateAddress, uint256 _candidateVoteId) external {
        Voter storage voter = voters[msg.sender];
        require(!voter.voter_voted, "YOU HAVE ALREADY VOTED !");
        require(voter.voter_allow != 0, "YOU HAVE NO RIGHT TO VOTE");

        voter.voter_voted = true;
        voter.voter_voteCount = _candidateVoteId;

        votedVoters.push(msg.sender);

        candidates[_candidateAddress].voteCount += voter.voter_allow;
    }

    function getVoterLength() public view returns (uint256) {
        return voterAddress.length;
    }

    function getVoterdata(address _address)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            address,
            string memory,
            uint256,
            bool
        )
    {
        return (
            voters[_address].voter_voterId,
            voters[_address].voter_name,
            voters[_address].voter_image,
            voters[_address].voter_address,
            voters[_address].ipfs,
            voters[_address].voter_allow,
            voters[_address].voter_voted
        );
    }

    function getVotedVoterList() public view returns (address[] memory) {
        return votedVoters;
    }

    function getVoterList() public view returns (address[] memory) {
        return voterAddress;
    }
}
