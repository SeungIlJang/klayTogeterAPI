// Klaytn IDE uses solidity 0.4.24, 0.5.6 versions.
pragma solidity >=0.4.24 <=0.5.6;
/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }


}
library SafeMath8 {

    function add(uint8 a, uint8 b) internal pure returns (uint8) {
        uint8 c = a + b;
        assert(c >= a);
        return c;
    }
}

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;

    /**
      * @dev The Ownable constructor sets the original `owner` of the contract to the sender
      * account.
      */
    constructor() public {
        owner = msg.sender;
    }

    /**
      * @dev Throws if called by any account other than the owner.
      */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner != address(0)) {
            owner = newOwner;
        }
    }
}

// KlayTogetter
contract KlayTogetter is Ownable{
    using SafeMath for uint256;
    using SafeMath8 for uint8;

    struct Member{
        string kakaoId;
        address memberAddress;
    }

    struct Nest{
        uint256 seq;
        address opener;
        string nestName;
        uint8 eggCnt;
        uint8 paymentTurn;
        uint256 amount;
        uint8 period;
        uint8 rate;
        uint256 joinAmount;
        uint256 createDate;
        uint256 depositDate;
        uint256 PaymentDate;

        // NestEggsInfo[] nestEggsInfos;
        address[] eggsAddress;
        mapping(address => NestEggsInfo) nestMemberMapping;
        mapping(uint8 => address) nestMemberTurnMapping;

    }

    struct NestEggsInfo{
        uint256 memberId;
        uint8 turn;
        uint8 payCnt;
    }



    Member[] public members;
    uint256[] public nestIdList;

    mapping(string => uint256)  memberMappingKakaoIdToMemberSeq;
    mapping(address => uint256) memberMappingAddrToMemberSeq;
    mapping(uint256 => address) memberMappingMemberSeqToAddr;
    mapping(uint256 => Nest) public nestMapping;
    mapping(address => uint256[]) memberJoinNestIdListMapping;

    event createMemberEvent(string _kakaoId,address _address,uint256 _memberSeq);
    event createNestEvent(address _addr,uint256 _sendValue);
    event joinNestEvent(uint256 _joinAmount,uint256 _sendValue);
    event _joinNestEvent(uint256 _memberId,uint8 _turn,uint8 _payCnt);
    event paymentEvent(uint256 _nestId,address _paymentAddress,uint256 _pay,uint256 _joinAmount, uint8 _paymentTurn);
    event depositEvent(uint256 _nestId,uint256 _amount,uint256 _joinAmount, address _address, uint256 _sendValue, uint8 _payCnt);



    function createMember(string _kakaoId,address _address) external {
        require(memberMappingAddrToMemberSeq[_address] == 0,"already exist id");
        uint256 memberSeq = members.push(Member(_kakaoId, _address));
        memberMappingAddrToMemberSeq[_address] = memberSeq;
        memberMappingMemberSeqToAddr[memberSeq] = _address;
        memberMappingKakaoIdToMemberSeq[_kakaoId] = memberSeq;
        emit createMemberEvent(_kakaoId, _address, memberSeq);

    }

    function createNest(string _nestName,uint8 _eggCnt, uint256 _amount,uint8 _period, uint8 _rate,uint8 _turn)
    payable external {
        require(msg.value > 0,"give me money");
        emit createNestEvent(msg.sender,msg.value);
        uint256 nestId = nestIdList.length+1;
        nestIdList.push(nestId);
        nestMapping[nestId].seq=nestId;
        nestMapping[nestId].opener=msg.sender;
        nestMapping[nestId].nestName=_nestName;
        nestMapping[nestId].eggCnt=_eggCnt;
        nestMapping[nestId].paymentTurn=1;
        nestMapping[nestId].amount=_amount;
        nestMapping[nestId].period=_period;
        nestMapping[nestId].rate=_rate;
        nestMapping[nestId].joinAmount=nestMapping[nestId].joinAmount.add(msg.value);
        nestMapping[nestId].createDate=now;

        //nestMapping[nestId].depositDate=msg.sender;
        //nestMapping[nestId].PaymentDate=msg.sender;

        _joinNest(nestId,_turn);

    }

    function _joinNest(uint256 _nestId,uint8 _turn) internal {

        nestMapping[_nestId].nestMemberTurnMapping[_turn]=msg.sender;
        nestMapping[_nestId].eggsAddress.push(msg.sender);
        nestMapping[_nestId].nestMemberMapping[msg.sender].memberId=memberMappingAddrToMemberSeq[msg.sender];
        nestMapping[_nestId].nestMemberMapping[msg.sender].turn=_turn;
        nestMapping[_nestId].nestMemberMapping[msg.sender].payCnt=nestMapping[_nestId].nestMemberMapping[msg.sender].payCnt.add(1);

        memberJoinNestIdListMapping[msg.sender].push(_nestId);
        emit _joinNestEvent(nestMapping[_nestId].nestMemberMapping[msg.sender].memberId,_turn, nestMapping[_nestId].nestMemberMapping[msg.sender].payCnt);

        // nestMapping[_nestId].nestEggsInfos.push(NestEggsInfo({memberId:memberMappingAddrToMemberSeq[msg.sender],turn:_turn,payYn:1}));


    }

    function joinNest(uint256 _nestId,uint8 _turn) payable external{
        require(0==nestMapping[_nestId].nestMemberTurnMapping[_turn],'already choose turn');
        require(msg.sender!=nestMapping[_nestId].nestMemberTurnMapping[_turn],'already join nest');
        require(msg.value > 0,"give me money");
        nestMapping[_nestId].joinAmount=nestMapping[_nestId].joinAmount.add(msg.value);

        emit joinNestEvent(nestMapping[_nestId].joinAmount,msg.value);
        _joinNest(_nestId,_turn);
    }

    //지급 function
    //순번 이율에 따른 지급
    function payment(uint256 _nestId) external onlyOwner{
        //조건 모두 입금했을경우 지급 추가
        //require(all deposit);
        //이율
        //uint256 rate = _value.mul(nestMapping[_nestId].rate).div(10000);
        uint8 turn = nestMapping[_nestId].paymentTurn;
        address paymentAddress = nestMapping[_nestId].nestMemberTurnMapping[turn];
        uint256 pay = nestMapping[_nestId].amount.div(nestMapping[_nestId].eggCnt);
        paymentAddress.transfer(pay);
        nestMapping[_nestId].joinAmount = nestMapping[_nestId].joinAmount.sub(pay);
        nestMapping[_nestId].paymentTurn = turn.add(1);
        emit paymentEvent(_nestId,paymentAddress,pay,nestMapping[_nestId].joinAmount, nestMapping[_nestId].paymentTurn);

    }

    //입금
    function deposit(uint256 _nestId) external payable {
        require(memberMappingAddrToMemberSeq[msg.sender]==nestMapping[_nestId].nestMemberMapping[msg.sender].memberId,'not join nest');
        require(msg.value > 0,"give me money");
        nestMapping[_nestId].joinAmount=nestMapping[_nestId].joinAmount.add(msg.value);
        nestMapping[_nestId].nestMemberMapping[msg.sender].payCnt=nestMapping[_nestId].nestMemberMapping[msg.sender].payCnt.add(1);
        emit depositEvent(_nestId,nestMapping[_nestId].amount,nestMapping[_nestId].joinAmount,msg.sender, msg.value, nestMapping[_nestId].nestMemberMapping[msg.sender].payCnt);

    }


    function getMemberAdressListOfNest(uint256 _nestId) external view returns(address[]){
        return nestMapping[_nestId].eggsAddress;
    }

    function getEggInfoOfNest(uint256 _nestId, address _eggAddress) external view returns(uint256,uint8,uint8){
        uint256 memberId =nestMapping[_nestId].nestMemberMapping[_eggAddress].memberId;
        uint8 turn=nestMapping[_nestId].nestMemberMapping[_eggAddress].turn;
        uint8 payCnt=nestMapping[_nestId].nestMemberMapping[_eggAddress].payCnt;
        return (memberId,turn,payCnt);
    }

    function getMemberJoinNestIdList() public view returns (uint256[]){
        return memberJoinNestIdListMapping[msg.sender];
    }

    // function getNestEggsInfosLengthOfNest(uint256 _nestId)external view returns(uint256){
    //     return nestMapping[_nestId].nestEggsInfos.length;
    // }

    function getNestIdListLength() public view returns(uint256){
        return nestIdList.length;
    }

    function getNestIdList() public view returns(uint256[]){
        return nestIdList;
    }

    function getMemberSeqByKakaoId(string _kakaoId)external view returns(uint256){
        return memberMappingKakaoIdToMemberSeq[_kakaoId];
    }

    function getCABalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getMemberId() public view returns(uint256){
        return memberMappingAddrToMemberSeq[msg.sender];
    }



    function getMemberLength() public view returns(uint256){
        return members.length;
    }

    function connectionTest() public pure returns(string){
        return "OK";
    }


}
