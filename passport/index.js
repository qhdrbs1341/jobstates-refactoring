const kakao = require('./kakaoStrategy');
const facebook = require('./facebookStrategy');
const naver = require('./naverStrategy');
module.exports=(passport)=>{
    kakao(passport);
    facebook(passport);
    naver(passport);
}
