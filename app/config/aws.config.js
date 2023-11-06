const AWS = require("aws-sdk");
const jwt_decode = require("jwt-decode");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
let cognitoAttributeList = [];

require("dotenv").config();
const poolData = {
  UserPoolId : process.env.AWS_COGNITO_USER_POOL_ID,
  ClientId : process.env.AWS_COGNITO_CLIENT_ID
};

const aws_region = process.env.AWS_COGNITO_REGION;

const attributes = (key, value) => {
  return {
    Name : key,
    Value : value
  }
};

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEYID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS,
});

// Register user
function setCognitoAttributeList(email, address, phoneNumber, gender, birthdate, name, agent) {
  let attributeList = [];
  attributeList.push(attributes('email',email));
  attributeList.push(attributes('phone_number',phoneNumber));
  attributeList.push(attributes('name',name));
  attributeList.push(attributes('address',address));
  attributeList.push(attributes('gender',gender));
  attributeList.push(attributes('birthdate',birthdate));
  attributeList.forEach(element => {
    cognitoAttributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(element));
  });
}

function getCognitoAttributeList() {
  return cognitoAttributeList;
}

function getCognitoUser(email) {
  const userData = {
    Username: email,
    Pool: getUserPool()
  };
  return new AmazonCognitoIdentity.CognitoUser(userData);
}

function getUserPool(){
  return new AmazonCognitoIdentity.CognitoUserPool(poolData);
}

// Login User
function getAuthDetails(email, password) {
  var authenticationData = {
    Username: email,
    Password: password,
   };
  return new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
}

// Initialize config aws
function initAWS (region = aws_region, identityPoolId = process.env.AWS_COGNITO_IDENTITY_POOL_ID) {
  AWS.config.region = region;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId,
  });
}

// Generate Token
function decodeJWTToken(token) {
  const {  email, exp, auth_time , token_use, sub} = jwt_decode(token.idToken);
  return {  token, email, exp, uid: sub, auth_time, token_use };
}

module.exports = {
  initAWS,
  getCognitoAttributeList,
  getUserPool,
  getCognitoUser,
  setCognitoAttributeList,
  getAuthDetails,
  decodeJWTToken
}