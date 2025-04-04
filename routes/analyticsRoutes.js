const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Project = require('../models/Project');

router.get('/message-metrics', async (req, res) => {
  try {
    const projectMetrics = await Project.aggregate([
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'projectId',
          as: 'messages'
        }
      },
      {
        $unwind: '$messages'
      },
      {
        $group: {
          _id: '$name',
          totalSent: { $sum: 1 },
          totalDelivered: { $sum: { $cond: [{ $eq: ['$messages.status', 'delivered'] }, 1, 0] } },
          totalRead: { $sum: { $cond: [{ $eq: ['$messages.status', 'read'] }, 1, 0] } }
        }
      }
    ]);
    res.json(projectMetrics);
  } catch (error) {
    console.error('Error fetching message metrics:', error);
    res.status(500).json({ message: 'Failed to fetch message metrics', error: error });
  }
});

module.exports = router;