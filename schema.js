const { gql } = require('apollo-server');

const typeDefs = gql`
    type account {
        id : String
        role: String
        routing : Int
        email : String
        username : String
        name : String
        password : String
        pin: String
        contact: contactInfo
        balances : balances
        accountHistory : [transaction]
    }
    type contactInfo{
        firstName: String
        lastName: String
        phoneNum: Int
        mailing: address
        billing: address
    }
    type address{
        streetName: String
        city: String
        state: String
        zip: Int
    }
    type balances{
        checking: [checking]
        savings: [savings]
        cards:[card]
        coinWallets: [wallet]
        investments:[investment]
    }
    type checking{
        acctName: String
        acctNumber : Float
        acctType: String
        balance : Float
    }
    type savings{
        acctName: String
        acctNumber : Float
        acctType: String
        balance : Float
        interestRate : Float
    }
    type card{
        acctName: String
        acctLink: Float
        cardNumber: Float
        acctType: String
        exp: String
        CVV: Int
        pin: Int
        balance: Float
        totalBalance: Float
    }
    type wallet {
        walletName: String!
        walletType: String!
        coins: [coin]  
    } 
    type coin{
        coinName: String
        id: String
        balance: Float
        activity: [coinTrans]
    }
    type coinTrans{
        id: String
        dateTime: String
        type: String
        amount: Float
    }
    type investment{
        acctName: String
        type: String
        id: String
        value: Float
        
    }
    type transaction{
        transID : String
        username: String
        dateTime : String
        info : info
    }
    type info {
        acctType: String
        acctNumber: Int!
        type : String
        amount : Float
        newBalance : Float
    }
    type empAccount {
        id : String
        clockedStatus: Boolean
        role: String
        email : String!
        username : String
        name : String
        password : String
        workHistory : [workDay]
    }
    type workDay {
        id: String
        type: String
        dateTime : String
    }
    type numberGen {
        id : String
        number : Float
        equation : Int
    }
    type deleteResponse{
        ok : Boolean
    }
    type transferResponse{
        ok : Boolean
    }
    type tokenResponse{
        accessToken: String
        refreshToken: String
    }
    type Query{
        checkName(username : String!) : Boolean
        account(id : String!) : account
        accountByAN(acctNumber : Int!) : account
        accountByUN(username : String!, password: String!) : account
        accountAuth(username : String!, password: String!) : tokenResponse
        accountNoPW(username : String!) : account
        accountByEmail(email : String!) : account
        accountByPin(username: String, pin: String) : account
        accountByPinAuth(username: String, pin: String) : account
        accounts : [account]
        empAccount(id: String!) : empAccount
        empAccountByUN(username: String!, password: String!) : empAccount
        empAccounts : [empAccount]
        getAllData : [transaction]
        transaction(id : String!, transId : String!) : transaction
        numberGen(id:String!) : numberGen
        numberGens : [numberGen]
    }
    input accountInput{
        id : String
        role: String
        routing : Int
        email : String
        username : String
        name : String
        password : String
        pin : String
        contact: contactInfoInput
        balances : balancesInput
        accountHistory : [transactionInput]
    }
    input contactInfoInput{
        firstName: String
        lastName: String
        phoneNum: Int
        mailing: addressInput
        billing: addressInput
    }
    input addressInput{
        streetName: String
        city: String
        state: String
        zip: Int
    }
    input balancesInput{
        checking: [checkingInput]
        savings: [savingsInput]
        cards:[cardInput]
        coinWallets: [walletInput]
        investments:[investmentInput]
    }
    input checkingInput{
        acctName: String
        acctNumber : Float
        acctType: String
        balance : Float
    }
    input savingsInput{
        acctName: String
        acctNumber : Float
        acctType: String
        balance : Float
        interestRate : Float
    }
    input walletInput{
        walletName: String!
        walletType: String!
        coins: [coinInput]
    }
    input coinInput{
        coinName: String
        id: String
        balance: Float
        activity: [coinTransInput]
    }
    input coinTransInput{
        id: String
        dateTime: String
        type: String
        amount: Float
    }
    input investmentInput{
        acctName: String
        type: String
        id: String
        value: Float   
    }
    input cardInput{
        acctName: String
        acctLink: Float
        cardNumber: Float
        acctType: String
        exp: String
        CVV: Int
        pin: Int
        balance: Float
        totalBalance: Float
    }
    input transactionInput{
        transID : String
        username: String
        dateTime : String
        info : infoInput
    }
    input infoInput{
        acctType: String!
        acctNumber: Int!
        type : String
        amount : Float
        newBalance : Float
    }
    input empAccountInput{
        id : String
        clockedStatus: Boolean
        role: String
        email : String!
        username : String
        name : String
        password : String
        workHistory : [workDayInput]
    }
    input workDayInput{
        id: String
        type: String
        dateTime : String
    }
    input numberGenInput{
        id : String
        number : Float
        equation : Int
    }
    type Mutation{
        createAccount(input : accountInput) : account
        deleteAccount(id : String!) : deleteResponse
        editBalance(id : String!, accountName: String!, input : balancesInput) : account
        editAccountName(id : String!, firstName : String!, lastName : String!) : account
        editAccountUsername(id : String!, username : String!) : account
        editAccountEmail(id : String!, email : String!) : account
        editAccountPassword(id : String!, password : String!) : account
        editAccountPin(id : String!, pin : String!) : account
        editPhoneNum(id: String!, phoneNum: Int ) : account
        editAddress(id: String!, input: addressInput, type: String) : account
        editContactInfo(id:String, input: contactInfoInput) : account
        addCoin(id: String, walletName: String, input: coinInput) : wallet
        editCoin(id: String, walletName: String, coinIndex: Int, balance: Float, input: coinTransInput) : wallet
        deleteCoin(id: String, walletName: String, coinID: String) : deleteResponse
        addTransaction(id : String!, acctType: String!, acctIndex: Int!, balance: Float!, input : transactionInput) : account
        transferToSomeone(id: String!, dateTime: String, routing: Int!, acctNumber: Float!, amount: Float!, fromAcct: Int!, fromAcctType: String!, transID: String!, fromAcctIndex: Int!) : transferResponse
        transferTransaction(id : String!, acctFrom: String!, acctTo: String!, fromBal: Float!, toBal: Float!, accountFromIndex: Int, accountToIndex: Int, input : transactionInput) : account
        addNewChecking(id:String!, acctType:String!, input: checkingInput) : account
        addNewSavings(id:String!, acctType:String, input: savingsInput) : account
        addNewCard(id:String!, acctType:String, input: cardInput) : account
        addNewInvestment(id:String!, acctType:String, input: investmentInput) : account
        addNewCoinWallet(id:String!, acctType:String, input: walletInput) : account
        deleteEmpAccount(id : String!) : deleteResponse
        createEmp(input : empAccountInput) : empAccount
        addClock(id : String, clockedStatus: Boolean, input: workDayInput!) : empAccount
        addToAllData(input: transactionInput) : transaction
        createNumberGen(input: numberGenInput) : numberGen
        editNumberGen(id: String!, input: numberGenInput!) : numberGen
        deleteNumGens(id : String!) : deleteResponse
    }
    `;

    module.exports = typeDefs;