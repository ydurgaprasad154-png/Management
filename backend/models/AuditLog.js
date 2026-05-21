import mongoose from 'mongoose';

const auditLogSchema = mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    entity: {
      type: String, // e.g., 'Project', 'Payment', 'Client'
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changes: {
      type: Object, // Store what was changed
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
