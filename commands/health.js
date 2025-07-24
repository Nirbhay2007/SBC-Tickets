import { SlashCommandBuilder } from 'discord.js';
import { getMetrics, getPerformanceStats } from '../utils/metrics.js';
import { getQueueStats } from '../utils/queueSystem.js';

export default {
  data: new SlashCommandBuilder()
    .setName('health')
    .setDescription('Check bot health and status')
    .setDefaultMemberPermissions(8), // Administrator only

  async execute(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const queueStats = getQueueStats();
    const botMetrics = getMetrics();
    const performanceStats = getPerformanceStats();

    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    const healthInfo = `
**🤖 Bot Health Status**

**⏱️ Uptime:** ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s

**📊 Memory Usage:**
• Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
• Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
• RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB

**🎫 Queue Statistics:**
• Active Tickets: ${queueStats.activeTickets || 0}
• Pending Queue: ${queueStats.pendingCount || 0}
• Total Processed: ${queueStats.totalProcessed || 0}

**📈 Bot Metrics:**
• Commands Executed: ${Object.values(botMetrics.commandUsage || {}).reduce((a, b) => a + b, 0)}
• Errors Logged: ${Object.keys(botMetrics.errorMetrics || {}).length}
• Performance Avg: ${performanceStats.avgDuration}ms

**✅ Status:** All systems operational
    `;

    await interaction.editReply({
      content: healthInfo
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    await interaction.editReply({
      content: '❌ Health check failed. Please contact an administrator.'
    });
  }
  }
};
