// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../dev/functions/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/dev/functions/FunctionsClient.sol"; // Once published
// import "https://github.com/smartcontractkit/functions-hardhat-starter-kit/blob/main/contracts/dev/functions/FunctionsClient.sol";

import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStableCoin is IERC20 {
  function mint(address to, uint256 amount) external;

  function decimals() external returns (uint8);
}

/**
 * @title Functions Copns contract
 * @notice This contract is a demonstration of using Functions.
 * @notice NOT FOR PRODUCTION USE
 */
contract RecordLabel is FunctionsClient, ConfirmedOwner {
  using Functions for Functions.Request;

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;
  string public latestArtistRequestedId;

  address public s_stc; // SimpleStableCoin address for payouts.

  error RecordLabel_ArtistPaymentError(string artistId, uint256 payment, string errorMsg);

  struct Artist {
    string name;
    string email;
    string artistId;
    uint256 lastListenerCount;
    uint256 lastPaidAmount;
    uint256 totalPaid;
    address walletAddress;
  }

  mapping(string => Artist) artistData; // Mapping that uses the ArtistID as the key.

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);
  event ArtistPaid(string artistId, uint256 amount);

  /**
   * @notice Executes once when a contract is created to initialize state variables
   *
   * @param oracle - The FunctionsOracle contract
   * @param stablecoin - stablecoin contract address for paying the artists.
   */
  // https://github.com/protofire/solhint/issues/242
  // solhint-disable-next-line no-empty-blocks
  constructor(address oracle, address stablecoin) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {
    s_stc = stablecoin;
  }

  /**
   * @notice Send a simple request
   *
   * @param source JavaScript source code
   * @param secrets Encrypted secrets payload
   * @param args List of arguments accessible from within the source code
   * @param subscriptionId Billing ID
   * @param gasLimit Maximum amount of gas used to call the client contract's `handleOracleFulfillment` function
   * @return Functions request ID
   */
  function executeRequest(
    string calldata source,
    bytes calldata secrets,
    string[] calldata args, // args in sequence are: ArtistID, artistname,  lastListenerCount, artist email
    uint64 subscriptionId,
    uint32 gasLimit
  ) public onlyOwner returns (bytes32) {
    // TODO: implement executeRequest()
  }

  /**
   * @notice Callback that is invoked once the DON has resolved the request or hit an error
   *
   * @param requestId The request ID, returned by sendRequest()
   * @param response Aggregated response from the user code
   * @param err Aggregated error from the user code or from the execution pipeline
   * Either response or error parameter will be set, but never both
   */
  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    //TODO implement fulfillRequest()
  }

  function setArtistData(
    string memory artistId,
    string memory name,
    string memory email,
    uint256 lastListenerCount,
    uint256 lastPaidAmount,
    uint256 totalPaid,
    address walletAddress
  ) public onlyOwner {
    artistData[artistId].artistId = artistId;
    artistData[artistId].name = name;
    artistData[artistId].email = email;
    artistData[artistId].lastListenerCount = lastListenerCount;
    artistData[artistId].lastPaidAmount = lastPaidAmount;
    artistData[artistId].totalPaid = totalPaid;
    artistData[artistId].walletAddress = walletAddress;
  }

  function payArtist(string memory artistId, uint256 amountDue) internal {
    IStableCoin token = IStableCoin(s_stc);
    if (artistData[artistId].walletAddress == address(0)) {
      revert RecordLabel_ArtistPaymentError(artistId, amountDue, "Artist has no wallet associated.");
    }

    token.transferFrom(owner(), artistData[artistId].walletAddress, amountDue);
    emit ArtistPaid(artistId, amountDue);
  }

  function getArtistData(string memory artistId) public view returns (Artist memory) {
    return artistData[artistId];
  }

  // Utility Functions
  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }

  function updateStableCoinAddress(address stc) public onlyOwner {
    s_stc = stc;
  }

  function addSimulatedRequestId(address oracleAddress, bytes32 requestId) public onlyOwner {
    addExternalRequest(oracleAddress, requestId);
  }
}
