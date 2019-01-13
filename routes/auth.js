const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.get('/kakao',passport.authenticate('kakao'));
router.get('/kakao/callback',passport.authenticate('kakao',{
    failureMessage: '잘못된 카카오 회원 입니다.',
    session: false
}), async(req,res)=>{
    try{
        const token = jwt.sign({
            id: req.user.id,
            snsId : req.user.snsId,
            nick: req.user.nick,
            profile: req.user.profile
        }, process.env.JWT_SECRET,{
            expiresIn : '6h',
            issuer: 'jobstates'
        });
        BearerToken = "Bearer " + token;
        //res.redirect
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.get('/naver',passport.authenticate('naver'));
router.get('/naver/callback',passport.authenticate('naver',{
    failureMessage: '잘못된 네이버 회원 입니다.',
    session: false
}), async (req,res)=>{
    try{
        const token = jwt.sign({
            id: req.user.id,
            snsId : req.user.snsId,
            nick: req.user.nick,
            profile: req.user.profile
        }, process.env.JWT_SECRET,{
            expiresIn : '6h',
            issuer: 'jobstates'
        });
        BearerToken = "Bearer " + token;
        //res.redirect
    }catch(err){
        console.log(err);
        next(err);
    }
})


module.exports = router;
