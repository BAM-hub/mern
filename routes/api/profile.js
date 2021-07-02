const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

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
    return res.status(400).json({ errors: errors.array() });
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

// @route   PUT api/profile/experience
// @desc    Add  profile experience
// @access  private
router.put('/experience', [auth, [
  check('title', 'title is requierd')
  .not()
  .isEmpty(),
  check('company', 'company is requierd')
  .not()
  .isEmpty(),
  check('from', 'from date is requierd')
  .not()
  .isEmpty(),

]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty) {
    return this.status(400).json({ errors: errors.array() });
  }
  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }
  try {

    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(newExp); // adds at the start
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route   DELETE api/profile/experience
// @desc    Delete experience from profile 
// @access  private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      
      //Get the remove index 
      const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
      profile.experience.splice(removeIndex, 1);// splice takes out the value
      
      await profile.save();
      res.json(profile);

    } catch (err) {
      console.error(err.message);
      return res.status(500).send('server error');
    }
  }
);

// @route   PUT api/profile/education
// @desc    Add  profile education
// @access  private
router.put('/education', [auth, [
  check('school', 'School is requierd')
  .not()
  .isEmpty(),
  check('degree', 'Degree is requierd')
  .not()
  .isEmpty(),
  check('fieldofstudy', 'field of study is requierd')
  .not()
  .isEmpty(),
  check('from', 'from date is requierd')
  .not()
  .isEmpty(),

]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty) {
    return this.status(400).json({ errors: errors.array() });
  }
  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body;

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }
  try {

    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEdu); // adds at the start
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
// @route   DELETE api/profile/education
// @desc    Delete education from profile 
// @access  private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      
      //Get the remove index 
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      profile.education.splice(removeIndex, 1);// splice takes out the value
      
      await profile.save();
      res.json(profile);

    } catch (err) {
      console.error(err.message);
      return res.status(500).send('server error');
    }
  }
);
// @route   GET api/profile/github/:username
// @desc    Get user repos from github 
// @access  public

router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'nodes.js' }
    };

    request(options, (error, response, body) => {
      if(error) console.error(error);

      if(response.statusCode !== 200) {
        res.status(404).json({ msg: 'No github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('server error');
  }
});
module.exports = router;