const express = require('express');
const router = express.Router();
const {User, Project, Education, Experience, HaveTech, FavoriteTech, FavoriteCategory} = require('../models/index');
const {profileRead} = require('../middleware/redis-check');
const {profileSaver} = require('../redisSaver/profile-saver')
router.get('/profile',profileRead,async (req,res,next)=>{
    try{
    // const exUser = await User.find({where: { id: req.body.id}, 
    //     include: [{model: HaveTech, attributes: ['title']},{model: FavoriteTech, attributes: ['title']},
    // {model: FavoriteCategory, attributes: ['title']},{model: Project},{model: Education},{model: Experience}]});
    //  const data = {
    //      id: exUser.id,
    //      snsId: exUser.snsId,
    //      profile: exUser.profile,
    //      newUser: exUser.newUser,
    //      nick: exUser.nick,
    //      photo: exUser.photo,
    //      email: exUser.email,
    //      github: exUser.github,
    //      blog: exUser.blog,
    //      phone: exUser.phone,
    //      education: exUser.education,
    //      project: exUser.projects,
    //      experience: exUser.experiences,
    //      haveTech: exUser.haveTeches.map(r => r.title),
    //      favoriteTech: exUser.favoriteTeches.map(r => r.title),
    //      favoriteCategory: exUser.favoriteCategories.map(r => r.title)
    //  };

     //레디스 profile에 저장
    // await client.hmset(req.body.id,'profile',data);
    const data = profileSaver(req.body.id);
    res.json(data);
    }catch(err){
        next(err);
    }
})

router.post('/profile',async (req,res,next)=>{
    try{
   await User.update({
        email: req.body.email,
        profile: req.body.profile,
        blog: req.body.blog,
        github: req.body.github,
        phone: req.body.phone,
        photo: req.body.photo,
        newUser: false
    },{where: {id: req.body.id}})

    const data = profileSaver(req.body.id);
    res.json(data);
    }catch(err){
        next(err);
    }
})

router.post('/project',async (req,res,next)=>{
    try{
    const newProject  = await Project.create({
        term: req.body.term,
        title: req.body.title,
        description: req.body.description,
        userId: req.body.id,
    })

    const data = profileSaver(req.body.id);
    res.json(data);

    }catch(err){
        next(err);
    }
})

router.patch('/project',async(req,res,next)=>{
    try{
    await Project.update({
        term: req.body.term,
        title: req.body.title,
        description: req.body.description
    }, {where: {id: req.body.id}})

    //const updatedProject = await Project.find({where: {id: req.body.id}});

    const data = profileSaver(req.body.id);
    res.json(data);

    }catch(err){
        next(err);
    }
});

router.delete('/project',async(req,res,next)=>{
    try{
    await Project.destroy({where: {id: req.body.id}});
    const data = profileSaver(req.body.id);
    res.json(data);
    }catch(err){
        next(err);
    }
})

router.post('/education',async (req,res,next)=>{
    try{
    const newEducation = await Education.create({
        term: req.body.term,
        organization: req.body.organization,
        content: req.body.content,
        userId: req.body.id
    })
    const data = profileSaver(req.body.id);
    res.json(data);
    }catch(err){
        next(err);
    }
})

router.patch('/education',async(req,res,next)=>{
    try{
        await Education.update({
            term: req.body.term,
            organization: req.body.organization,
            content: req.body.content
        },{where: {id: req.body.id}})
        //const updatedEducation = await Education.find({where: {id: req.body.id}});
        const data = profileSaver(req.body.id);
        res.json(data);
    }catch(err){
        next(err)
    }
})

router.delete('/education',async(req,res,next)=>{
    try{
        await Education.destroy({
            where: {id: req.body.id}
        })
        const data = profileSaver(req.body.id);
        res.json(data);
    }catch(err){
        next(err);
    }
})

router.post('/experience',async (req,res,next)=>{
    try{
    const newExperience = await Experience.create({
        term: req.body.term,
        title: req.body.title,
        content: req.body.content,
        description: req.body.description,
        userId: req.body.id
    })
    const data = profileSaver(req.body.id);
    res.json(data);
    }catch(err){
        next(err);
    }
})

router.patch('/experience',async(req,res,next)=>{
    try{
        await Experience.update({
            term: req.body.term,
            title: req.body.title,
            content: req.body.content,
            description: req.body.description
        },{where: {id: req.body.id}});
        //const updatedExperience = await Experience.find({where: {id: req.body.id}});
        const data = profileSaver(req.body.id);
        res.json(data);
    }catch(err){
        next(err);
    }
})

router.delete('/experience',async(req,res,next)=>{
    try{
        await Experience.destroy({where: {id: req.body.id}});
        const data = profileSaver(req.body.id);
        res.json(data);
    }catch(err){
        next(err);
    }
})

router.post('/havetech',async(req,res,next)=>{
    try{
        const haveTech = req.body.haveTech;
        const result = await Promise.all(
            haveTech.map(tech => 
              HaveTech.findOrCreate({
                where: {title: tech}
              })
            )
          )
          const user = await User.find({where: {id: req.body.id}});
          await user.setHaveTeches(result.map(r => r[0]));

          const data = profileSaver(req.body.id);
          res.json(data);
    }catch(err){
        next(err);
    }
})

router.post('/favoritetech',async(req,res,next)=>{
    try{
        const favoriteTech = req.body.favoriteTech;
        const result = await Promise.all(
            favoriteTech.map(tech => 
              FavoriteTech.findOrCreate({
                where: {title: tech}
              })
            )
          )
        const user = await User.find({where: {id: req.body.id}});
        await user.setFavoriteTeches(result.map(r => r[0]));

        const data = profileSaver(req.body.id);
        res.json(data);
    }catch(err){
        next(err);
    }
})

router.post('/favoritecategory',async(req,res,next)=>{
    try{
        const favoriteCategory = req.body.favoriteCategory;
        const result = await Promise.all(
            favoriteCategory.map(tech => 
              FavoriteCategory.findOrCreate({
                where: {title: tech}
              })
            )
          )
        const user = await User.find({where: {id: req.body.id}});
        await user.setFavoriteCategories(result.map(r => r[0]));
        
        const data = profileSaver(req.body.id);
        res.json(data);
    }catch(err){
        next(err);
    }
})

module.exports = router;
