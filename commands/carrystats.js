import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getCarrierStats, formatCarrierStats, getCarryLeaderboard, getCategoryLeaderboard } from '../utils/carryTracker.js';

export default {
  data: new SlashCommandBuilder()
    .setName('carrystats')
    .setDescription('View carry statistics and leaderboards')
    .addSubcommand(subcommand =>
      subcommand
        .setName('me')
        .setDescription('View your own carry statistics')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('View another user\'s carry statistics')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('The user to check statistics for')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('leaderboard')
        .setDescription('View carry leaderboards')
        .addStringOption(option =>
          option
            .setName('category')
            .setDescription('Category to show leaderboard for')
            .setRequired(false)
            .addChoices(
              { name: 'Overall (All Carries)', value: 'overall' },
              { name: 'Slayer (All)', value: 'slayer' },
              { name: 'Voidgloom (T4 Eman)', value: 'voidgloom' },
              { name: 'Blaze (T2-T4)', value: 'blaze' },
              { name: 'Dungeons (F4-F7)', value: 'dungeon' },
              { name: 'Mastermode (M1-M7)', value: 'mastermode' },
              { name: 'Crimson', value: 'crimson' },
              { name: 'F4 Only', value: 'f4' },
              { name: 'F5 Only', value: 'f5' },
              { name: 'F6 Only', value: 'f6' },
              { name: 'F7 Only', value: 'f7' },
              { name: 'M1 Only', value: 'm1' },
              { name: 'M2 Only', value: 'm2' },
              { name: 'M3 Only', value: 'm3' },
              { name: 'M4 Only', value: 'm4' },
              { name: 'M5 Only', value: 'm5' },
              { name: 'M6 Only', value: 'm6' },
              { name: 'M7 Only', value: 'm7' }
            )
        )
        .addIntegerOption(option =>
          option
            .setName('limit')
            .setDescription('Number of top carriers to show (1-20)')
            .setMinValue(1)
            .setMaxValue(20)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'me') {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const statsDisplay = formatCarrierStats(userId, username);
        
        const embed = new EmbedBuilder()
          .setTitle('📊 Your Carry Statistics')
          .setDescription(statsDisplay)
          .setColor('Blue')
          .setTimestamp()
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        await interaction.reply({ embeds: [embed] });
        
      } else if (subcommand === 'user') {
        const targetUser = interaction.options.getUser('target');
        const statsDisplay = formatCarrierStats(targetUser.id, targetUser.username);
        
        const embed = new EmbedBuilder()
          .setTitle(`📊 ${targetUser.username}'s Carry Statistics`)
          .setDescription(statsDisplay)
          .setColor('Blue')
          .setTimestamp()
          .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));

        await interaction.reply({ embeds: [embed] });
        
      } else if (subcommand === 'leaderboard') {
        const category = interaction.options.getString('category') || 'overall';
        const limit = interaction.options.getInteger('limit') || 10;
        
        let leaderboard, title, emoji;
        
        if (category === 'overall') {
          leaderboard = getCarryLeaderboard(limit);
          title = '🏆 Overall Carry Leaderboard';
          emoji = '🏆';
        } else {
          leaderboard = getCategoryLeaderboard(category, limit);
          
          const categoryInfo = {
            'slayer': { title: 'Slayer Carry Leaderboard', emoji: '🗡️' },
            'voidgloom': { title: 'Voidgloom Carry Leaderboard', emoji: '<:Voidgloom:1395307387681050645>' },
            'blaze': { title: 'Blaze Carry Leaderboard', emoji: '<:Blaze:1395307385281892382>' },
            'dungeon': { title: 'Dungeon Carry Leaderboard', emoji: '🏰' },
            'mastermode': { title: 'Mastermode Carry Leaderboard', emoji: '⚡' },
            'crimson': { title: 'Crimson Carry Leaderboard', emoji: '<:Crimson:1395307385760874517>' },
            'f4': { title: 'F4 Carry Leaderboard', emoji: '<:Thorn:1395307399761403914>' },
            'f5': { title: 'F5 Carry Leaderboard', emoji: '<:Livid:1395307397131952208>' },
            'f6': { title: 'F6 Carry Leaderboard', emoji: '<:Sadan:1395307391913947147>' },
            'f7': { title: 'F7 Carry Leaderboard', emoji: '<:Necron:1395307389820866571>' },
            'm1': { title: 'M1 Carry Leaderboard', emoji: '<:Bonzo:1395307382614028338>' },
            'm2': { title: 'M2 Carry Leaderboard', emoji: '<:Scarf:1395307393931419669>' },
            'm3': { title: 'M3 Carry Leaderboard', emoji: '<:professor:1395307400969945098>' },
            'm4': { title: 'M4 Carry Leaderboard', emoji: '<:Thorn:1395307399761403914>' },
            'm5': { title: 'M5 Carry Leaderboard', emoji: '<:Livid:1395307397131952208>' },
            'm6': { title: 'M6 Carry Leaderboard', emoji: '<:Sadan:1395307391913947147>' },
            'm7': { title: 'M7 Carry Leaderboard', emoji: '<:Necron:1395307389820866571>' }
          };
          
          title = categoryInfo[category]?.title || 'Carry Leaderboard';
          emoji = categoryInfo[category]?.emoji || '🏆';
        }
        
        if (leaderboard.length === 0) {
          await interaction.reply({
            content: `📊 No carry statistics available for ${category === 'overall' ? 'overall' : category} category yet.`,
            ephemeral: true
          });
          return;
        }
        
        let description = '';
        for (let i = 0; i < leaderboard.length; i++) {
          const entry = leaderboard[i];
          const user = await interaction.client.users.fetch(entry.userId).catch(() => null);
          const username = user ? user.username : 'Unknown User';
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          
          if (category === 'overall') {
            description += `${medal} **${username}** - ${entry.totalCarries} carries\n`;
          } else {
            description += `${medal} **${username}** - ${entry.categoryCarries} carries\n`;
          }
        }
        
        const embed = new EmbedBuilder()
          .setTitle(`${emoji} ${title}`)
          .setDescription(description)
          .setColor('Gold')
          .setTimestamp()
          .setFooter({ 
            text: `Top ${limit} carriers${category !== 'overall' ? ` in ${category}` : ''}`,
            iconURL: interaction.guild?.iconURL() || undefined
          });

        await interaction.reply({ embeds: [embed] });
      }
      
    } catch (error) {
      console.error('Error executing carrystats command:', error);
      await interaction.reply({
        content: 'An error occurred while fetching carry statistics.',
        ephemeral: true
      });
    }
  },
};
