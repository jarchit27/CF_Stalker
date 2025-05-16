const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendSchema = new Schema({
  handle: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rank: String,
  rating: Number,
  maxRank: String,
  maxRating: Number,
  contestCount: Number,
  problemsSolved: Number,
  fetchedAt: {
    type: Date,
    default: Date.now,
  },

});
friendSchema.index({ handle: 1, userId: 1 }, { unique: true });

module.exports  = mongoose.model('Friend', friendSchema);