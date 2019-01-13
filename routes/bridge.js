const express = require('express');
const router = express.Router();
const {User,FavoriteTech,FavoriteCategory} = require('../models/index');

router.post('/submit', async(req,res,next)=>{
    try{
        const user = await User.find({where: {id: req.body.id}});
        const result = await Promise.all(
            req.body.favoriteTech.map(tech => 
                FavoriteTech.findOrCreate({where: {title: tech}})    
            )
        )
        await user.addFavoriteTeches(result.map(r => r.id));
        
    }catch(err){
        next(err);
    }
})

router.post('/next', async(req,res,next)=>{
    try{
        const
    }catch(err){

    }
})

module.exports=router