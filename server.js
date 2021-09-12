
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema, assertInputType } = require('graphql');
const app = express();
const cors = require('cors');
var dal = require('./dal.js')
const jwt = require('jsonwebtoken');

const accessSecret = "rzWLXa0b0ce5SUoSZF1LHvilKapkg9AkgoQjmi8tLhCphiq5Rw3qrtkhQ7vjy88uH3epB4N7pb1lRt";
const refreshSecret = "yxT9xaTJGFL777ZiT6XrjXSOJ8pXDugk8Ic1nkQWOzsjQ5CdLRQswP8Wv6DmOC6Lbml8gXDpOFFQEf";

app.use(cors())
//Get the default connection

//load static files
app.use(express.static('public'));

//load database default level

//set port for api to 9001
let port = process.env.PORT || 9001;

const authenticateJWT = (req, res, next) => {
    console.log("headers:", req.headers)
    let authHeader = req.headers.authorization
    if (authHeader) {
        jwt.verify(authHeader, accessSecret, (err, username, role) => {
            if(err){
                console.log("error", err)
                 return res.sendStatus(403)
            }
            req.username = username;
            req.role = role
            next();
        });
    } else {
        res.sendStatus(401);
    }
}


//graphql schema
var schema = buildSchema(`
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
    accountByPin(username: String, pin: String) : account
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
    editAccountName(id : String!, name : String!) : account
    editAccountUsername(id : String!, username : String!) : account
    editAccountEmail(id : String!, email : String!) : account
    editAccountPassword(id : String!, password : String!) : account
    editAccountPin(id : String!, pin : String!) : account
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
`)
//placeholder until I figure out how to query objects within properties of types with graphql. I can only do arrays :(

