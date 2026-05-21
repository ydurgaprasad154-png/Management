import mongoose from 'mongoose';

const domainSchema = mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Client',
    },
    domainName: {
      type: String,
      required: true,
    },
    purchaseDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    hostingProvider: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Pending Renewal'],
      default: 'Active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Domain = mongoose.model('Domain', domainSchema);
export default Domain;
