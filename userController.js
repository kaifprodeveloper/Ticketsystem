// This works like context api

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

// @desc Register a new user
// @route /api/users
// @access Public
const registerUser = asyncHandler(async (req,res)=>{
  const {name,email,password} = req.body

  // validation
  if(!name || !email || !password){
    res.status(400)
    throw new Error('Please enter all fields')
  }

  // Find if user exists
  const userExists = await User.findOne({email})

  if(userExists){
    res.status(400)
    throw new Error('User already exists.')
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10)
  const hashedPass = await bcrypt.hash(password, salt)

  // create user
  const user = await User.create({
    name,
    email,
    password: hashedPass,
  })

  if(user){
    res.status(201).json({
      _id: user._id,
      name:user.name,
      email: user.email,
      token: generateToken(user._id)
    })
  }else{
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc Login a user
// @route /api/users/login
// @access Public
const loginUser = asyncHandler(async (req,res)=>{
  const {email,password} = req.body
  const user = await User.findOne({email})

  if(user && (await bcrypt.compare(password, user.password))){
    res.status(200).json({
      _id: user._id,
      name:user.name,
      email: user.email,
      token: generateToken(user._id)
    })
  }else{
    res.status(401)
    throw new Error('Invalid Credentials')
  }

  // res.send('Login Route')
})

// @desc Get current user
// @route /api/users/me
// @access Private
const getMe = asyncHandler(async (req,res)=>{
  const user = {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
  }
  res.status(200).json(user)
})


// Generate Token Funtion
const generateToken = (id)=>{
  return jwt.sign({id}, 'JWT_SECRET', {
    expiresIn: '30d',
  })
}

module.exports = {
  registerUser,
  loginUser,
  getMe
}