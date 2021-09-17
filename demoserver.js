const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { buildSchema, assertInputType } = require('graphql');
const cors = require('cors');
var dal = require('./dal.js')
const jwt = require('jsonwebtoken');
const typeDefs = require('./schema.js')
const expressJwt = require("express-jwt");

 
const app = express();

const accessSecret = process.env.JWT_ACCESS_KEY;
const refreshSecret = process.env.JWT_REFRESH_KEY;





//load database default level
console.log("demo server running!!!!")
//set port for api to 9001
let port = process.env.PORT || 9001;

const authenticateJWT = (req, res, next) => {
    console.log("headers:", req.headers)
    let authHeader = req.headers.authorization.split(" ")[1]
    if (authHeader) {
        jwt.verify(authHeader, accessSecret, (err, username, role)=>  {
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

const getRole = (token)=>{
    let userRole;
    jwt.verify(token, accessSecret, (err, role)=>  {
        if(err){
            console.log("error", err)
             return res.sendStatus(403)
        }
        console.log("role", role.role)
        userRole = role
    })
    return userRole
}
//graphql schema

//placeholder until I figure out how to query objects within properties of types with graphql. I can only do arrays :(

// root object wih graphql methods

var resolvers = {
    Query: {
        async accounts(parent, args, context, info){
            if(context.user.role === "employee" || context.user.role === "admin"){
                let accounts = await dal.getAll()
                return accounts
            }else {
                return
            }
            
        },
        async account(parent, args, context, info){
            if(context.user.role === "employee" || context.user.role === "admin"){
                let account = await dal.getOne(args.id)
                return account
            }else{
                return
            }
        },
        async accountByUN(parent, args, context, info){
            if(context.user.role !== "customer" || null){
                return
            }
            let account = await dal.getOneByUN(args.username, args.password)
            return account
         },
         async accountByAN(parent, args, context, info){
            console.log("acctNumber",args.acctNumber)
            if(context.user.role === "employee" || context.user.role === "admin"){
                let account = await dal.getOneByAN(args.acctNumber)
                return account
            }else{
                return
            }
         },
         async  accountNoPW(parent, args, context, info){
            console.log("context",context.user)
            if(context.user.role === "employee" || context.user.role === "admin"){
                let account = await dal.getOneNoPW(args.username)
                return account
            }else{
                return
            }
         },
         async accountByPinAuth(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            let account = await dal.getOneForAuthATM(args.username, args.pin)
            console.log("found account by pin:",account)
            return account
         },
         async accountByPin(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            let account = await dal.getOneByPin(args.username, args.pin)
            console.log("found account by pin:",account)
            return account
         },
         async checkName(parent, args, context, info){
            if(context.user.role === "employee" || context.user.role === "admin"){
                let check = await dal.checkName(args.username) 
                console.log("server check", check)
                return check
            }else{
                return
            }
        },
        async empAccount(parent, args, context, info){
            if(context.user.role === "admin"){
                let empAccount = await dal.getOneEmp(args.id)
                return empAccount
            }else{
                return
            }
        },
        async empAccountByUN(parent, args, context, info){
            if(context.user.role === "employee" || context.user.role === "admin"){
                console.log("username",args.username)
                let empAccount = await dal.getOneEmpByUN(args.username, args.password)
                return empAccount
            }else{
                return
            }
        },
        async empAccounts(parent, args, context, info){
            if(context.user.role === "admin"){
                let empAccounts = await dal.getAllEmps()
                return empAccounts
            }else{
                return
            }
        },
        async getAllData(){
            if(context.user.role === "employee" || context.user.role === "admin"){
                let data = dal.getAllData()
                return data
            }else{
                return
            }
        },
        async numberGen(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            let number = await dal.getNumber(args.id)
            return number
        },
        async numberGens(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            let numbers = await dal.getAllNumbers()
            return numbers
        }
    },
    Mutation: {
        async createAccount(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {input} = args
            console.log("input:", input)
            let account = await dal.create(
                input.id,
                input.routing,
                input.name,
                input.username,
                input.email,
                input.password,
                input.chkAcctNumber,
                input.savAcctNumber
                )
            return account
        },
        async deleteAccount(parent, args, context, info){
            if(context.user.role === "employee" || context.user.role === "admin"){
                const {id} = args
                let ok =  await dal.deleteOne(id)                
                return {ok}
            }else{
                return
            }
        },
        async editBalance(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, accountName, input} = args
            let doc = await dal.getOne(id)
            let index;
            doc.map((item,i)=>{
                console.log("item:",item)
                if(item.accountName === accountName){
                    index = i
                }
            })
            doc.balance.splice(index,1,input)
            dal.editAccount(id, doc)
            return doc
        },
        async editAccountName(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, name} = args
            let doc = await dal.getOne(id)
            doc.name = name
            dal.editAccount(id, doc)     
            return doc
        },
        async editAccountEmail(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, email} = args
            let doc = await dal.getOne(id)
            doc.email = email
            dal.editAccount(account.id, doc)    
            return doc 
        },
        async editAccountPassword(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, password} = args
            let doc = await dal.getOne(id)
            doc.password = password
            dal.editAccount(id, doc)    
            return doc 
        },
        async editAccountPin(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, pin} = args
            let doc = await dal.getOne(id)
            doc.pin = pin
            dal.editAccount(id, doc)    
            return doc 
        },
        async editContactInfo(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, input} = args
            let doc = await dal.getOne(id)
            doc.contact = input
            console.log("doc for contact edit",doc)
            dal.editAccount(id, doc) 
            return doc
        },
        async addCoin(parent, args, context, info){
            if(context.user.role !== "customer" || null){
                return
            }
            const {id, walletName, input} = args
            let doc = await dal.getOne(id)
            let index = 0;
            let chosen = {}
            doc.balances.coinWallets.map((item,i)=>{
                if(item.walletName === walletName){
                    index = i
                    chosen = item
                }
            })
            chosen.coins.push(input)
            doc.balances.coinWallets.splice(index,1,chosen)
            dal.editAccount(id, doc)
            return chosen
        },
        async editCoin(parent, args, context, info){
            if(context.user.role !== "customer" || null){
                return
            }
            const {id, walletName, balance, input, coinIndex} = args
            let doc = await dal.getOne(id)
            let index = 0;
            let chosen = {}
            doc.balances.coinWallets.map((item,i)=>{
                if(item.walletName === walletName){
                    index = i
                    chosen = item
                }
            })
            chosen.coins[coinIndex].balance = balance
            chosen.coins[coinIndex].activity.push(input)
            doc.balances.coinWallets.splice(index,1,chosen)
            dal.editAccount(id, doc)
            return chosen
        },
        async deleteCoin(parent, args, context, info){
            if(context.user.role !== "customer" || null){
                return
            }
            const {id} = args
            let doc = await dal.getOne(id)
            return doc
        },
        async addTransaction(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, balance, input, acctIndex, acctType} = args
            console.log("inside add trans")
            let doc = await dal.getOne(id)
            doc.balances[acctType][acctIndex].balance = balance
            doc.accountHistory.push(input)
            dal.editAccount(id, doc)   
            console.log("returning doc", doc)  
            return doc
        },
        async transferTransaction(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, acctFrom, accountFromIndex, fromBal, acctTo, accountToIndex, toBal, input} = args
            console.log("inside transfer trans")
            let doc = await dal.getOne(id)
            doc.balances[acctFrom][accountFromIndex].balance = fromBal
            doc.balances[acctTo][accountToIndex].balance = toBal
            doc.accountHistory.push(input)
            dal.editAccount(id, doc)   
            console.log("returning doc", doc)  
            return doc
        },
        async transferToSomeone(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, dateTime, routing, acctNumber, amount, fromAcct, transID, fromAcctType, fromAcctIndex} = args
            console.log("inside transfer to someone", id, routing, acctNumber, amount, fromAcct, transID)
            let send = await dal.getOne(id)
            let receive = await dal.getOneByRouting(routing)
            let ok = Boolean(receive.id)
            if(receive){
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
                    dateTime: dateTime,
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
                    dateTime: dateTime,
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
        async addNewChecking(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id,input,acctType} = args
            let doc = await dal.getOne(id)
            doc.balances[acctType].push(input)
            dal.editAccount(id, doc)
            return doc
        },
        async addNewSavings(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, input, acctType} = args
            let doc = await dal.getOne(id)
            doc.balances[acctType].push(input)
            dal.editAccount(id, doc)
            return doc
        },
        async addNewCard(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {id, input, acctType} = args
            let doc = await dal.getOne(id)
            doc.balances[acctType].push(input)
            dal.editAccount(id, doc)
            return doc
        },
        async addNewInvestment(parent, args, context, info){
            if(context.user.role !== "customer" || null){
                return
            }
            const {id, input, acctType} = args
            let doc = await dal.getOne(id)
            doc.balances[acctType].push(input)
            dal.editAccount(id, doc)
            return doc
        },
        async addNewCoinWallet(parent, args, context, info){
            if(context.user.role !== "customer" || null){
                return
            }
            const {id, input, acctType} = args
            let doc = await dal.getOne(id)
            doc.balances[acctType].push(input)
            console.log("doc.balances.coinWallets:", doc.balances.coinWallets)
            dal.editAccount(id, doc)
            return doc
        },
        async createEmp(parent, args, context, info){
            if(context.user.role === "admin"){
                const {input} = args
                let empAccount = await dal.createEmp(input.id, input.role, input.name, input.username, input.email, input.password)
                return empAccount
            }else{
                return
            }
        },
        
        async deleteEmpAccount(parent, args, context, info){
            if(context.user.role === "admin"){
                const {id} = args
                let ok =  await dal.deleteOneEmp(id)                
                return {ok}
            }else{
                return
            }
        },
        async addClock(parent, args, context, info){
            if(context.user.role === "employee" || context.user.role === "admin"){
                const {id, clockedStatus, input} = args
                console.log("empAccount:",id)
                let doc = await dal.getOneEmp(id)
                doc.clockedStatus = clockedStatus
                doc.workHistory.push(input)
                dal.editEmployee(id, doc)    
                return doc
            }else{
                return
            }
        },
        async addToAllData(parent, args, context, info){
            if(!context.user.role || null){
                return
            }
            const {input} = args
            let data = dal.addToAllData(input)
            return input
        },
        async createNumberGen(parent, args, context, info){
            if(context.user.role === "admin"){
                const {input} = args
                console.log("input",input)
                let number = dal.createNumber(input.id, input.number, input.equation)
                return number
            }else{
                return
            }
        },
        async editNumberGen(parent, args, context, info){
            const {id, input} = args
            let account = await dal.editNumber(id,input)
            return input
        },
        async deleteNumGens(parent, args, context, info){
            if(context.user.role === "admin"){
                const {id} = args
                let ok =  await dal.deleteOneNum(id)                
                return {ok}
            }else{
                return
            }
        }
    
    }
    
}




var server = null;
const startServer = async()=>{
    server  = new ApolloServer({ typeDefs, resolvers, context: ({ req }) => {
        let token = req.headers.authorization.split(" ")[1]
        let user = getRole(token)
        console.log("role about to be sent", user)
        return {user}
      }
    })  
    await server.start()

    const app = express();
    app.use(cors())
    app.use(express.static('public'));
    server.applyMiddleware({ app: app, authenticateJWT });
    app.listen({ port: port },()=>{
        console.log("listening on port:9001")
    })
}

startServer()


