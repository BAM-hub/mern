const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile
    .findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar']);
    
    if(!profile) {
        return res.status(400).json({msg: 'there is no profile for this user'});
    }
    
    res.json(profile);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
  }
});

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private

router.post('/', [ auth, [
  check('status', 'status is requierd')
   .not()
   .isEmpty(),
  check('skills', 'skills is requierd') 
   .not()
   .isEmpty()
] ], 
async (req, res) =>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(404).json({ errors: errors.array() })
  }

  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  }  = req.body;

  //Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;
  if (skills){
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }

  //test
  //console.log(profileFields.skills);
  //res.send('hello');

  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if(profile){
      //update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

        return res.json(profile);
    }
    profile = new Profile(profileFields);

    await profile.save();
    return res.json(profile);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

// @route   GET api/profile
// @desc    CET ALL profileS
// @access  Prublic
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    GET profile by user id
// @access  Prublic
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id})
    .populate('user', ['name', 'avatar']);

    if(!profile) return res.status(400).json({ msg: 'there is no profile for this user' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'objectId') {
      return res.status(400).json({ msg: 'there is no profile for this user' });
    }
    res.status(500).send('server error');
  }
});

// @route   DELETE api/profile
// @desc    Delete  profile user & posts
// @access  Prublic
router.delete('/', auth, async (req, res) => {
  try {
    //@todo - remove users posts

    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    
    //remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({msg: 'user deleted'});

  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});


module.exports = router;