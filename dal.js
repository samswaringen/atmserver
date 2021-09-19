

const { MongoClient } = require('mongodb');
let db = null
async function connect(){
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    try {
        await client.connect()
        listDatabases(client)
        db = client.db("atm")
    } catch (e) {
        console.error(e)
    } 
}
connect()

async function listDatabases(client){
    const databaseList = await client.db().admin().listDatabases();
    console.log("databases:",databaseList.databases)
}


function create(id,dateTime,routing,name,username,email,password,chkAcctNumber,savAcctNumber){
    console.log(id,name,username,email,password,chkAcctNumber,savAcctNumber )
    return new Promise((resolve,reject)=>{
        let collection = db.collection('accounts')
        const doc = {
            id,
            role: 'customer',
            routing,
            name,
            username,
            email,
            password,
            pin: "",
            contact: {},
            balances:{
                checking:[{
                    acctName: "Main",
                    acctNumber: chkAcctNumber,
                    acctType: "basic",
                    balance:0
                }],
                savings:[{
                    acctName: "Main",
                    acctNumber: savAcctNumber,
                    acctType: "basic",
                    balance:0,
                    interestRate:0.1
                }],
                cards:[],
                coinWallets:[
                    {walletName: "React Crypto Wallet", walletType: "hot", coins:[]}
                ],
                investments:[]           
        },
            accountHistory:[
                {transID : `${id}opencheck`, username: username, dateTime:dateTime, info : {acctType: "checking",acctNumber: chkAcctNumber, type:'deposit',amount:0, newBalance: 0}},
                {transID : `${id}opensave`, username: username, dateTime:dateTime, info : {acctType: "savings",acctNumber: savAcctNumber, type:'deposit',amount:0, newBalance: 0}}
            ]
        }
        console.log("doc:",doc)
        collection.insertOne(doc, {w:1}, function(err,result){
            err ? reject(err) : resolve(doc)
        })

    })
}

function getAll(){
    return new Promise((resolve,reject)=>{
        console.log('getAll running')
        const accounts = db
                .collection('accounts')
                .find({})
                .toArray(function(err,docs){
                    err ? reject(err) : resolve(docs)
                })

    })
}
function getOne(id){
    return new Promise((resolve,reject)=>{
        console.log('getOne running', id)
        const accounts = db
                .collection('accounts')
                .findOne({id : {$eq:id}},function(err,doc){
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Account doesn't exist!`}
                        err ? reject(err) : resolve(doc)
                    }
                    
                })
        
    })
}
function getOneByRouting(routing){
    return new Promise((resolve,reject)=>{
        console.log('getOneByRouting running', routing)
        const accounts = db
                .collection('accounts')
                .findOne({routing : {$eq:routing}},function(err,doc){
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Account doesn't exist!`}
                        err ? reject(err) : resolve(doc)
                    }
                    
                })
        
    })
}
function getOneByUN(username, password){
    return new Promise((resolve,reject)=>{
        console.log('getOneByUN running', username)
        const accounts = db
                .collection('accounts')
                .findOne({username : {$eq:username},password : {$eq:password}},function(err,doc){
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Account doesn't exist!`}
                        err ? reject(err) : resolve(doc)
                    }
                    
                })
        
    })
}

function getOneForAuth(username, password){
    return new Promise((resolve,reject)=>{
        console.log('getOneForAuth running', username)
        const accounts = db
                .collection('accounts')
                .findOne({username : {$eq:username},password : {$eq:password}},function(err,doc){
                    console.log("doc:",doc)
                    if(doc){
                        let newDoc = {exists:true, username:username, role: doc.role }
                        doc = newDoc
                        console.log("doc",doc)
                        err ? reject(err) : resolve(doc)
                    }else{
                        let newDoc = {exists:false, username:null, role: null }
                        doc = newDoc
                        console.log("doc",doc)
                        err ? reject(err) : resolve(doc)
                    }  
                })  
    })
}

function getOneForAuthEmp(username, password){
    return new Promise((resolve,reject)=>{
        console.log('getOneForAuth running', username)
        const accounts = db
                .collection('employees')
                .findOne({username : {$eq:username},password : {$eq:password}},function(err,doc){
                    console.log("doc:",doc)
                    if(doc){
                        let newDoc = {exists:true, username:username, role: doc.role }
                        doc = newDoc
                        console.log("doc",doc)
                        err ? reject(err) : resolve(doc)
                    }else{
                        let newDoc = {exists:false, username:null, role: null }
                        doc = newDoc
                        console.log("doc",doc)
                        err ? reject(err) : resolve(doc)
                    }  
                })  
    })
}

