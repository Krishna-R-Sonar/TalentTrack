// backend/utils/impactPoints.js
import { PointTransaction } from '../models/pointTransactionSchema.js';
import { User } from '../models/userSchema.js';

const ACTION_POINTS = {
    'completed_course': 10, 'mentored_session': 20, 'referred_candidate': 15,
    'wrote_article': 10, 'flagged_bias': 5, 'opted_low_bandwidth': 5,
    'completed_pro_bono': 30, 'sponsored_scholarship': 10, 'hosted_skill_sprint': 20,
    'posted_impact_role': 15, 'published_diversity_report': 10, 'resolved_bias_flag': 10,
    'achieved_green_certification': 25, 'engaged_pro_bono_volunteer': 30,
    // New actions for enhanced features
    'accepted_connection': 5, 'sent_endorsement': 3, 'received_endorsement': 2,
    'joined_group': 5, 'created_group': 15, 'posted_in_group': 2,
    'attended_event': 10, 'hosted_event': 25, 'registered_for_event': 3,
};

const ACTION_CATEGORIES = {
    'completed_course': 'Upskilling & Access', 'mentored_session': 'Mentoring & Volunteering',
    'referred_candidate': 'Referral & Inclusion', 'wrote_article': 'Content & Community',
    'flagged_bias': 'Bias-Auditing & Fairness', 'opted_low_bandwidth': 'Green & Sustainability',
    'completed_pro_bono': 'Pro Bono & Volunteer Matches', 'sponsored_scholarship': 'Upskilling & Access',
    'hosted_skill_sprint': 'Mentoring & Volunteering', 'posted_impact_role': 'Referral & Inclusion',
    'published_diversity_report': 'Content & Community', 'resolved_bias_flag': 'Bias-Auditing & Fairness',
    'achieved_green_certification': 'Green & Sustainability', 'engaged_pro_bono_volunteer': 'Pro Bono & Volunteer Matches',
    // New categories for enhanced features
    'accepted_connection': 'Networking & Connections', 'sent_endorsement': 'Community & Recognition',
    'received_endorsement': 'Community & Recognition', 'joined_group': 'Community & Groups',
    'created_group': 'Community & Groups', 'posted_in_group': 'Community & Groups',
    'attended_event': 'Learning & Events', 'hosted_event': 'Learning & Events',
    'registered_for_event': 'Learning & Events',
};

export const awardPoints = async (userId, action) => {
    const points = ACTION_POINTS[action];
    const category = ACTION_CATEGORIES[action];

    if (!points || !category) {
        throw new Error('Invalid action type for awarding points.');
    }

    await PointTransaction.create({ user: userId, action, category, points });

    const user = await User.findById(userId);
    user.totalImpactPoints += points;
    
    const currentCategoryPoints = user.impactPointsByCategory.get(category) || 0;
    user.impactPointsByCategory.set(category, currentCategoryPoints + points);

    if (user.totalImpactPoints >= 250) {
        user.impactTier = 'Gold';
    } else if (user.totalImpactPoints >= 100) {
        user.impactTier = 'Silver';
    } else {
        user.impactTier = 'Bronze';
    }
    
    await user.save();
};