const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { buildSchema, assertInputType } = require('graphql');
const cors = require('cors');
var dal = require('./dal.js')
const jwt = require('jsonwebtoken');
const typeDefs = require('./schema.js')
const resolvers = require('./resolvers.js')
const expressJwt = require("express-jwt");
const fs = require('fs')
const http = require('http')
const https = require('https')


  
const app = express();

const accessSecret = "rzWLXa0b0ce5SUoSZF1LHvilKapkg9AkgoQjmi8tLhCphiq5Rw3qrtkhQ7vjy88uH3epB4N7pb1lRt";
const refreshSecret = "yxT9xaTJGFL777ZiT6XrjXSOJ8pXDugk8Ic1nkQWOzsjQ5CdLRQswP8Wv6DmOC6Lbml8gXDpOFFQEf";





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




const startServer = async()=>{
    const server  = new ApolloServer({ typeDefs, resolvers, context: ({ req }) => {
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
    app.listen({ port: port })
}
startServer()


