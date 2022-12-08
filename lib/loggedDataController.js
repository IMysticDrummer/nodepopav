'use strict';
const {Usuario}=require('../models');

module.exports=async (req, res, next)=>{
  const userId=req.session.userLogged;
  console.log(userId)
  try {
    const user=await Usuario.findById(userId);

    if(!user) {
      next(new Error('User not found'));
      return;
    }

    req.userEmail=user.email;
    next();
  } catch (err) {
    next(err);
  }

}