import mongoose from 'mongoose';

const technologySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String, // Cloudinary image URL or name
      required: false,
    },
    category: {
      type: String,
      default: 'Frontend', // Frontend, Backend, Cloud, database, AI/ML, etc.
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Technology = mongoose.model('Technology', technologySchema);
export default Technology;
