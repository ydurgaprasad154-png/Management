import mongoose from 'mongoose';

const portfolioServiceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String, // SVG path, Cloudinary image url, or Lucide name
      required: false,
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

const PortfolioService = mongoose.model('PortfolioService', portfolioServiceSchema);
export default PortfolioService;
