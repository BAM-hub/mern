const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const PostScheme = new Scheme({
  user: {
    type: Scheme.Types.ObjectId,
    ref: 'users',
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [
    {
      user: {
        type: Scheme.Types.ObjectId,
        ref: 'users'
      }
    }
  ],
  comments: [
    {
      user: {
        type: Scheme.Types.ObjectId,
        ref: 'users'
      },
      text: {
        type: String,
        required: true    
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now  
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now  
  }
});

module.exports = Post = mongoose.model('post', PostScheme);