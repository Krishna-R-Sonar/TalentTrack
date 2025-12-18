// backend/models/pointTransactionSchema.js
import mongoose from 'mongoose';

const pointTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            'completed_course', 'mentored_session', 'referred_candidate', 'wrote_article',
            'flagged_bias', 'opted_low_bandwidth', 'completed_pro_bono', 'sponsored_scholarship',
            'hosted_skill_sprint', 'posted_impact_role', 'published_diversity_report',
            'resolved_bias_flag', 'achieved_green_certification', 'engaged_pro_bono_volunteer',
        ],
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Upskilling & Access', 'Mentoring & Volunteering', 'Referral & Inclusion',
            'Content & Community', 'Bias-Auditing & Fairness', 'Green & Sustainability',
            'Pro Bono & Volunteer Matches',
        ],
    },
    points: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

export const PointTransaction = mongoose.model('PointTransaction', pointTransactionSchema);