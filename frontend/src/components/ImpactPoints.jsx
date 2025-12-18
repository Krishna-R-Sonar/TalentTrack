// frontend/src/components/ImpactPoints.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getUser } from '../store/slices/userSlice';

const ImpactPoints = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { totalImpactPoints, impactPointsByCategory, impactTier } = user;
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/v1/user/impact/transactions', {
          withCredentials: true,
        });
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      }
    };
    fetchTransactions();
  }, []);

  const handleRedeem = async (rewardId, points) => {
    if (totalImpactPoints < points) {
      toast.error('Insufficient points');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:4000/api/v1/user/impact/redeem',
        { rewardId },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      dispatch(getUser());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to redeem reward');
    }
  };

  const tierColors = {
    'Bronze': 'bg-amber-100 text-amber-800 border-amber-300',
    'Silver': 'bg-gray-100 text-gray-800 border-gray-300',
    'Gold': 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Impact Points</h1>
        
        {/* Points Summary Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Total Points</h2>
              <p className="text-4xl font-bold text-primary mt-2">{totalImpactPoints || 0}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 ${tierColors[impactTier] || tierColors['Bronze']}`}>
              <p className="text-sm font-medium">Current Tier</p>
              <p className="text-xl font-bold">{impactTier || 'Bronze'}</p>
            </div>
          </div>
        </div>

        {/* Points by Category */}
        {impactPointsByCategory && Object.keys(impactPointsByCategory).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">Points by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(impactPointsByCategory).map(([category, points]) => (
                <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-lg font-bold text-primary">{points || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-800">{tx.action?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">+{tx.points} points</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions yet. Start engaging to earn points!</p>
          )}
        </div>

        {/* Redeem Rewards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Redeem Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'skill_up_credit', name: 'Skill-Up Credit', points: 100, description: 'Get credits for skill development courses' },
              { id: 'visibility_boost', name: 'Visibility Boost', points: 150, description: 'Increase your profile visibility' },
              { id: 'community_perk', name: 'Community Perk', points: 200, description: 'Exclusive community benefits' },
              { id: 'charitable_grant', name: 'Charitable Grant', points: 250, description: 'Donate to a cause of your choice' },
            ].map((reward) => (
              <div key={reward.id} className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold text-lg mb-1">{reward.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">{reward.points} points</span>
                  <button
                    onClick={() => handleRedeem(reward.id, reward.points)}
                    disabled={(totalImpactPoints || 0) < reward.points}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      (totalImpactPoints || 0) >= reward.points
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Redeem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactPoints;