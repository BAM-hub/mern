const express = require('express');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');
const router = express.Router();
// @route   POST api/users
// @desc    Register User
// @access  public
router.post('/',
 [
   check('name', 'Name is requierd')
     .not()
     .isEmpty(),
     check('email', 'Please include a valid email')
     .isEmail(),
    check(
        'password',
        'please enter a password with 6 or more characters'
    ).isLength({ min: 6 }) 
 ],
 async (req, res) => {
   const errors = validationResult(req);
   if(!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
   }

   const { name, email, password } = req.body;

   try{
    //see if user exists
    let user = await User.findOne({ email });

    if(user) {
        return res.status(400).json({ errors: [{ msg:'user already exists'}] });
    }

    //get users gravatar
    const avatar = gravatar.url( email, {
        s: '200',
        r: 'pg',
        d: 'mm'
    });

    user = new User({
        name,
        email,
        avatar,
        password
    });

    //encrypt password
    const salt = await bcrypt.genSalt(10); //to fo the hashing with

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    //return jsonwebtoken
    const payload = {
        user: {
            id: user.id
        }
    }
    jwt.sign(
        payload, 
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) =>{
            if(err) throw err;
            res.json({ token });
        }
    );
    //res.send('user registerd');
   } catch(err) {
      console.error(err.message);
      res.status(500).send('Server error');
   }

   
 }
);

module.exports = router;