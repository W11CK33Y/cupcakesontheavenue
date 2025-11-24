/**
 * Live Status & Notifications API for Discord Bot Commands
 * Add these endpoints to your sumup-backend
 */

const express = require('express');
const router = express.Router();

// Store live status in memory (use database in production)
let liveStatus = {
  marketStatus: null, // 'open' | 'closed' | null
  announcement: null,
  poll: null
};

/**
 * GET /api/live-status
 * Get current live status (market, announcements, polls)
 */
router.get('/live-status', (req, res) => {
  try {
    res.json({
      success: true,
      marketStatus: liveStatus.marketStatus,
      announcement: liveStatus.announcement,
      poll: liveStatus.poll
    });
  } catch (error) {
    console.error('Error fetching live status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live status'
    });
  }
});

/**
 * POST /api/market-status
 * Update market status (from Discord bot !market command)
 */
router.post('/market-status', (req, res) => {
  try {
    const { status } = req.body; // 'open' | 'closed'
    
    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "open" or "closed"'
      });
    }
    
    liveStatus.marketStatus = status;
    
    res.json({
      success: true,
      message: `Market status updated to ${status}`,
      marketStatus: status
    });
  } catch (error) {
    console.error('Error updating market status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update market status'
    });
  }
});

/**
 * POST /api/announcement
 * Create new announcement (from Discord bot !announce command)
 */
router.post('/announcement', (req, res) => {
  try {
    const { message, important } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    const announcement = {
      id: `announcement_${Date.now()}`,
      message: message.trim(),
      important: important || false,
      createdAt: new Date().toISOString()
    };
    
    liveStatus.announcement = announcement;
    
    // Clear announcement after 30 minutes
    setTimeout(() => {
      if (liveStatus.announcement && liveStatus.announcement.id === announcement.id) {
        liveStatus.announcement = null;
      }
    }, 30 * 60 * 1000);
    
    res.json({
      success: true,
      message: 'Announcement created',
      announcement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create announcement'
    });
  }
});

/**
 * POST /api/poll
 * Create or update poll (from Discord bot !poll command)
 */
router.post('/poll', (req, res) => {
  try {
    const { question, options, active } = req.body;
    
    if (active === false) {
      // Close poll
      if (liveStatus.poll) {
        liveStatus.poll.active = false;
      }
      return res.json({
        success: true,
        message: 'Poll closed',
        poll: liveStatus.poll
      });
    }
    
    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 options are required'
      });
    }
    
    // Create new poll
    const poll = {
      id: `poll_${Date.now()}`,
      question: question || 'Vote for Next Flavor!',
      options: options.map(opt => ({
        text: opt,
        votes: 0
      })),
      active: true,
      createdAt: new Date().toISOString()
    };
    
    liveStatus.poll = poll;
    
    res.json({
      success: true,
      message: 'Poll created',
      poll
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create poll'
    });
  }
});

/**
 * POST /api/poll-vote
 * Record a vote on active poll
 */
router.post('/poll-vote', (req, res) => {
  try {
    const { pollId, option } = req.body;
    
    if (!liveStatus.poll || liveStatus.poll.id !== pollId) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found or expired'
      });
    }
    
    if (!liveStatus.poll.active) {
      return res.status(400).json({
        success: false,
        error: 'Poll is closed'
      });
    }
    
    // Find option and increment vote
    const optionObj = liveStatus.poll.options.find(opt => opt.text === option);
    
    if (!optionObj) {
      return res.status(400).json({
        success: false,
        error: 'Invalid option'
      });
    }
    
    optionObj.votes++;
    
    res.json({
      success: true,
      message: 'Vote recorded',
      poll: liveStatus.poll
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record vote'
    });
  }
});

/**
 * GET /api/poll/results
 * Get poll results (for Discord bot)
 */
router.get('/poll/results', (req, res) => {
  try {
    if (!liveStatus.poll) {
      return res.status(404).json({
        success: false,
        error: 'No active poll'
      });
    }
    
    const totalVotes = liveStatus.poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    
    const results = liveStatus.poll.options.map(opt => ({
      option: opt.text,
      votes: opt.votes,
      percentage: totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : 0
    }));
    
    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);
    
    res.json({
      success: true,
      poll: liveStatus.poll,
      totalVotes,
      results
    });
  } catch (error) {
    console.error('Error getting poll results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get poll results'
    });
  }
});

/**
 * DELETE /api/announcement
 * Clear current announcement
 */
router.delete('/announcement', (req, res) => {
  try {
    liveStatus.announcement = null;
    
    res.json({
      success: true,
      message: 'Announcement cleared'
    });
  } catch (error) {
    console.error('Error clearing announcement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear announcement'
    });
  }
});

module.exports = router;

/**
 * Discord Bot Integration Examples:
 * 
 * !market live
 * POST /api/market-status { "status": "open" }
 * 
 * !market closed
 * POST /api/market-status { "status": "closed" }
 * 
 * !announce Fresh batch ready at 2pm!
 * POST /api/announcement { "message": "Fresh batch ready at 2pm!", "important": false }
 * 
 * !poll flavors Lemon,Caramel,Strawberry
 * POST /api/poll { "question": "Vote for Next Flavor!", "options": ["Lemon", "Caramel", "Strawberry"], "active": true }
 * 
 * !poll close
 * POST /api/poll { "active": false }
 */
