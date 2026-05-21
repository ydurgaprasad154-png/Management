import mongoose from 'mongoose';

const projectSchema = mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Client',
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
      default: 'Not Started',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    note: {
      type: String,
    },
    keyPoints: [
      { type: String }
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    milestones: [
      {
        title: String,
        status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
        dueDate: Date,
      }
    ],
    history: [
      {
        action: String,
        date: { type: Date, default: Date.now },
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
