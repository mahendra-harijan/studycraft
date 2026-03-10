const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startMinutes: {
      type: Number,
      required: true,
      min: 0,
      max: 1439
    },
    endMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 1440
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    weeklyRepeat: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

scheduleSchema.index(
  {
    userId: 1,
    subject: 1,
    day: 1,
    startMinutes: 1,
    endMinutes: 1,
    venue: 1
  },
  { unique: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);