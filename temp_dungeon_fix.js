async function setupDungeonTicketSystem(channel) {
  // Main dungeon embed
  const mainEmbed = new EmbedBuilder()
    .setTitle('Request a Dungeon Carry')
    .setDescription('Click to open a ticket and get carried!')
    .setColor('Blue')
    .setFooter({ text: 'SBC Ticket tool - Ticketing without clutter' });

  // Dungeon details embed
  const dungeonEmbed = new EmbedBuilder()
    .setTitle('SkyBlockC Dungeon Ticket')
    .setDescription(
      '🌿 F4 - Thorn\n' +
      '💀 F5 - Livid\n' +
      '⚔️ F6 - Sadan\n' +
      '☠️ F7 - Necron'
    )
    .setColor('Blue');

  // Create dungeon floor buttons (4 buttons - all in single row)
  const dungeonButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('dungeon-f4-thorn')
      .setLabel('F4 - Thorn')
      .setEmoji('🌿')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('dungeon-f5-livid')
      .setLabel('F5 - Livid')
      .setEmoji('💀')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('dungeon-f6-sadan')
      .setLabel('F6 - Sadan')
      .setEmoji('⚔️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('dungeon-f7-necron')
      .setLabel('F7 - Necron')
      .setEmoji('☠️')
      .setStyle(ButtonStyle.Secondary)
  );

  await channel.send({ embeds: [mainEmbed] });
  await channel.send({ 
    embeds: [dungeonEmbed], 
    components: [dungeonButtons] 
  });
}
