// backend/models/applicationMetricsSchema.js
import mongoose from 'mongoose';

const applicationMetricsSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    unique: true,
  },
  submissionCount: {
    type: Number,
    default: 0,
  },
});

export const ApplicationMetrics = mongoose.model('ApplicationMetrics', applicationMetricsSchema);