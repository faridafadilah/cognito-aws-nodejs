const Cognito = require("../cognito-service/index");
require("dotenv").config();

async function SignUp(req, res) {
  const {body} = req;
  if(body.email && body.password && body.username && body.phoneNumber) {
    const {email, password, username, phoneNumber} = body;
    try {
      const response = await Cognito.signUp(email, password, username, phoneNumber);
      res.json(response);
    } catch (err) {
      console.log(err);
      res.json({ "error": err });
    }

  } else {
    res.json({ "error": "bad format" });
  }
}

async function SignIn(req, res) {
  const { body } = req;
  if (body.email && body.password) {
    const { email, password } = body;
    try {
      const response = await Cognito.signIn(email, password);
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.json({ "error": err });
    }

  } else {
    res.json({ "error": "bad format" });
  }
}

async function Verify(req, res) {
  const { body } = req;
  if (body.email && body.codeEmailVerify) {
    const { email, codeEmailVerify } = body;
    try {
      const response = await Cognito.verify(email, codeEmailVerify);
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.json({ "error": err });
    }

  } else {
    res.json({ "error": "bad format" });
  }
}

async function ResetPassword(req, res) {
  const { body } = req;
  if (body.email && body.codeEmailVerify && body.newpassword) {
    const { email, codeEmailVerify, newpassword } = body;
    try {
      const response = await Cognito.verifyResetPassword(email, codeEmailVerify, newpassword);
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.json({ "error": err });
    }

  } else {
    res.json({ "error": "bad format" });
  }
}

async function VerifyToken(req, res, next) {
  const idToken = req.headers.authorization; // Assuming the token is sent in the Authorization header

  if (!idToken) {
    return res.status(401).json({ message: "Token missing" });
  }

  const verificationResult = Cognito.verifyToken(idToken);

  if (verificationResult.valid) {
    // Token is valid, you can access the decoded token with verificationResult.decodedToken
    // res.status(200).json({ message: "Token is valid", decodedToken: verificationResult.decodedToken });
    req.user = verificationResult.decodedToken;
    console.log(verificationResult.decodedToken);
    next();
    // res.status(200).json({ message: "Success Verify", error: verificationResult });
  } else {
    res.status(401).json({ message: "Token is not valid", error: verificationResult.message });
  }
}

async function ChangePassword(req, res) {
  const { body } = req;

  if (body.email && body.oldpassword && body.newpassword) {
    let { email, oldpassword, newpassword } = body;
    try {
      let result = await Cognito.changePassword(email, oldpassword, newpassword);
      res.status(200).json({ "result": result });
    } catch (err) {
      console.log(err);
      res.json({ "error": err });
    }

  } else {
    res.json({ "error": "bad format" });
  }
}

async function RefreshToken(req, res) {
  const {body} = req;

  if(body.email && body.token) {
    let {email, token} = body;

    try {
      const result = await Cognito.renewToken(token, email);
      res.json(result);
    } catch (err) {
      console.log(err);
      res.json({ "error": err });
    }

  } else {
    res.json({ "error": "bad format" });
  }
}

async function ForgotPassword(req, res) {
  const { body } = req;
  if (body.email) {
    const { email } = body;
    try {
      const response = await Cognito.forgotPassword(email);
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.json({ error: err });
    }
  } else {
    res.json({ error: "bad format" });
  }
}

async function getUser(req, res) {
  const idToken = req.headers.authorization; // Assuming the token is sent in the Authorization header

  if (!idToken) {
    return res.status(401).json({ message: "Token missing" });
  }

  const verificationResult = Cognito.verifyToken(idToken);

  if (verificationResult.valid) {
    const {email, phone_number, address, birthdate, name, gender} = verificationResult.decodedToken;
    res.status(200).json({ message: "Success", result: {email, phone_number, address, birthdate, name, gender} });
  } else {
    res.status(401).json({ message: "Token is not valid", error: verificationResult.message });
  }
}

async function updateUsers(req, res) {
  const username = req.user.email;
  const idToken = req.headers.authorization;
  if (username && req.body.address && req.body.phoneNumber && req.body.gender && req.body.birthdate && req.body.name) {
  const {address, phoneNumber, gender, birthdate, name} = req.body;
    try {
      const response = await Cognito.updateUser(idToken, username, address, phoneNumber, gender, birthdate, name);
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.json({ error: err });
    }
  } else {
    res.json({ error: "bad format" });
  }
}



module.exports = {
  SignIn, Verify, SignUp, VerifyToken, ChangePassword, RefreshToken, ForgotPassword, ResetPassword, getUser, updateUsers
}