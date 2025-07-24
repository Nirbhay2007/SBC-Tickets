import fs from 'fs';
import path from 'path';

const QUEUE_FILE = path.join(process.cwd(), 'data', 'queue.json');

function ensureQueueFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(QUEUE_FILE)) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify({}, null, 2));
  }
}

function loadQueue() {
  ensureQueueFile();
  try {
    return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading queue:', error);
    return {};
  }
}

function saveQueue(queue) {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  } catch (error) {
    console.error('Error saving queue:', error);
  }
}

export const addToQueue = (ticketType, userId, ticketData) => {
  const queue = loadQueue();
  
  if (!queue[ticketType]) {
    queue[ticketType] = [];
  }
  
  // Check if user is already in queue
  const existingIndex = queue[ticketType].findIndex(item => item.userId === userId);
  if (existingIndex !== -1) {
    // Update existing entry
    queue[ticketType][existingIndex] = {
      ...queue[ticketType][existingIndex],
      ...ticketData,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new entry
    queue[ticketType].push({
      userId,
      ...ticketData,
      addedAt: new Date().toISOString(),
      priority: ticketData.priority || 'normal'
    });
  }
  
  // Sort by priority and time
  queue[ticketType].sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
    const aPriority = priorityOrder[a.priority] || 2;
    const bPriority = priorityOrder[b.priority] || 2;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    return new Date(a.addedAt) - new Date(b.addedAt); // Earlier time first
  });
  
  saveQueue(queue);
  return queue[ticketType].findIndex(item => item.userId === userId) + 1;
};

export const removeFromQueue = (ticketType, userId) => {
  const queue = loadQueue();
  
  if (!queue[ticketType]) {
    return false;
  }
  
  const initialLength = queue[ticketType].length;
  queue[ticketType] = queue[ticketType].filter(item => item.userId !== userId);
  
  saveQueue(queue);
  return queue[ticketType].length < initialLength;
};

export const getQueuePosition = (ticketType, userId) => {
  const queue = loadQueue();
  
  if (!queue[ticketType]) {
    return 0;
  }
  
  const position = queue[ticketType].findIndex(item => item.userId === userId);
  return position === -1 ? 0 : position + 1;
};

export const getQueueLength = (ticketType) => {
  const queue = loadQueue();
  return queue[ticketType] ? queue[ticketType].length : 0;
};

export const getNextInQueue = (ticketType) => {
  const queue = loadQueue();
  
  if (!queue[ticketType] || queue[ticketType].length === 0) {
    return null;
  }
  
  return queue[ticketType][0];
};

export const getQueueStats = () => {
  const queue = loadQueue();
  const stats = {};
  
  for (const [ticketType, tickets] of Object.entries(queue)) {
    stats[ticketType] = {
      total: tickets.length,
      urgent: tickets.filter(t => t.priority === 'urgent').length,
      high: tickets.filter(t => t.priority === 'high').length,
      normal: tickets.filter(t => t.priority === 'normal').length,
      low: tickets.filter(t => t.priority === 'low').length,
      oldestTicket: tickets.length > 0 ? tickets[tickets.length - 1].addedAt : null
    };
  }
  
  return stats;
};