function getOneForAuthATM(username, pin){
    return new Promise((resolve,reject)=>{
        console.log('getOneForAuthATM running', username)
        const accounts = db
                .collection('accounts')
                .findOne({username : {$eq:username},pin : {$eq:pin}},function(err,doc){
                    console.log("doc:",doc)
                    if(doc){
                        let newDoc = {exists:true, username:username, role: doc.role }
                        doc = newDoc
                        console.log("doc",doc)
                        err ? reject(err) : resolve(doc)
                    }else{
                        let newDoc = {exists:false, username:null, role: null }
                        doc = newDoc
                        console.log("doc",doc)
                        err ? reject(err) : resolve(doc)
                    }  
                })  
    })
}
function getOneByAN(acctNumber){
    return new Promise((resolve,reject)=>{
        console.log('getOneByAN running', acctNumber)
        const accounts = db
                .collection('accounts')
                .findOne({acctNumber : {$eq:acctNumber.acctNumber}},function(err,doc){
                    console.log("doc",doc)
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Account doesn't exist!`}
                        err ? reject(err) : resolve(doc)
                    }
                    
                })
        
    })
}
function getOneNoPW(username){
    return new Promise((resolve,reject)=>{
        console.log('getOneNoPW running', username)
        const accounts = db
                .collection('accounts')
                .findOne({username : {$eq:username}},function(err,doc){
                    console.log("doc",doc)
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Account doesn't exist!`}
                        err ? reject(err) : resolve(doc)
                    }
                    
                })
        
    })
}
function getOneByPin(username, pin){
    return new Promise((resolve,reject)=>{
        console.log('getOneByPin running', username)
        const accounts = db
                .collection('accounts')
                .findOne({username : {$eq:username}, pin : {$eq:pin}},function(err,doc){
                    console.log("doc",doc)
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Account doesn't exist!`}
                        err ? reject(err) : resolve(doc)
                    }
                    
                })
        
    })
}
function checkName(username){
    return new Promise((resolve,reject)=>{
        console.log('checkName running', username)
        const accounts = db
                .collection('accounts')
                .findOne({username : {$eq:username}},function(err,doc){
                    console.log("doc",doc)
                    if(doc){
                        let doc = true
                        err ? reject(err) : resolve(doc)
                    }else{
                        let doc = false
                        err ? reject(err) : resolve(doc)
                    }
                    
                })
        
    })
}
function deleteOne(id){
    return new Promise((resolve,reject)=>{
        console.log('deleteOne running')
        const accounts = db
                .collection('accounts')
                .deleteOne({id : {$eq:id}},function(err,doc){
                    console.log("doc",doc)
                    if(doc.deletedCount > 0){
                        doc = true
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = false
                        err ? reject(err) : resolve(doc)
                    }
                })

    })
}
function editAccount(id,item){
    return new Promise((resolve,reject)=>{
        console.log('editAccount running', item)
        const accounts = db
                .collection('accounts')
                .replaceOne({id : {$eq:id}}, item, function(err,doc){
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Account doesn't exist!`}
                        resolve(doc)
                    }
                })

    })
}

