const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    message: {
      type: String,
      required: true,
      maxlength: 300
    },
    type: {
      type: String,
      enum: ['task-created', 'task-reminder', 'task-deadline', 'class-start'],
      required: true
    },
    eventKey: {
      type: String,
      required: true,
      index: true
    },
    details: {
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: null
      },
      title: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        default: ''
      },
      reminderTime: {
        type: Date,
        default: null
      },
      deadline: {
        type: Date,
        default: null
      },
      status: {
        type: String,
        default: ''
      }
    },
    read: {
      type: Boolean,
      default: false
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, eventKey: 1 }, { unique: true });

module.exports = mongoose.model('Notification', notificationSchema);