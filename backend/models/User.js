const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
  name: {type: String,required: true},

  email: {type: String,required: true,unique: true},

  password: {type: String,required: true},

  type: {type: String, enum: ['user', 'artist', 'collector'],default: 'user'},

  followers: [{type: mongoose.Schema.Types.ObjectId,ref: 'User'}],

  following: [ {type: mongoose.Schema.Types.ObjectId,ref: 'User'}],

  avatarURL: String,

  // Artist-Specific Fields
  artistProfile: {
    bio: String,
    specialties: [String],
    website: String,
    artworks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },

  // Collector-Specific Fields
  collectorProfile: {
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
    collection: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }

}, {timestamps: true});



// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);