// root object wih graphql methods
var root = {
    accounts: async ()=>{
        let accounts = await dal.getAll()
        return accounts
    },
    account: async (id)=>{
       let account = await dal.getOne(id.id)
       return account
    },
    accountByUN: async ({username, password})=>{
        console.log("accountUN username", username)
        let account = await dal.getOneByUN(username, password)
        return account
     },
     accountByAN: async (acctNumber)=>{
        console.log("acctNumber",acctNumber)
        let account = await dal.getOneByAN(acctNumber)
        return account
     },
     accountNoPW :async ({username})=>{
        console.log("req",req)
        let account = await dal.getOneNoPW(username)
        return account
     },
     accountByPin : async (username, pin)=>{
        let account = await dal.getOneByPin(username, pin)
        console.log("found account by pin:",account)
        return account
     },
    checkName : async(username)=>{
        let check = await dal.checkName(username.username) 
        console.log("server check", check)
        return check
    },
    createAccount : async ({input})=>{
        console.log("input:",input)
        let account = await dal.create(
            input.id,
            input.routing,
            input.name,
            input.username,
            input.email,
            input.password,
            input.balances.checking[0].acctNumber,
            input.balances.savings[0].acctNumber
            )
        return account
    },
    deleteAccount : async(id)=>{
        let ok =  await dal.deleteOne(id.id)                
        return {ok}
    },
    editBalance : async({...account})=>{
        console.log("account:",account)
        let doc = await dal.getOne(account.id)
        let index;
        doc.map((item,i)=>{
            console.log("item:",item)
            if(item.accountName === account.accountName){
                index = i
            }
        })
        doc.balance.splice(index,1,account.input)
        dal.editAccount(account.id, doc)
        return doc
    },
    editAccountName : async ({...account})=>{
        let doc = await dal.getOne(account.id)
        doc.name = account.name
        dal.editAccount(account.id, doc)     
        return doc
    },
    editAccountEmail : async ({...account})=>{
        let doc = await dal.getOne(account.id)
        doc.email = account.email
        dal.editAccount(account.id, doc)    
        return doc 
    },
    editAccountPassword : async ({...account})=>{
        let doc = await dal.getOne(account.id)
        doc.password = account.password
        dal.editAccount(account.id, doc)    
        return doc 
    },
    editAccountPin : async ({...account})=>{
        let doc = await dal.getOne(account.id)
        doc.pin = account.pin
        dal.editAccount(account.id, doc)    
        return doc 
    },
    editContactInfo : async ({...account})=>{
        let doc = await dal.getOne(account.id)
        doc.contact = account.input
        dal.editAccount(account.id, doc) 
        return doc
    },
    addCoin : async ({...wallet})=>{
        let doc = await dal.getOne(wallet.id)
        let index = 0;
        let chosen = {}
        doc.balances.coinWallets.map((item,i)=> {
            if(item.walletName === wallet.walletName){
                index = i
                chosen = item
            }
        })
        chosen.coins.push(wallet.input)
        doc.balances.coinWallets.splice(index,1,chosen)
        dal.editAccount(wallet.id, doc)
        return chosen
    },
    editCoin : async ({...wallet})=>{
        let doc = await dal.getOne(wallet.id)
        let index = 0;
        let chosen = {}
        doc.balances.coinWallets.map((item,i)=> {
            if(item.walletName === wallet.walletName){
                index = i
                chosen = item
            }
        })
        chosen.coins[wallet.coinIndex].balance = wallet.balance
        chosen.coins[wallet.coinIndex].activity.push(wallet.input)
        doc.balances.coinWallets.splice(index,1,chosen)
        dal.editAccount(wallet.id, doc)
        return chosen
    },
    deleteCoin : async ({...wallet})=>{
        let doc = await dal.getOne(wallet.id)
    },
    addTransaction : async ({...account})=>{
        console.log("inside add trans")
        let doc = await dal.getOne(account.id)
        doc.balances[account.acctType][account.acctIndex].balance = account.balance
        doc.accountHistory.push(account.input)
        dal.editAccount(account.id, doc)   
        console.log("returning doc", doc)  
        return doc
    },
    transferTransaction : async ({...account})=>{
        console.log("inside transfer trans")
        let doc = await dal.getOne(account.id)
        doc.balances[account.acctFrom][account.accountFromIndex].balance = account.fromBal
        doc.balances[account.acctTo][account.accountToIndex].balance = account.toBal
        doc.accountHistory.push(account.input)
        dal.editAccount(account.id, doc)   
        console.log("returning doc", doc)  
        return doc
    },
    transferToSomeone : async ({id, routing, acctNumber, amount, fromAcct, fromAcctType, transID, fromAcctIndex})=>{
        console.log("inside transfer to someone", id, routing, acctNumber, amount, fromAcct, transID)
        let send = await dal.getOne(id)
        let receive = await dal.getOneByRouting(routing)
        let ok = Boolean(receive.id)
        if(receive){
            let newDate = new Date()
            let sendBalance = await send.balances[fromAcctType][fromAcctIndex].balance - amount
            let key = ''
            let receiveKeys = Object.keys(receive.balances)
            let toAcctIndex = 0
            receiveKeys.map((item)=>{
                if(receive.balances[item].length > 0){
                    receive.balances[item].map((account, index)=>{
                        if(account.acctNumber === acctNumber){
                            key = item
                            toAcctIndex = index
                            console.log("key",key, "toAcctIndex", toAcctIndex)
                            return
                        }
                    })
                }
                
            })
            console.log("key outside",key)
            let recieveBalance = await receive.balances[key][toAcctIndex].balance + amount
            let sendInput = {
                transID: transID,
                username: send.username,
                dateTime: newDate,
                info:{
                    acctType: fromAcctType,
                    acctNumber: fromAcct,
                    type: `transfer to ${routing}`,
                    amount: amount,
                    newBalance: sendBalance
                }
            }
            send.balances[fromAcctType][fromAcctIndex].balance = sendBalance
            send.accountHistory.push(sendInput)
            dal.editAccount(send.id, send)
            let receiveInput = {
                transID: transID,
                username: send.username,
                dateTime: newDate,
                info:{
                    acctType: fromAcctType,
                    acctNumber: fromAcct,
                    type: `transfer from ${send.routing}`,
                    amount: amount,
                    newBalance: recieveBalance
                }
            }
            receive.balances[key][toAcctIndex].balance = recieveBalance
            receive.accountHistory.push(receiveInput)
            console.log("final receive account before send", receive)
            dal.editAccount(receive.id, receive) 
        }    
        return {ok}
    },
    addNewChecking : async ({...account})=>{
        let doc = await dal.getOne(account.id)
        doc.balances[account.acctType].push(account.input)
        dal.editAccount(account.id, doc)
        return doc
    },
    addNewSavings : async ({...account})=>{
        let doc = await dal.getOne(account.id)
        doc.balances[account.acctType].push(account.input)
        dal.editAccount(account.id, doc)
        return doc
    },
    addNewCard : async ({...account})=>{
        let doc = await dal.getOne(account.id)
        doc.balances[account.acctType].push(account.input)
        dal.editAccount(account.id, doc)
        return doc
    },
    addNewInvestment : async ({...account})=>{
        let doc = await dal.getOne(account.id)
        doc.balances[account.acctType].push(account.input)
        dal.editAccount(account.id, doc)
        return doc
    },
    addNewCoinWallet : async ({...account})=>{
        console.log("account",account)
        let doc = await dal.getOne(account.id)
        doc.balances[account.acctType].push(account.input)
        console.log("doc.balances.coinWallets:", doc.balances.coinWallets)
        dal.editAccount(account.id, doc)
        return doc
    },
    createEmp : async (input)=>{
        let empAccount = await dal.createEmp(input.input.id, input.input.role, input.input.name, input.input.username, input.input.email, input.input.password)
        return empAccount
    },
    empAccount : async (id)=>{
        let empAccount = await dal.getOneEmp(id.id)
        return empAccount
    },
    empAccountByUN : async ({username, password})=>{
        console.log("username",username)
        let empAccount = await dal.getOneEmpByUN(username, password)
        return empAccount
    },
    empAccounts : async ()=>{
        let empAccounts = await dal.getAllEmps()
        return empAccounts
    },
    deleteEmpAccount : async(id)=>{
        let ok =  await dal.deleteOneEmp(id.id)                
        return {ok}
    },
    addClock : async ({id, input})=>{
        console.log("empAccount:",id)
        let doc = await dal.getOneEmp(id)
        doc.workHistory.push(input)
        dal.editEmployee(id, doc)    
        return doc
    },
    getAllData : ()=>{
        let data = dal.getAllData()
        return data
    },
    addToAllData : ({...transaction})=>{
        let data = dal.addToAllData(transaction.input)
        return transaction.input
    },
    createNumberGen : (input)=>{
        console.log("input",input.input)
        let number = dal.createNumber(input.input.id, input.input.number, input.input.equation)
        return number
    },
    editNumberGen : async ({...numberGen})=>{
        let account = await dal.editNumber(numberGen.id,numberGen.input)
        return numberGen.input
    },
    numberGen : async (id)=>{
        let number = await dal.getNumber(id.id)
        return number
    },
    numberGens : async ()=>{
        let numbers = await dal.getAllNumbers()
        return numbers
    },
    deleteNumberGens : async (id)=>{
        let ok =  await dal.deleteOneNum(id.id)                
        return {ok}
    }

}

//app.use(authenticateJWT)
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }));
  app.listen(port, function () {
      console.log(`Running on port ${port}`);
  });