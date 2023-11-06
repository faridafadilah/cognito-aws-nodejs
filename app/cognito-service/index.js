const AwsConfig = require('../config/aws.config');
const jwt_decode = require("jwt-decode");
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

function signUp(email, password, username, phoneNumber, agent = 'none') {
  return new Promise((resolve) => {
    AwsConfig.initAWS();
    AwsConfig.setCognitoAttributeList(email, username, phoneNumber, agent);
    AwsConfig.getUserPool().signUp(email, password, AwsConfig.getCognitoAttributeList(), null, (err, result) => {
      if (err) {
        return resolve({ statuscode: 422, response: err });
      }
      const response = {
        username: result.user.username,
        userConfirmed: result.userConfirmed,
        userAgent: result.user.client.userAgent,
      }
      console.log(result);
      return resolve({ statuscode: 201, response: response });
    });
  });
}

function verify(email, code) {
  return new Promise((resolve, reject) => {
    AwsConfig.getCognitoUser(email).confirmRegistration(code, true, (err, result) => {
      if (err) {
        return reject({ statuscode: 422, response: err });
      }
      return resolve({ statuscode: 200, response: result });
    });
  });
}


function verifyResetPassword(email, code, newpassword) {
  return new Promise((resolve, reject) => {
    AwsConfig.getCognitoUser(email).confirmPassword(code, newpassword, {
      onSuccess: (result) => {
        resolve({ statuscode: 200, response: result });
      },
      onFailure: (err) => {
        resolve({ statuscode: 422, response: err });
      },
    });
  });
}


function signIn(email, password) {
  return new Promise((resolve) => {
    AwsConfig.getCognitoUser(email).authenticateUser(AwsConfig.getAuthDetails(email, password), {
      onSuccess: (result) => {
        const token = {
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        }
        return resolve({ statuscode: 200, response: AwsConfig.decodeJWTToken(token) });
      },
      onFailure: (err) => {
        return resolve({ statuscode: 400, response: err.message || JSON.stringify(err) });
      },
    });
  });
}

function verifyToken(idToken) {
  try {
    // Decode the JWT token
    const decodedToken = jwt_decode(idToken);

    // Check if the token is expired
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    if (decodedToken.exp < currentTimestamp) {
      return { valid: false, message: "Token has expired" };
    }

    // You can add more custom checks here if needed, e.g., check the token's content

    return { valid: true, decodedToken };
  } catch (error) {
    return { valid: false, message: "Invalid token format" };
  }
}

function changePassword(email, currentPassword, newPassword) {
  return new Promise((resolve, reject) => {
    const cognitoUser = AwsConfig.getCognitoUser(email);

    // Authenticate the user using the current password
    cognitoUser.authenticateUser(AwsConfig.getAuthDetails(email, currentPassword), {
      onSuccess: () => {
        // Change the password
        cognitoUser.changePassword(currentPassword, newPassword, (err) => {
          if (err) {
            reject({ statuscode: 400, response: err.message || JSON.stringify(err) });
          } else {
            resolve({ statuscode: 200, response: 'Password changed successfully' });
          }
        });
      },
      onFailure: (err) => {
        reject({ statuscode: 400, response: err.message || JSON.stringify(err) });
      },
    });
  });
}


function renewToken(token, name) {
  return new Promise((resolve, reject) => {
    const userPool = AwsConfig.getUserPool();
    const userData = {
      Username: name,
      Pool: userPool,
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    const refreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: token });

    cognitoUser.refreshSession(refreshToken, (err, session) => {
      if (err) {
        reject({ statuscode: 400, response: err.message || JSON.stringify(err) });
      } else {

        const token = {
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        };
        resolve({ statuscode: 200, response: AwsConfig.decodeJWTToken(token) });
      }
    });
  });
}

function forgotPassword(email) {
  return new Promise((resolve, reject) => {
    const cognitoUser = AwsConfig.getCognitoUser(email);

    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        resolve({ statuscode: 200, response: 'Forgot password request sent successfully' });
      },
      onFailure: (err) => {
        reject({ statuscode: 400, response: err });
      },
    });
  });
}

function newPasswordChallenge(email, code, newPassword) {
  return new Promise((resolve, reject) => {
    const user = AwsConfig.getCognitoUser(email);
    // Lakukan verifikasi tantangan custom
    user.sendCustomChallengeAnswer(code, {
      newPassword: newPassword
    }, {
      onSuccess: () => {
        // Jika pengguna berhasil melewati tantangan custom
        resolve({ statuscode: 200, response: 'Kata sandi berhasil direset' });
      },
      onFailure: (err) => {
        // Jika pengguna gagal melewati tantangan custom
        resolve({ statuscode: 422, response: err });
      },
    });
  });
}
function updateUser(idToken, username, address, phoneNumber, gender, birthdate, name) {
  return new Promise((resolve, reject) => {
    const decodedToken = jwt_decode(idToken);
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);

    if (decodedToken.exp < currentTimestamp) {
      return resolve({ statuscode: 401, response: "Token has expired" });
    }

    const cognitoUser = AwsConfig.getCognitoUser(username);
    AwsConfig.setCognitoAttributeList(username, address, phoneNumber, gender, birthdate, name);
    const attributeList = AwsConfig.getCognitoAttributeList();
    
    try {
      cognitoUser.getSession((err, session) => {
        if (err) {
          return reject({ statuscode: 401, response: "Unauthorized" });
        }
        console.log('session validity: ' + session.isValid());
      cognitoUser.updateAttributes(attributeList, function (err, result) {
        if (err) {
          console.log(err);
          return resolve({ statuscode: 422, response: err });
        }
        return resolve({ statuscode: 201, response: result });
      });
    });
    } catch (error) {
      console.log(error);
      return resolve({ statuscode: 500, response: "Internal server error" });
    }
  });
}


module.exports = {
  signUp,
  verify,
  signIn,
  verifyToken,
  changePassword,
  renewToken,
  forgotPassword,
  verifyResetPassword,
  newPasswordChallenge,
  updateUser
}