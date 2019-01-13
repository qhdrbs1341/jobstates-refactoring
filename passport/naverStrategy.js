const naverStrategy = require('passport-naver').Strategy;
require('dotenv').config();
const {User} = require('../models/index');

module.exports = (passport)=>{
    passport.use(new naverStrategy({
        clientID: process.env.NAVER_ID,
        clientSecret: process.env.NAVER_SECRET,
        callbackURL: '/auth/naver/callback'
    },async(accessToken, refreshToken, profile, done)=>{
        try{
            const exUser = await User.find({where: {snsId: profile._json.id, provider: 'facebook'}});
            if(exUser){
                done(null,exUser);
            }else{
                const newUser = await User.create({
                    snsId: profile._json.id,
                    nick: profile._json.name,
                    provider: 'naver'
                })
                done(null,newUser);
            }
        }catch(err){
            console.log(err);
            done(err);
        }
    }))
}