function createEmp(id,dateTime,role,name,username,email,password){
    console.log("id,dateTime,role,name,username,email,password",id,dateTime,role,name,username,email,password)
    return new Promise((resolve,reject)=>{
        let collection = db.collection('employees')
        let currentDate = new Date()
        const doc = {id,clockedStatus: false,role,name,username,email,password,workHistory:[{id:"accountCreated", type:"accountCreate", dateTime: dateTime}]}
        collection.insertOne(doc, {w:1}, function(err,result){
            err ? reject(err) : resolve(doc)
        })

    })
}
function getOneEmp(id){
    return new Promise((resolve,reject)=>{
        console.log('getOneEmp running', id)
        const accounts = db
                .collection('employees')
                .findOne({id : {$eq:id}},function(err,doc){
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Employee doesn't exist!`}
                        err ? reject(err) : resolve(doc)
                    }
                    
                })
        
    })
}
function getOneEmpByUN(username, password){
    return new Promise((resolve,reject)=>{
        console.log('getOneEmpByUN running', username, password)
        const accounts = db
                .collection('employees')
                .findOne({username : {$eq:username},password : {$eq:password}},function(err,doc){
                    console.log("doc",doc)
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Employee doesn't exist!`}
                        err ? reject(err) : resolve(doc)
                    }
                    
                })
        
    })
}
function getAllEmps(){
    return new Promise((resolve,reject)=>{
        console.log('getAllEmps running')
        const accounts = db
                .collection('employees')
                .find({})
                .toArray(function(err,docs){
                    err ? reject(err) : resolve(docs)
                })

    })
}
function deleteOneEmp(id){
    return new Promise((resolve,reject)=>{
        console.log('deleteOne running')
        const accounts = db
                .collection('employees')
                .deleteOne({id : {$eq:id}},function(err,doc){
                    console.log("doc",doc)
                    if(doc.deletedCount > 0){
                        doc = true
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = false
                        err ? reject(err) : resolve(doc)
                    }
                })

    })
}
function editEmployee(id, item){
    return new Promise((resolve,reject)=>{
        console.log('editEmployees running')
        const accounts = db
                .collection('employees')
                .replaceOne({id : {$eq:id}}, item, function(err,doc){
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Account doesn't exist!`}
                        resolve(doc)
                    }
                })

    })
}
function getAllData(){
    return new Promise((resolve,reject)=>{
        console.log('getAllData running')
        const accounts = db
                .collection('allData')
                .find({})
                .toArray(function(err,docs){
                    err ? reject(err) : resolve(docs)
                })

    })
}
function addToAllData(item){
    return new Promise((resolve,reject)=>{
        const accounts = db
                .collection('allData')
                .insertOne(item, function(err,doc){
                    console.log("doc",doc)
                    err ? reject(err) : resolve(doc)
                })

    })
}
function createNumber(id, number, equation){
    console.log("variables for numbers:",id, number, equation)
    let item = {id, number,equation}
    return new Promise((resolve,reject)=>{
        const accounts = db
                .collection('internal')
                .insertOne(item, {w:1}, function(err,doc){
                    console.log("doc",doc)
                    err ? reject(err) : resolve(doc)
                })

    })
}
function deleteOneNum(id){
    return new Promise((resolve,reject)=>{
        console.log('deleteOneNum running')
        const accounts = db
            .collection('internal')
            .deleteOne({id : {$eq:id}},function(err,doc){
                console.log("doc",doc)
                if(doc.deletedCount > 0){
                    doc = true
                    err ? reject(err) : resolve(doc)
                }else{
                    doc = false
                    err ? reject(err) : resolve(doc)
                }
            })

    })
}
function editNumber(id, item){
    return new Promise((resolve,reject)=>{
        console.log('editNumber running')
        const accounts = db
                .collection('internal')
                .replaceOne({id : {$eq:id}}, item, function(err,doc){
                    console.log("doc",doc)
                    if(doc){
                        err ? reject(err) : resolve(doc)
                    }else{
                        doc = {name:`Number doesn't exist!`}
                        resolve(doc)
                    }
                })

    })
}
function getNumber(id){
    console.log("id in dal:",id)
    return new Promise((resolve,reject)=>{
        const accounts = db
                .collection('internal')
                .findOne({id : {$eq:id}}, function(err,doc){
                    console.log("doc",doc)
                    err ? reject(err) : resolve(doc)
                })

    })
}
function getAllNumbers(){
    return new Promise((resolve,reject)=>{
        const accounts = db
                .collection('internal')
                .find({})
                .toArray(function(err,doc){
                    console.log("doc",doc)
                    err ? reject(err) : resolve(doc)
                })

    })
}

module.exports = {create, getAll, getOne, getOneByRouting, getOneByUN, getOneForAuth, getOneForAuthATM, getOneForAuthEmp, getOneByAN, getOneNoPW, getOneByPin, checkName, deleteOne, editAccount, createEmp, getOneEmp, getOneEmpByUN, getAllEmps, deleteOneEmp,editEmployee, getAllData, addToAllData, createNumber, getNumber, getAllNumbers, editNumber, deleteOneNum}
