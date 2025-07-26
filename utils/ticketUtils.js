import { EmbedBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, AttachmentBuilder, MessageFlags } from 'discord.js';
import { STAFF_ROLES, TICKET_CATEGORIES, CARRIER_ROLES, LOGGING_CONFIG, CARRY_PRICES, formatCoins } from '../config.js';
import { recordCarryCompletion } from './carryTracker.js';
import { sendReviewRequest, handleReviewButtonInteraction, handleReviewModalSubmission } from './reviewSystem.js';
import { saveReview } from './simpleReviews.js';
import fs from 'fs';
import path from 'path';

// Helper function to check if user already has an open ticket
async function checkExistingTicket(guild, userId) {
  const channels = guild.channels.cache.filter(channel => 
    channel.name.startsWith('ticket-') && 
    channel.name.endsWith(`-${guild.members.cache.get(userId)?.user.username}`)
  );
  
  return channels.size > 0;
}

export async function setupTicketEmbed(channel, category) {
  console.log(`Setting up ticket embed for category: ${category}`);
  
  const categoryUpper = category.toUpperCase();
  
  // Validate category exists
  if (!TICKET_CATEGORIES[categoryUpper]) {
    throw new Error(`Invalid category: ${category}. Valid categories are: ${Object.keys(TICKET_CATEGORIES).join(', ')}`);
  }
  
  if (categoryUpper === 'SLAYER') {
    await setupSlayerTicketSystem(channel);
  } else if (categoryUpper === 'CRIMSON') {
    await setupCrimsonTicketSystem(channel);
  } else if (categoryUpper === 'DUNGEON') {
    await setupDungeonTicketSystem(channel);
  } else if (categoryUpper === 'MASTERMODE') {
    await setupMastermodeTicketSystem(channel);
  } else if (categoryUpper === 'SUPPORT') {
    await setupSupportTicketSystem(channel);
  } else {
    const embedColor = getEmbedColor(categoryUpper);

    const embed = new EmbedBuilder()
      .setTitle(`${TICKET_CATEGORIES[categoryUpper]} Tickets`)
      .setDescription('Click the button below to open a ticket.')
      .setColor(embedColor)
      .setFooter({ text: `Staff Role: ${STAFF_ROLES.STAFF}` });

    const button = new ButtonBuilder()
      .setCustomId(`open-ticket-${category.toLowerCase()}`)
      .setLabel('🎫 Open Ticket')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    console.log(`Sending embed and button to channel: ${channel.name}`);
    await channel.send({ embeds: [embed], components: [row] });
  }
}

async function setupSlayerTicketSystem(channel) {
  // Main slayer embed
  const mainEmbed = new EmbedBuilder()
    .setTitle('Request a Slayer Carry')
    .setDescription('Click to open a ticket and get carried!')
    .setColor('Purple')
    .setFooter({ text: 'SkyBlockC Ticket tool - Ticketing without clutter' });

  // Slayer details embed
  const slayerEmbed = new EmbedBuilder()
    .setTitle('SBC Slayer Carries')
    .setDescription(
      '<:Enderman:1395083334278709440> **T4 Eman Bruiser**\n' +
      '<:Enderman:1395083334278709440> **T4 Eman Sepulture**\n\n' +
      '<a:Blaze:1395083852195696650> **T2 Blaze**\n' +
      '<a:Blaze:1395083852195696650> **T3 Blaze**\n' +
      '<a:Blaze:1395083852195696650> **T4 Blaze**'
    )
    .setColor('Purple')
    .setFooter({ text: 'SkyBlockC Carry Services' });

  // Create all buttons in a single row (max 5 buttons per row)
  const allSlayerButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('slayer-t4-eman-bruiser')
      .setLabel('T4 Enderman Bruiser')
      .setEmoji('<:Enderman:1395083334278709440>')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('slayer-t4-eman-sepulture')
      .setLabel('T4 Enderman Sepulture')
      .setEmoji('<:Enderman:1395083334278709440>')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('slayer-t2-blaze')
      .setLabel('T2 Blaze')
      .setEmoji('<a:Blaze:1395083852195696650>')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('slayer-t3-blaze')
      .setLabel('T3 Blaze')
      .setEmoji('<a:Blaze:1395083852195696650>')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('slayer-t4-blaze')
      .setLabel('T4 Blaze')
      .setEmoji('<a:Blaze:1395083852195696650>')
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({ embeds: [mainEmbed] });
  await channel.send({ 
    embeds: [slayerEmbed], 
    components: [allSlayerButtons] 
  });
}

async function setupCrimsonTicketSystem(channel) {
  // Main crimson embed
  const mainEmbed = new EmbedBuilder()
    .setTitle('Request a Crimson Carry')
    .setDescription('Click to open a ticket and get carried!')
    .setColor('Red')
    .setFooter({ text: 'SkyBlockC Ticket tool - Ticketing without clutter' });

  // Crimson details embed
  const crimsonEmbed = new EmbedBuilder()
    .setTitle('SkyBlockC Crimson Isle Carries')
    .setDescription(
      '**Boss Carries:**\n' +
      '<a:Ashfang:1395290427740913685> **Ashfang**\n\n' +
      '**Kuudra Carries:**\n' +
      '<:basic:1395290441125072967> **Basic Kuudra**\n\n' +
      '<:hot:1395290436179988621> **Hot Kuudra**\n\n' +
      '<:burn:1395290430614274068> **Burning Kuudra**\n\n' +
      '<:fiery:1395290432988123187> **Fiery Kuudra**\n\n' +
      '<:infernal:1395290438658687088> **Infernal Kuudra**'
    )
    .setColor('Red')
    .setFooter({ text: 'SkyBlockC Carry Services' });

  // Create all crimson buttons (6 buttons - split into 3/3 layout for better visual balance)
  const firstRowButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('crimson-ashfang')
      .setLabel('Ashfang')
      .setEmoji('<a:Ashfang:1395290427740913685>')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('crimson-basic-kuudra')
      .setLabel('Basic Kuudra')
      .setEmoji('<:basic:1395290441125072967>')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('crimson-hot-kuudra')
      .setLabel('Hot Kuudra')
      .setEmoji('<:hot:1395290436179988621>')
      .setStyle(ButtonStyle.Danger)
  );

  const secondRowButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('crimson-burning-kuudra')
      .setLabel('Burning Kuudra')
      .setEmoji('<:burn:1395290430614274068>')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('crimson-fiery-kuudra')
      .setLabel('Fiery Kuudra')
      .setEmoji('<:fiery:1395290432988123187>')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('crimson-infernal-kuudra')
      .setLabel('Infernal Kuudra')
      .setEmoji('<:infernal:1395290438658687088>')
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({ embeds: [mainEmbed] });
  await channel.send({ 
    embeds: [crimsonEmbed], 
    components: [firstRowButtons, secondRowButtons] 
  });
}

async function setupDungeonTicketSystem(channel) {
  // Main dungeon embed
  const mainEmbed = new EmbedBuilder()
    .setTitle('Request a Dungeon Carry')
    .setDescription('Click to open a ticket and get carried!')
    .setColor('Blue')
    .setFooter({ text: 'SkyBlockC Ticket tool - Ticketing without clutter' });

  // Dungeon details embed
  const dungeonEmbed = new EmbedBuilder()
    .setTitle('SkyBlockC Dungeon Carries')
    .setDescription(
      '**Catacombs Floors:**\n' +
      '<a:Thorn:1395307380811759737> **Floor 4 - Thorn**\n' +
      '<:Livid:1395307384418865233> **Floor 5 - Livid**\n' +
      '<:Sadan:1395307387224588430> **Floor 6 - Sadan**\n' +
      '<:Necron:1395307389820866571> **Floor 7 - Necron**'
    )
    .setColor('Blue')
    .setFooter({ text: 'SkyBlockC Carry Services' });

  // Create dungeon floor buttons (4 buttons - F4, F5, F6, F7)
  const dungeonButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('dungeon-f4-thorn')
      .setLabel('F4 - Thorn')
      .setEmoji('<a:Thorn:1395307380811759737>')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('dungeon-f5-livid')
      .setLabel('F5 - Livid')
      .setEmoji('<:Livid:1395307384418865233>')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('dungeon-f6-sadan')
      .setLabel('F6 - Sadan')
      .setEmoji('<:Sadan:1395307387224588430>')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('dungeon-f7-necron')
      .setLabel('F7 - Necron')
      .setEmoji('<:Necron:1395307389820866571>')
      .setStyle(ButtonStyle.Secondary)
  );

  await channel.send({ embeds: [mainEmbed] });
  await channel.send({ 
    embeds: [dungeonEmbed], 
    components: [dungeonButtons] 
  });
}

async function setupMastermodeTicketSystem(channel) {
  try {
    console.log('=== STARTING MASTERMODE SETUP ===');
    
    // Main mastermode embed
    console.log('Creating main embed...');
    const mainEmbed = new EmbedBuilder()
      .setTitle('Request a Mastermode Carry')
      .setDescription('Click to open a ticket and get carried!')
      .setColor('Purple')
      .setFooter({ text: 'SkyBlockC Ticket tool - Ticketing without clutter' });

    console.log('Sending main embed...');
    await channel.send({ embeds: [mainEmbed] });
    console.log('Main embed sent successfully');

    // Mastermode details embed
    console.log('Creating mastermode embed...');
    const mastermodeEmbed = new EmbedBuilder()
      .setTitle('SkyBlockC Mastermode Carries')
      .setDescription(
        '<:Bonzo:1395336254417272944> **Master Mode 1**\n' +
        '<:Scarf:1395336330250027089> **Master Mode 2**\n' +
        '<:Professor:1374621269252640838> **Master Mode 3**\n' +
        '<a:Thorn:1395307380811759737> **Master Mode 4**\n' +
        '<:Livid:1395307384418865233> **Master Mode 5**\n' +
        '<:Sadan:1395307387224588430> **Master Mode 6**\n' +
        '<:Necron:1395307389820866571> **Master Mode 7**'
      )
      .setColor('Purple')
      .setFooter({ text: 'SkyBlockC Carry Services' });

    // Create mastermode buttons with custom emojis (7 buttons - split into 4/3 layout)
    console.log('Creating first button row...');
    const mastermodeButtons1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('mastermode-m1')
        .setLabel('M1 - Bonzo')
        .setEmoji('1395336254417272944')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('mastermode-m2')
        .setLabel('M2 - Scarf')
        .setEmoji('1395336330250027089')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('mastermode-m3')
        .setLabel('M3 - Professor')
        .setEmoji('1374621269252640838')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('mastermode-m4')
        .setLabel('M4 - Thorn')
        .setEmoji('1395307380811759737')
        .setStyle(ButtonStyle.Danger)
    );

    console.log('Creating second button row...');
    const mastermodeButtons2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('mastermode-m5')
        .setLabel('M5 - Livid')
        .setEmoji('1395307384418865233')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('mastermode-m6')
        .setLabel('M6 - Sadan')
        .setEmoji('1395307387224588430')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('mastermode-m7')
        .setLabel('M7 - Necron')
        .setEmoji('1395307389820866571')
        .setStyle(ButtonStyle.Danger)
    );

    console.log('Sending mastermode embed with buttons...');
    await channel.send({ 
      embeds: [mastermodeEmbed], 
      components: [mastermodeButtons1, mastermodeButtons2] 
    });
    
    console.log('=== MASTERMODE SETUP COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('=== MASTERMODE SETUP ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

async function setupSupportTicketSystem(channel) {
  // Main support embed
  const mainEmbed = new EmbedBuilder()
    .setTitle('Request Support')
    .setDescription('Need help with something? Click to open a support ticket!')
    .setColor('Yellow')
    .setFooter({ text: 'SkyBlockC Ticket tool - Ticketing without clutter' });

  // Support details embed
  const supportEmbed = new EmbedBuilder()
    .setTitle('SkyBlockC Support Ticket')
    .setDescription(
      '❓ General Questions\n' +
      '💰 Payment Issues\n' +
      '🛡 Report a User\n' +
      '📝 Feature Request\n' +
      '🐛 Bug Report'
    )
    .setColor('Yellow');

  // Create support buttons (5 buttons - split into 3/2 layout)
  const firstRowButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('support-questions')
      .setLabel('General Questions')
      .setEmoji('❓')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('support-payment')
      .setLabel('Payment Issues')
      .setEmoji('💰')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('support-report')
      .setLabel('Report a User')
      .setEmoji("🛡")
      .setStyle(ButtonStyle.Danger)
  );

  const secondRowButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('support-feature')
      .setLabel('Feature Request')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('support-bug')
      .setLabel('Bug Report')
      .setEmoji('🐛')
      .setStyle(ButtonStyle.Secondary)
  );

  await channel.send({ embeds: [mainEmbed] });
  await channel.send({ 
    embeds: [supportEmbed], 
    components: [firstRowButtons, secondRowButtons] 
  });
}

export async function createTicketChannels(guild) {
  console.log('Starting createTicketChannels function');
  const categories = Object.keys(TICKET_CATEGORIES);

  for (const category of categories) {
    console.log(`Processing category: ${category}`);
    const channelName = `${category.toLowerCase()}-tickets`;
    const embedColor = getEmbedColor(category);

    let channel = guild.channels.cache.find(ch => ch.name === channelName);
    if (!channel) {
      console.log(`Creating channel: ${channelName}`);
      channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
      });
    } else {
      console.log(`Channel already exists: ${channelName}`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`${TICKET_CATEGORIES[category]} Tickets`)
      .setDescription('Click the button below to open a ticket.')
      .setColor(embedColor)
      .setFooter({ text: `Staff Role: ${STAFF_ROLES.STAFF}` });

    const button = new ButtonBuilder()
      .setCustomId(`open-ticket-${category.toLowerCase()}`)
      .setLabel('🎫 Open Ticket')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    console.log(`Sending embed and button to channel: ${channelName}`);
    await channel.send({ embeds: [embed], components: [row] });
  }

  console.log('Finished createTicketChannels function');
}

function getEmbedColor(category) {
  switch (category) {
    case 'DUNGEON':
      return 'Blue';
    case 'SLAYER':
      return 'Purple';
    case 'CRIMSON':
      return 'Red';
    case 'MASTERMODE':
      return 'Purple';
    case 'SUPPORT':
      return 'Green';
    default:
      return 'Grey';
  }
}

export async function handleButtonInteraction(interaction) {
  const customId = interaction.customId;
  console.log('Button interaction received:', customId);
  
  if (customId.startsWith('open-ticket-')) {
    const category = customId.replace('open-ticket-', '').toUpperCase();
    
    // Only handle valid categories
    if (!['DUNGEON', 'SLAYER', 'CRIMSON', 'MASTERMODE', 'SUPPORT'].includes(category)) {
      await interaction.reply({ 
        content: 'This ticket type is no longer supported. Please contact an admin.', 
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    const modal = createTicketModal(category);
    await interaction.showModal(modal);
  } else if (customId.startsWith('slayer-')) {
    // Handle specific slayer type tickets
    const slayerType = customId.replace('slayer-', '');
    const modal = createSlayerModal(slayerType);
    await interaction.showModal(modal);
  } else if (customId.startsWith('crimson-')) {
    // Handle specific crimson type tickets
    const crimsonType = customId.replace('crimson-', '');
    const modal = createCrimsonModal(crimsonType);
    await interaction.showModal(modal);
  } else if (customId.startsWith('dungeon-')) {
    // Handle specific dungeon floor tickets
    const dungeonFloor = customId.replace('dungeon-', '');
    const modal = createDungeonModal(dungeonFloor);
    await interaction.showModal(modal);
  } else if (customId.startsWith('mastermode-')) {
    // Handle specific mastermode floor tickets
    const mastermodeFloor = customId.replace('mastermode-', '');
    const modal = createMastermodeModal(mastermodeFloor);
    await interaction.showModal(modal);
  } else if (customId.startsWith('support-')) {
    // Handle specific support type tickets
    const supportType = customId.replace('support-', '');
    const modal = createSupportModal(supportType);
    await interaction.showModal(modal);
  } else if (customId.startsWith('review-good-') || customId.startsWith('review-bad-')) {
    // Handle review button interactions (old complex system)
    await handleReviewButtonInteraction(interaction);
  } else if (customId.startsWith('simple-review-')) {
    // Handle simple review button interactions
    await handleSimpleReviewInteraction(interaction);
  } else  if (customId === 'claim-ticket' || customId.startsWith('claim-ticket-')) {
    await handleTicketClaim(interaction);
  } else if (customId === 'unclaim-ticket') {
    await handleTicketUnclaim(interaction);
  } else if (customId === 'force-unclaim-ticket') {
    await handleForceTicketUnclaim(interaction);
  } else if (customId === 'close-ticket') {
    await handleTicketClose(interaction);
  } else if (customId.startsWith('reopen-ticket-')) {
    await handleTicketReopen(interaction);
  } else if (customId.startsWith('increment-carry-') || customId.startsWith('decrement-carry-')) {
    await handleCarryTrackerUpdate(interaction);
  }
}

function createSlayerModal(slayerType) {
  const slayerTypeFormatted = slayerType.replace(/-/g, ' ').toUpperCase();
  
  const modal = new ModalBuilder()
    .setCustomId(`slayer-modal-${slayerType}`)
    .setTitle(`${slayerTypeFormatted} Ticket`);

  let questions = [];
  
  // Different questions based on slayer type
  if (slayerType.includes('eman') || slayerType.includes('voidgloom')) {
    // T4/T5 Voidgloom Enderman - 3 questions
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'damage', label: 'How Much Dmg Do You Do Per Hit? (No SE Dmg)', placeholder: '100k per hit, 200k per hit, etc', required: true }
    ];
  } else if (slayerType.includes('blaze') || slayerType.includes('inferno')) {
    // Blaze/Inferno - 2 questions
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true }
    ];
  } else {
    // Default for T3/T5 Revenant or other types - 3 questions
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'damage', label: 'How Much Dmg Do You Do Per Hit? (No SE Dmg)', placeholder: '100k per hit, 200k per hit, etc', required: true }
    ];
  }

  const components = questions.map(question => {
    const textInput = new TextInputBuilder()
      .setCustomId(question.id)
      .setLabel(question.label)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(question.placeholder)
      .setRequired(question.required);
    
    return new ActionRowBuilder().addComponents(textInput);
  });

  modal.addComponents(...components);
  return modal;
}

function createCrimsonModal(crimsonType) {
  const crimsonTypeFormatted = crimsonType.replace(/-/g, ' ').toUpperCase();
  
  const modal = new ModalBuilder()
    .setCustomId(`crimson-modal-${crimsonType}`)
    .setTitle(`${crimsonTypeFormatted} Ticket`);

  let questions = [];
  
  // Different questions based on crimson type
  if (crimsonType.includes('ashfang')) {
    // Ashfang - 2 questions
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true }
    ];
  } else if (crimsonType.includes('fiery-kuudra')) {
    // Fiery Kuudra - 3 questions with 7k rep requirement
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'requirements', label: 'Do You Have 7k Faction Rep And Burning Comp?', placeholder: 'Yes or No', required: true }
    ];
  } else if (crimsonType.includes('infernal-kuudra')) {
    // Infernal Kuudra - 3 questions with 12k rep requirement
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'requirements', label: 'Do You Have 12k Faction Rep And Fiery Comp?', placeholder: 'Yes or No', required: true }
    ];
  } else if (crimsonType.includes('burning-kuudra')) {
    // Burning Kuudra - 3 questions with 5k rep requirement
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'requirements', label: 'Do You Have 5k Faction Rep And Hot Comp?', placeholder: 'Yes or No', required: true }
    ];
  } else if (crimsonType.includes('hot-kuudra')) {
    // Hot Kuudra - 3 questions with 3k rep requirement
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'requirements', label: 'Do You Have 3k Faction Rep And Basic Comp?', placeholder: 'Yes or No', required: true }
    ];
  } else if (crimsonType.includes('basic-kuudra')) {
    // Basic Kuudra - 3 questions with 1k rep requirement (entry level)
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'battle_monster', label: 'Do You See "Battle The Monster" On The Side?', placeholder: 'Yes or No', required: true }
    ];
  } else if (crimsonType.includes('kuudra')) {
    // Other Kuudra types - fallback
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'combat', label: 'What Is Your Combat Level?', placeholder: 'Enter your combat level', required: true }
    ];
  } else {
    // Default - 2 questions
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true }
    ];
  }

  const components = questions.map(question => {
    const textInput = new TextInputBuilder()
      .setCustomId(question.id)
      .setLabel(question.label)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(question.placeholder)
      .setRequired(question.required);
    
    return new ActionRowBuilder().addComponents(textInput);
  });

  modal.addComponents(...components);
  return modal;
}

function createDungeonModal(dungeonFloor) {
  const floorFormatted = dungeonFloor.replace(/-/g, ' ').toUpperCase();
  
  const modal = new ModalBuilder()
    .setCustomId(`dungeon-modal-${dungeonFloor}`)
    .setTitle(`${floorFormatted} Ticket`);

  let questions = [];
  
  // Different questions based on dungeon floor
  if (dungeonFloor === 'f4' || dungeonFloor === 'f4-thorn') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (9+ required)', required: true }
    ];
  } else if (dungeonFloor === 'f5' || dungeonFloor === 'f5-livid') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (14+ required)', required: true }
    ];
  } else if (dungeonFloor === 'f6' || dungeonFloor === 'f6-sadan') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (19+ required)', required: true }
    ];
  } else if (dungeonFloor === 'f7' || dungeonFloor === 'f7-necron') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (24+ required)', required: true }
    ];
  } else {
    // Default dungeon questions
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level', required: true }
    ];
  }

  const components = questions.map(question => {
    const textInput = new TextInputBuilder()
      .setCustomId(question.id)
      .setLabel(question.label)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(question.placeholder)
      .setRequired(question.required);
    
    return new ActionRowBuilder().addComponents(textInput);
  });

  modal.addComponents(...components);
  return modal;
}

function createMastermodeModal(mastermodeFloor) {
  const floorFormatted = mastermodeFloor.replace(/-/g, ' ').toUpperCase();
  
  const modal = new ModalBuilder()
    .setCustomId(`mastermode-modal-${mastermodeFloor}`)
    .setTitle(`${floorFormatted} Ticket`);

  let questions = [];
  
  // Different questions based on mastermode floor
  if (mastermodeFloor === 'm1') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (19+ required)', required: true }
    ];
  } else if (mastermodeFloor === 'm2') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (21+ required)', required: true }
    ];
  } else if (mastermodeFloor === 'm3') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (24+ required)', required: true }
    ];
  } else if (mastermodeFloor === 'm4') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (27+ required)', required: true }
    ];
  } else if (mastermodeFloor === 'm5') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (30+ required)', required: true }
    ];
  } else if (mastermodeFloor === 'm6') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (33+ required)', required: true }
    ];
  } else if (mastermodeFloor === 'm7') {
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level (36+ required)', required: true },
      { id: 'completion', label: 'Do You Have M7 Completion?', placeholder: 'Yes or No', required: true }
    ];
  } else {
    // Default mastermode questions
    questions = [
      { id: 'ign', label: 'What Is Your Minecraft Username?', placeholder: 'Exm: Duop', required: true },
      { id: 'carries', label: 'How Many Carries Do You Need?', placeholder: 'Enter number of carries', required: true },
      { id: 'cata_level', label: 'What Is Your Catacombs Level?', placeholder: 'Enter your cata level', required: true }
    ];
  }

  const components = questions.map(question => {
    const textInput = new TextInputBuilder()
      .setCustomId(question.id)
      .setLabel(question.label)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(question.placeholder)
      .setRequired(question.required);
    
    return new ActionRowBuilder().addComponents(textInput);
  });

  modal.addComponents(...components);
  return modal;
}

function createSupportModal(supportType) {
  const supportTypeFormatted = supportType.replace(/-/g, ' ').toUpperCase();
  
  const modal = new ModalBuilder()
    .setCustomId(`support-modal-${supportType}`)
    .setTitle(`${supportTypeFormatted} Support`);

  let questions = [];
  
  // Different questions based on support type
  if (supportType === 'questions') {
    questions = [
      { id: 'question', label: 'What is your question?', placeholder: 'Ask your question here', required: true },
      { id: 'context', label: 'Additional Context', placeholder: 'Any relevant background information', required: false }
    ];
  } else if (supportType === 'payment') {
    questions = [
      { id: 'issue', label: 'What payment issue are you experiencing?', placeholder: 'Describe the payment problem', required: true },
      { id: 'transaction', label: 'Transaction ID/Details', placeholder: 'If applicable, provide transaction ID', required: false },
      { id: 'amount', label: 'Amount Involved', placeholder: 'How much was the payment?', required: false }
    ];
  } else if (supportType === 'report') {
    questions = [
      { id: 'user', label: 'Who are you reporting?', placeholder: 'Username or Discord ID', required: true },
      { id: 'reason', label: 'Reason for report', placeholder: 'What did they do wrong?', required: true },
      { id: 'evidence', label: 'Evidence/Details', placeholder: 'Screenshots, chat logs, etc.', required: true }
    ];
  } else if (supportType === 'feature') {
    questions = [
      { id: 'feature', label: 'What feature would you like to see?', placeholder: 'Describe your feature request', required: true },
      { id: 'why', label: 'Why would this be helpful?', placeholder: 'Explain the benefits', required: true },
      { id: 'details', label: 'Additional Details', placeholder: 'Any implementation ideas or examples', required: false }
    ];
  } else if (supportType === 'bug') {
    questions = [
      { id: 'bug', label: 'What bug did you encounter?', placeholder: 'Describe the bug', required: true },
      { id: 'steps', label: 'Steps to reproduce', placeholder: 'How can we reproduce this bug?', required: true },
      { id: 'expected', label: 'Expected behavior', placeholder: 'What should have happened?', required: false }
    ];
  } else {
    // Default support questions
    questions = [
      { id: 'issue', label: 'How can we help you?', placeholder: 'Describe your issue or question', required: true },
      { id: 'details', label: 'Additional Details', placeholder: 'Any extra information', required: false }
    ];
  }

  const components = questions.map(question => {
    const textInput = new TextInputBuilder()
      .setCustomId(question.id)
      .setLabel(question.label)
      .setStyle(question.id === 'details' || question.id === 'steps' || question.id === 'evidence' ? TextInputStyle.Paragraph : TextInputStyle.Short)
      .setPlaceholder(question.placeholder)
      .setRequired(question.required);
    
    return new ActionRowBuilder().addComponents(textInput);
  });

  modal.addComponents(...components);
  return modal;
}

function createTicketModal(category) {
  const modal = new ModalBuilder()
    .setCustomId(`ticket-modal-${category.toLowerCase()}`)
    .setTitle(`Open ${TICKET_CATEGORIES[category]} Ticket`);

  let questions = [];
  
  switch (category) {
    case 'DUNGEON':
      questions = [
        { id: 'ign', label: 'IGN (In-Game Name)', placeholder: 'Enter your Minecraft username' },
        { id: 'level', label: 'Catacombs Level', placeholder: 'Enter your Catacombs level' },
        { id: 'carries', label: 'Number of Carries Needed', placeholder: 'How many carries do you need?' }
      ];
      break;
    case 'CRIMSON':
      questions = [
        { id: 'ign', label: 'IGN (In-Game Name)', placeholder: 'Enter your Minecraft username' },
        { id: 'level', label: 'Combat Level', placeholder: 'Enter your Combat level' },
        { id: 'bosses', label: 'Number of Bosses', placeholder: 'How many bosses do you need?' }
      ];
      break;
    default:
      // Invalid category
      questions = [
        { id: 'error', label: 'Error', placeholder: 'Invalid ticket type' }
      ];
      break;
  }

  const components = questions.map(question => {
    const textInput = new TextInputBuilder()
      .setCustomId(question.id)
      .setLabel(question.label)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(question.placeholder)
      .setRequired(true);
    
    return new ActionRowBuilder().addComponents(textInput);
  });

  modal.addComponents(...components);
  return modal;
}

export async function handleModalSubmit(interaction) {
  const customId = interaction.customId;
  
  if (customId.startsWith('ticket-modal-')) {
    const category = customId.replace('ticket-modal-', '').toUpperCase();
    await createTicketChannel(interaction, category);
  } else if (customId.startsWith('slayer-modal-')) {
    const slayerType = customId.replace('slayer-modal-', '');
    await createSlayerTicketChannel(interaction, slayerType);
  } else if (customId.startsWith('crimson-modal-')) {
    const crimsonType = customId.replace('crimson-modal-', '');
    await createCrimsonTicketChannel(interaction, crimsonType);
  } else if (customId.startsWith('dungeon-modal-')) {
    const dungeonFloor = customId.replace('dungeon-modal-', '');
    await createDungeonTicketChannel(interaction, dungeonFloor);
  } else if (customId.startsWith('mastermode-modal-')) {
    const mastermodeFloor = customId.replace('mastermode-modal-', '');
    await createMastermodeTicketChannel(interaction, mastermodeFloor);
  } else if (customId.startsWith('support-modal-')) {
    const supportType = customId.replace('support-modal-', '');
    await createSupportTicketChannel(interaction, supportType);
  } else if (customId.startsWith('review-modal-')) {
    // Handle review modal submissions
    await handleReviewModalSubmission(interaction);
  }
}

async function createSlayerTicketChannel(interaction, slayerType) {
  try {
    // Defer immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Check if user already has an open ticket
    const hasExistingTicket = await checkExistingTicket(guild, user.id);
    if (hasExistingTicket) {
      await interaction.editReply({
        content: '❌ You already have an open ticket! Please close your existing ticket before creating a new one.'
      });
      return;
    }
    
    // Create ticket channel
    const slayerTypeFormatted = slayerType.replace(/-/g, '-');
    const channelName = `ticket-${slayerTypeFormatted}-${user.username}`;
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['ViewChannel'],
        },
        {
          id: user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: interaction.client.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        }
      ],
    });

    // Collect form answers
    const answers = {};
    interaction.fields.fields.forEach((field, key) => {
      answers[key] = field.value;
    });

    // Determine which role to ping based on slayer type
    let roleToPing = null;
    if (slayerType.includes('eman') || slayerType.includes('voidgloom')) {
      if (slayerType.includes('bruiser')) {
        roleToPing = CARRIER_ROLES.T4_EMAN_BRUISER;
      } else if (slayerType.includes('sepulture')) {
        roleToPing = CARRIER_ROLES.T4_EMAN_SEPULTURE;
      }
    } else if (slayerType.includes('blaze') || slayerType.includes('inferno')) {
      if (slayerType.includes('t2')) {
        roleToPing = CARRIER_ROLES.T2_BLAZE;
      } else if (slayerType.includes('t3')) {
        roleToPing = CARRIER_ROLES.T3_BLAZE;
      } else if (slayerType.includes('t4')) {
        roleToPing = CARRIER_ROLES.T4_BLAZE;
      }
    }

    const pingRole = roleToPing || STAFF_ROLES.STAFF;

    // Create summary embed with carrier ping
    const slayerTypeDisplay = slayerType.replace(/-/g, ' ').toUpperCase();
    const embed = new EmbedBuilder()
      .setTitle(`${slayerTypeDisplay} Ticket`)
      .setDescription(`Ticket opened by ${user}`)
      .setColor('Purple')
      .setTimestamp();

    // Add answers to embed
    Object.entries(answers).forEach(([key, value]) => {
      if (value) { // Only add non-empty values
        embed.addFields({ name: key.toUpperCase(), value: value, inline: true });
      }
    });

    // Create action buttons - extract carries from answers for initial progress
    let initialCarries = 1;
    if (answers.carries) {
      const carriesMatch = answers.carries.match(/(\d+)/);
      if (carriesMatch) {
        initialCarries = parseInt(carriesMatch[1]);
      }
    }
    
    const claimButton = new ButtonBuilder()
      .setCustomId(`claim-ticket-${initialCarries}-0`)
      .setLabel('🔖 Claim')
      .setStyle(ButtonStyle.Secondary);

    const closeButton = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Close')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

    // Send the ping separately so it actually pings, then the embed
    await channel.send({ 
      content: `<@&${pingRole}>`,
      embeds: [embed], 
      components: [row] 
    });
    
    await interaction.editReply({
      content: `Slayer ticket created successfully! ${channel}`
    });
    
  } catch (error) {
    console.error('Error creating slayer ticket channel:', error);
    await interaction.editReply({
      content: 'An error occurred while creating your slayer ticket.'
    });
  }
}

async function createCrimsonTicketChannel(interaction, crimsonType) {
  try {
    // Defer immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Check if user already has an open ticket
    const hasExistingTicket = await checkExistingTicket(guild, user.id);
    if (hasExistingTicket) {
      await interaction.editReply({
        content: '❌ You already have an open ticket! Please close your existing ticket before creating a new one.'
      });
      return;
    }
    
    // Create ticket channel
    const crimsonTypeFormatted = crimsonType.replace(/-/g, '-');
    const channelName = `ticket-${crimsonTypeFormatted}-${user.username}`;
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['ViewChannel'],
        },
        {
          id: user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: interaction.client.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        }
      ],
    });

    // Collect form answers
    const answers = {};
    interaction.fields.fields.forEach((field, key) => {
      answers[key] = field.value;
    });

    // Determine which role to ping based on crimson type
    let roleToPing = null;
    if (crimsonType.includes('ashfang')) {
      roleToPing = CARRIER_ROLES.ASHFANG;
    } else if (crimsonType.includes('basic-kuudra')) {
      roleToPing = CARRIER_ROLES.BASIC_KUUDRA;
    } else if (crimsonType.includes('hot-kuudra')) {
      roleToPing = CARRIER_ROLES.HOT_KUUDRA;
    } else if (crimsonType.includes('burning-kuudra')) {
      roleToPing = CARRIER_ROLES.BURNING_KUUDRA;
    } else if (crimsonType.includes('fiery-kuudra')) {
      roleToPing = CARRIER_ROLES.FIERY_KUUDRA;
    } else if (crimsonType.includes('infernal-kuudra')) {
      roleToPing = CARRIER_ROLES.INFERNAL_KUUDRA;
    }
    
    const pingRole = roleToPing || STAFF_ROLES.STAFF;

    // Create summary embed with carrier ping
    const crimsonTypeDisplay = crimsonType.replace(/-/g, ' ').toUpperCase();
    const embed = new EmbedBuilder()
      .setTitle(`${crimsonTypeDisplay} Ticket`)
      .setDescription(`Ticket opened by ${user}`)
      .setColor('Red')
      .setTimestamp();

    // Add answers to embed
    Object.entries(answers).forEach(([key, value]) => {
      if (value) { // Only add non-empty values
        embed.addFields({ name: key.toUpperCase(), value: value, inline: true });
      }
    });

    // Create action buttons - extract carries from answers for initial progress
    let initialCarries = 1;
    if (answers.carries) {
      const carriesMatch = answers.carries.match(/(\d+)/);
      if (carriesMatch) {
        initialCarries = parseInt(carriesMatch[1]);
      }
    }
    
    const claimButton = new ButtonBuilder()
      .setCustomId(`claim-ticket-${initialCarries}-0`)
      .setLabel('🔖 Claim')
      .setStyle(ButtonStyle.Secondary);

    const closeButton = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Close')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

    // Send the ping separately so it actually pings, then the embed
    await channel.send({ 
      content: `<@&${pingRole}>`,
      embeds: [embed], 
      components: [row] 
    });
    
    await interaction.editReply({
      content: `Crimson ticket created successfully! ${channel}`
    });
    
  } catch (error) {
    console.error('Error creating crimson ticket channel:', error);
    await interaction.editReply({
      content: 'An error occurred while creating your crimson ticket.'
    });
  }
}

async function createDungeonTicketChannel(interaction, dungeonFloor) {
  try {
    // Defer immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Check if user already has an open ticket
    const hasExistingTicket = await checkExistingTicket(guild, user.id);
    if (hasExistingTicket) {
      await interaction.editReply({
        content: '❌ You already have an open ticket! Please close your existing ticket before creating a new one.'
      });
      return;
    }
    
    // Create ticket channel
    const dungeonFloorFormatted = dungeonFloor.replace(/-/g, '-');
    const channelName = `ticket-${dungeonFloorFormatted}-${user.username}`;
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['ViewChannel'],
        },
        {
          id: user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: interaction.client.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        }
      ],
    });

    // Collect form answers
    const answers = {};
    interaction.fields.fields.forEach((field, key) => {
      answers[key] = field.value;
    });

    // Determine which role to ping based on dungeon floor
    let roleToPing = null;
    // Extract floor number from dungeonFloor (handles both 'f4' and 'f4-thorn' formats)
    const floorNumber = dungeonFloor.split('-')[0];
    
    if (floorNumber === 'f4') {
      roleToPing = CARRIER_ROLES.F4_THORN_CARRIER;
    } else if (floorNumber === 'f5') {
      roleToPing = CARRIER_ROLES.F5_LIVID_CARRIER;
    } else if (floorNumber === 'f6') {
      roleToPing = CARRIER_ROLES.F6_SADAN_CARRIER;
    } else if (floorNumber === 'f7') {
      roleToPing = CARRIER_ROLES.F7_NECRON_CARRIER;
    }
    
    const pingRole = roleToPing || STAFF_ROLES.STAFF;

    // Create summary embed with carrier ping
    const dungeonFloorDisplay = dungeonFloor.replace(/-/g, ' ').toUpperCase();
    const embed = new EmbedBuilder()
      .setTitle(`${dungeonFloorDisplay} Dungeon Ticket`)
      .setDescription(`Ticket opened by ${user}`)
      .setColor('Purple')
      .setTimestamp();

    // Add answers to embed
    Object.entries(answers).forEach(([key, value]) => {
      if (value) { // Only add non-empty values
        embed.addFields({ name: key.toUpperCase(), value: value, inline: true });
      }
    });

    // Create action buttons - extract carries from answers for initial progress
    let initialCarries = 1;
    if (answers.carries) {
      const carriesMatch = answers.carries.match(/(\d+)/);
      if (carriesMatch) {
        initialCarries = parseInt(carriesMatch[1]);
      }
    }
    
    const claimButton = new ButtonBuilder()
      .setCustomId(`claim-ticket-${initialCarries}-0`)
      .setLabel('🔖 Claim')
      .setStyle(ButtonStyle.Secondary);

    const closeButton = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Close')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

    // Send the ping separately so it actually pings, then the embed
    await channel.send({ 
      content: `<@&${pingRole}>`,
      embeds: [embed], 
      components: [row] 
    });
    
    await interaction.editReply({
      content: `Dungeon ticket created successfully! ${channel}`
    });
    
  } catch (error) {
    console.error('Error creating dungeon ticket channel:', error);
    await interaction.editReply({
      content: 'An error occurred while creating your dungeon ticket.'
    });
  }
}

async function createMastermodeTicketChannel(interaction, mastermodeFloor) {
  try {
    // Defer immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Check if user already has an open ticket
    const hasExistingTicket = await checkExistingTicket(guild, user.id);
    if (hasExistingTicket) {
      await interaction.editReply({
        content: '❌ You already have an open ticket! Please close your existing ticket before creating a new one.'
      });
      return;
    }
    
    // Create ticket channel
    const mastermodeFloorFormatted = mastermodeFloor.replace(/-/g, '-');
    const channelName = `ticket-${mastermodeFloorFormatted}-${user.username}`;
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['ViewChannel'],
        },
        {
          id: user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: interaction.client.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        }
      ],
    });

    // Collect form answers
    const answers = {};
    interaction.fields.fields.forEach((field, key) => {
      answers[key] = field.value;
    });

    // Determine which role to ping based on mastermode floor
    let roleToPing = null;
    // Extract floor number from mastermodeFloor 
    const floorNumber = mastermodeFloor;
    
    if (floorNumber === 'm1') {
      roleToPing = CARRIER_ROLES.M1_CARRIER;
    } else if (floorNumber === 'm2') {
      roleToPing = CARRIER_ROLES.M2_CARRIER;
    } else if (floorNumber === 'm3') {
      roleToPing = CARRIER_ROLES.M3_CARRIER;
    } else if (floorNumber === 'm4') {
      roleToPing = CARRIER_ROLES.M4_THORN_CARRIER;
    } else if (floorNumber === 'm5') {
      roleToPing = CARRIER_ROLES.M5_LIVID_CARRIER;
    } else if (floorNumber === 'm6') {
      roleToPing = CARRIER_ROLES.M6_SADAN_CARRIER;
    } else if (floorNumber === 'm7') {
      roleToPing = CARRIER_ROLES.M7_NECRON_CARRIER;
    }
    
    const pingRole = roleToPing || STAFF_ROLES.STAFF;

    // Create summary embed with carrier ping
    const mastermodeFloorDisplay = mastermodeFloor.replace(/-/g, ' ').toUpperCase();
    const embed = new EmbedBuilder()
      .setTitle(`${mastermodeFloorDisplay} Mastermode Ticket`)
      .setDescription(`Ticket opened by ${user}`)
      .setColor('Purple')
      .setTimestamp();

    // Add answers to embed
    Object.entries(answers).forEach(([key, value]) => {
      if (value) { // Only add non-empty values
        embed.addFields({ name: key.toUpperCase(), value: value, inline: true });
      }
    });

    // Create action buttons - extract carries from answers for initial progress
    let initialCarries = 1;
    if (answers.carries) {
      const carriesMatch = answers.carries.match(/(\d+)/);
      if (carriesMatch) {
        initialCarries = parseInt(carriesMatch[1]);
      }
    }
    
    const claimButton = new ButtonBuilder()
      .setCustomId(`claim-ticket-${initialCarries}-0`)
      .setLabel('🔖 Claim')
      .setStyle(ButtonStyle.Secondary);

    const closeButton = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Close')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

    // Send the ping separately so it actually pings, then the embed
    await channel.send({ 
      content: `<@&${pingRole}>`,
      embeds: [embed], 
      components: [row] 
    });
    
    await interaction.editReply({
      content: `Mastermode ticket created successfully! ${channel}`
    });
    
  } catch (error) {
    console.error('Error creating mastermode ticket channel:', error);
    await interaction.editReply({
      content: 'An error occurred while creating your mastermode ticket.'
    });
  }
}

async function createSupportTicketChannel(interaction, supportType) {
  try {
    // Defer immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const member = interaction.member;
    
    // Find the SUPPORT category
    const supportCategory = guild.channels.cache.find(c => 
      c.type === 4 && c.name.toLowerCase() === config.TICKET_CATEGORIES.SUPPORT.toLowerCase()
    );
    
    if (!supportCategory) {
      await interaction.editReply({
        content: 'Support category not found! Please contact an administrator.'
      });
      return;
    }

    // Create the channel
    const ticketNumber = Math.floor(Math.random() * 10000);
    const supportTypeFormatted = supportType.charAt(0).toUpperCase() + supportType.slice(1);
    
    const channel = await guild.channels.create({
      name: `support-${supportType}-${member.user.username}-${ticketNumber}`,
      type: 0, // Text channel
      parent: supportCategory.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ['ViewChannel']
        },
        {
          id: member.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
        },
        {
          id: config.ROLES.HELPER,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages']
        },
        {
          id: config.ROLES.STAFF,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages']
        },
        {
          id: config.ROLES.OWNER,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages']
        }
      ]
    });

    // Get form fields from modal
    const fields = [];
    
    // Process support type specific questions
    switch (supportType) {
      case 'technical':
        fields.push(
          { name: 'Issue Description', value: interaction.fields.getTextInputValue('issue_description') || 'Not provided', inline: false },
          { name: 'Steps to Reproduce', value: interaction.fields.getTextInputValue('steps_reproduce') || 'Not provided', inline: false },
          { name: 'Error Message', value: interaction.fields.getTextInputValue('error_message') || 'Not provided', inline: false },
          { name: 'Discord Username', value: interaction.fields.getTextInputValue('discord_username') || 'Not provided', inline: true },
          { name: 'Minecraft Username', value: interaction.fields.getTextInputValue('minecraft_username') || 'Not provided', inline: true }
        );
        break;
      case 'questions':
        fields.push(
          { name: 'Question', value: interaction.fields.getTextInputValue('question') || 'Not provided', inline: false },
          { name: 'Context', value: interaction.fields.getTextInputValue('context') || 'Not provided', inline: false },
          { name: 'Urgency Level', value: interaction.fields.getTextInputValue('urgency') || 'Not provided', inline: true },
          { name: 'Discord Username', value: interaction.fields.getTextInputValue('discord_username') || 'Not provided', inline: true },
          { name: 'Additional Information', value: interaction.fields.getTextInputValue('additional_info') || 'Not provided', inline: false }
        );
        break;
      case 'payment':
        fields.push(
          { name: 'Payment Issue', value: interaction.fields.getTextInputValue('payment_issue') || 'Not provided', inline: false },
          { name: 'Transaction ID', value: interaction.fields.getTextInputValue('transaction_id') || 'Not provided', inline: false },
          { name: 'Payment Method', value: interaction.fields.getTextInputValue('payment_method') || 'Not provided', inline: true },
          { name: 'Discord Username', value: interaction.fields.getTextInputValue('discord_username') || 'Not provided', inline: true },
          { name: 'Order Details', value: interaction.fields.getTextInputValue('order_details') || 'Not provided', inline: false }
        );
        break;
      case 'report':
        fields.push(
          { name: 'Report Type', value: interaction.fields.getTextInputValue('report_type') || 'Not provided', inline: false },
          { name: 'User/Issue Being Reported', value: interaction.fields.getTextInputValue('reported_user') || 'Not provided', inline: false },
          { name: 'Evidence/Screenshots', value: interaction.fields.getTextInputValue('evidence') || 'Not provided', inline: false },
          { name: 'Discord Username', value: interaction.fields.getTextInputValue('discord_username') || 'Not provided', inline: true },
          { name: 'Additional Details', value: interaction.fields.getTextInputValue('additional_details') || 'Not provided', inline: false }
        );
        break;
      case 'feature':
        fields.push(
          { name: 'Feature Request', value: interaction.fields.getTextInputValue('feature_request') || 'Not provided', inline: false },
          { name: 'Use Case', value: interaction.fields.getTextInputValue('use_case') || 'Not provided', inline: false },
          { name: 'Priority Level', value: interaction.fields.getTextInputValue('priority') || 'Not provided', inline: true },
          { name: 'Discord Username', value: interaction.fields.getTextInputValue('discord_username') || 'Not provided', inline: true },
          { name: 'Additional Context', value: interaction.fields.getTextInputValue('additional_context') || 'Not provided', inline: false }
        );
        break;
      case 'bug':
        fields.push(
          { name: 'Bug Description', value: interaction.fields.getTextInputValue('bug_description') || 'Not provided', inline: false },
          { name: 'Steps to Reproduce', value: interaction.fields.getTextInputValue('steps_reproduce') || 'Not provided', inline: false },
          { name: 'Expected vs Actual', value: interaction.fields.getTextInputValue('expected_actual') || 'Not provided', inline: false },
          { name: 'Discord Username', value: interaction.fields.getTextInputValue('discord_username') || 'Not provided', inline: true },
          { name: 'Additional Information', value: interaction.fields.getTextInputValue('additional_info') || 'Not provided', inline: false }
        );
        break;
      default:
        fields.push(
          { name: 'Support Request', value: interaction.fields.getTextInputValue('support_request') || 'Not provided', inline: false },
          { name: 'Discord Username', value: interaction.fields.getTextInputValue('discord_username') || 'Not provided', inline: true }
        );
    }

    // Create the embed
    const embed = new EmbedBuilder()
      .setTitle(`${supportTypeFormatted} Support Request`)
      .setDescription(`Support ticket for ${member.user.username}`)
      .addFields(fields)
      .setColor(getEmbedColor('SUPPORT'))
      .setTimestamp()
      .setFooter({ text: `Ticket #${ticketNumber}` });

    // Create close button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('close-ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

    // Ping helpers and staff
    const helperRole = guild.roles.cache.get(config.ROLES.HELPER);
    const staffRole = guild.roles.cache.get(config.ROLES.STAFF);
    
    let pingMessage = `New ${supportTypeFormatted} support ticket created by ${member.user}!`;
    if (helperRole) pingMessage += ` ${helperRole}`;
    if (staffRole) pingMessage += ` ${staffRole}`;

    // Send the embed with ping inside
    await channel.send({ 
      content: pingMessage,
      embeds: [embed], 
      components: [row] 
    });
    
    await interaction.editReply({
      content: `Support ticket created successfully! ${channel}`
    });
    
  } catch (error) {
    console.error('Error creating support ticket channel:', error);
    await interaction.editReply({
      content: 'An error occurred while creating your support ticket.'
    });
  }
}

async function createTicketChannel(interaction, category) {
  await interaction.deferReply({ ephemeral: true });
  
  try {
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Check if user already has an open ticket
    const hasExistingTicket = await checkExistingTicket(guild, user.id);
    if (hasExistingTicket) {
      await interaction.editReply({
        content: '❌ You already have an open ticket! Please close your existing ticket before creating a new one.'
      });
      return;
    }
    
    // Create ticket channel
    const channelName = `ticket-${category.toLowerCase()}-${user.username}`;
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['ViewChannel'],
        },
        {
          id: user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: interaction.client.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        }
      ],
    });

    // Collect form answers
    const answers = {};
    interaction.fields.fields.forEach((field, key) => {
      answers[key] = field.value;
    });

    // Create summary embed
    const embed = new EmbedBuilder()
      .setTitle(`${TICKET_CATEGORIES[category]} Ticket`)
      .setDescription(`Ticket opened by ${user}`)
      .setColor(getEmbedColor(category))
      .setTimestamp();

    // Add answers to embed
    Object.entries(answers).forEach(([key, value]) => {
      embed.addFields({ name: key.toUpperCase(), value: value, inline: true });
    });

    // Create action buttons - extract carries from answers for initial progress
    let initialCarries = 1;
    if (answers.carries) {
      const carriesMatch = answers.carries.match(/(\d+)/);
      if (carriesMatch) {
        initialCarries = parseInt(carriesMatch[1]);
      }
    } else if (answers.bosses) {
      const bossesMatch = answers.bosses.match(/(\d+)/);
      if (bossesMatch) {
        initialCarries = parseInt(bossesMatch[1]);
      }
    }
    
    const claimButton = new ButtonBuilder()
      .setCustomId(`claim-ticket-${initialCarries}-0`)
      .setLabel('🔖 Claim')
      .setStyle(ButtonStyle.Secondary);

    const closeButton = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Close')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

    await channel.send({ embeds: [embed], components: [row] });
    
    await interaction.followUp({
      content: `Ticket created successfully! ${channel}`,
      ephemeral: true
    });
    
  } catch (error) {
    console.error('Error creating ticket channel:', error);
    await interaction.followUp({
      content: 'An error occurred while creating your ticket.',
      ephemeral: true
    });
  }
}

export async function reopenTicket(ticketId, interaction) {
  // Placeholder implementation for reopening tickets
  await interaction.followUp({ content: `Ticket ${ticketId} reopened successfully.` });
}

export async function getTicketStats() {
  // Placeholder implementation for ticket stats
  return 'Ticket stats are not yet implemented.';
}

async function handleCarryTrackerUpdate(interaction) {
  try {
    await interaction.deferUpdate();
    
    const customId = interaction.customId;
    const isIncrement = customId.startsWith('increment-carry-');
    
    // Parse the custom ID: increment/decrement-carry-{needed}-{done}-{claimerUserId}-{messageId}
    const parts = customId.split('-');
    const carriesNeeded = parseInt(parts[2]);
    let carriesDone = parseInt(parts[3]);
    const claimerUserId = parts[4];
    const messageId = parts[5];
    
    // Check if the user clicking the button is the original claimer
    if (interaction.user.id !== claimerUserId) {
      await interaction.followUp({
        content: '❌ Only the person who claimed this ticket can update the carry tracker.',
        ephemeral: true
      });
      return;
    }
    
    // Update the carries done count
    if (isIncrement) {
      carriesDone = Math.min(carriesDone + 1, carriesNeeded); // Don't exceed needed
    } else {
      carriesDone = Math.max(carriesDone - 1, 0); // Don't go below 0
    }
    
    // Get ticket type from channel name for pricing
    const channelName = interaction.channel.name;
    let ticketType = 'Unknown';
    if (channelName.includes('t4-eman-bruiser')) ticketType = 'T4 Enderman Bruiser';
    else if (channelName.includes('t4-eman-sepulture')) ticketType = 'T4 Enderman Sepulture';
    else if (channelName.includes('t2-blaze')) ticketType = 'T2 Blaze';
    else if (channelName.includes('t3-blaze')) ticketType = 'T3 Blaze';
    else if (channelName.includes('t4-blaze')) ticketType = 'T4 Blaze';
    else if (channelName.includes('f4-thorn')) ticketType = 'F4 Thorn';
    else if (channelName.includes('f5-livid')) ticketType = 'F5 Livid';
    else if (channelName.includes('f6-sadan')) ticketType = 'F6 Sadan';
    else if (channelName.includes('f7-necron')) ticketType = 'F7 Necron';
    else if (channelName.includes('m1')) ticketType = 'M1';
    else if (channelName.includes('m2')) ticketType = 'M2';
    else if (channelName.includes('m3')) ticketType = 'M3';
    else if (channelName.includes('m4-thorn')) ticketType = 'M4 Thorn';
    else if (channelName.includes('m5-livid')) ticketType = 'M5 Livid';
    else if (channelName.includes('m6-sadan')) ticketType = 'M6 Sadan';
    else if (channelName.includes('m7-necron')) ticketType = 'M7 Necron';
    else if (channelName.includes('dungeon')) ticketType = 'Dungeon';
    // Crimson specific types
    else if (channelName.includes('ashfang')) ticketType = 'Ashfang';
    else if (channelName.includes('basic-kuudra')) ticketType = 'Basic Kuudra';
    else if (channelName.includes('hot-kuudra')) ticketType = 'Hot Kuudra';
    else if (channelName.includes('burning-kuudra')) ticketType = 'Burning Kuudra';
    else if (channelName.includes('fiery-kuudra')) ticketType = 'Fiery Kuudra';
    else if (channelName.includes('infernal-kuudra')) ticketType = 'Infernal Kuudra';
    else if (channelName.includes('crimson')) ticketType = 'Crimson'; // fallback
    
    // Calculate payment information
    const pricePerCarry = CARRY_PRICES[ticketType] || 0;
    const totalPayment = carriesNeeded * pricePerCarry;
    const paidAmount = carriesDone * pricePerCarry;
    const remainingPayment = totalPayment - paidAmount;
    
    // Update the embed
    const embed = interaction.message.embeds[0];
    const updatedEmbed = new EmbedBuilder()
      .setTitle(embed.title)
      .setDescription(embed.description)
      .addFields([
        {
          name: '📋 Carries Needed',
          value: `${carriesNeeded} ${carriesNeeded === 1 ? 'carry' : 'carries'}`,
          inline: true
        },
        {
          name: '✅ Carries Done',
          value: `${carriesDone} ${carriesDone === 1 ? 'carry' : 'carries'}`,
          inline: true
        },
        {
          name: '\u200B', // Empty field for spacing
          value: '\u200B',
          inline: true
        },
        {
          name: '💰 Total Payment',
          value: `${formatCoins(totalPayment)} coins`,
          inline: true
        },
        {
          name: '💸 Remaining Payment',
          value: `${formatCoins(remainingPayment)} coins`,
          inline: true
        },
        {
          name: '✨ Paid Amount',
          value: `${formatCoins(paidAmount)} coins`,
          inline: true
        }
      ])
      .setColor(carriesDone >= carriesNeeded ? 'Gold' : 'Green') // Change color when complete
      .setTimestamp();

    // Update the buttons with new counts
    const decrementButton = new ButtonBuilder()
      .setCustomId(`decrement-carry-${carriesNeeded}-${carriesDone}-${claimerUserId}-${messageId}`)
      .setLabel('➖')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(carriesDone === 0);

    const incrementButton = new ButtonBuilder()
      .setCustomId(`increment-carry-${carriesNeeded}-${carriesDone}-${claimerUserId}-${messageId}`)
      .setLabel('➕')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(carriesDone >= carriesNeeded);

    const trackerRow = new ActionRowBuilder().addComponents(decrementButton, incrementButton);
    
    // Update the current message directly (no need to delete and recreate)
    await interaction.message.edit({ embeds: [updatedEmbed], components: [trackerRow] });
    
  } catch (error) {
    console.error('Error updating carry tracker:', error);
    try {
      await interaction.followUp({
        content: '❌ An error occurred while updating the carry tracker.',
        ephemeral: true
      });
    } catch (followUpError) {
      console.error('Error with followUp:', followUpError);
    }
  }
}

async function handleTicketClaim(interaction) {
  try {
    // Defer the reply immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const channel = interaction.channel;
    const member = interaction.member;
    const channelName = channel.name;
    
    // Extract ticket type from channel name
    let ticketType = null;
    let allowedRoles = [];
    
    // Determine ticket type and allowed roles
    if (channelName.includes('t4-eman-bruiser')) {
      ticketType = 'T4 Enderman Bruiser';
      allowedRoles = [
        CARRIER_ROLES.T4_EMAN_BRUISER,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('t4-eman-sepulture')) {
      ticketType = 'T4 Enderman Sepulture';
      allowedRoles = [
        CARRIER_ROLES.T4_EMAN_SEPULTURE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('t2-blaze')) {
      ticketType = 'T2 Blaze';
      allowedRoles = [
        CARRIER_ROLES.T2_BLAZE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('t3-blaze')) {
      ticketType = 'T3 Blaze';
      allowedRoles = [
        CARRIER_ROLES.T3_BLAZE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('t4-blaze')) {
      ticketType = 'T4 Blaze';
      allowedRoles = [
        CARRIER_ROLES.T4_BLAZE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('ashfang')) {
      ticketType = 'Ashfang';
      allowedRoles = [
        CARRIER_ROLES.ASHFANG,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('basic-kuudra')) {
      ticketType = 'Basic Kuudra';
      allowedRoles = [
        CARRIER_ROLES.BASIC_KUUDRA,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('hot-kuudra')) {
      ticketType = 'Hot Kuudra';
      allowedRoles = [
        CARRIER_ROLES.HOT_KUUDRA,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('burning-kuudra')) {
      ticketType = 'Burning Kuudra';
      allowedRoles = [
        CARRIER_ROLES.BURNING_KUUDRA,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('fiery-kuudra')) {
      ticketType = 'Fiery Kuudra';
      allowedRoles = [
        CARRIER_ROLES.FIERY_KUUDRA,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('infernal-kuudra')) {
      ticketType = 'Infernal Kuudra';
      allowedRoles = [
        CARRIER_ROLES.INFERNAL_KUUDRA,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('f4-thorn')) {
      ticketType = 'F4 Thorn';
      allowedRoles = [
        CARRIER_ROLES.F4_DUNGEON,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('f5-livid')) {
      ticketType = 'F5 Livid';
      allowedRoles = [
        CARRIER_ROLES.F5_DUNGEON,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('f6-sadan')) {
      ticketType = 'F6 Sadan';
      allowedRoles = [
        CARRIER_ROLES.F6_DUNGEON,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('f7-necron')) {
      ticketType = 'F7 Necron';
      allowedRoles = [
        CARRIER_ROLES.F7_DUNGEON,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('m1')) {
      ticketType = 'M1';
      allowedRoles = [
        CARRIER_ROLES.M1_MASTERMODE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('m2')) {
      ticketType = 'M2';
      allowedRoles = [
        CARRIER_ROLES.M2_MASTERMODE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('m3')) {
      ticketType = 'M3';
      allowedRoles = [
        CARRIER_ROLES.M3_MASTERMODE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('m4-thorn')) {
      ticketType = 'M4 Thorn';
      allowedRoles = [
        CARRIER_ROLES.M4_MASTERMODE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('m5-livid')) {
      ticketType = 'M5 Livid';
      allowedRoles = [
        CARRIER_ROLES.M5_MASTERMODE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('m6-sadan')) {
      ticketType = 'M6 Sadan';
      allowedRoles = [
        CARRIER_ROLES.M6_MASTERMODE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('m7-necron')) {
      ticketType = 'M7 Necron';
      allowedRoles = [
        CARRIER_ROLES.M7_MASTERMODE,
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('dungeon')) {
      ticketType = 'Dungeon';
      allowedRoles = [
        STAFF_ROLES.STAFF
      ];
    } else if (channelName.includes('crimson')) {
      ticketType = 'Crimson';
      allowedRoles = [
        STAFF_ROLES.STAFF
      ];
    } else {
      ticketType = 'Unknown';
      allowedRoles = [
        STAFF_ROLES.STAFF
      ];
    }
    
    // Check if user has required roles
    const hasRequiredRole = allowedRoles.some(roleId => {
      return roleId && member.roles.cache.has(roleId);
    });
    
    if (!hasRequiredRole) {
      await interaction.editReply({
        content: `❌ You don't have permission to claim this ticket. Contact staff if you believe this is an error.`
      });
      return;
    }
    
    // Edit the deferred reply
    await interaction.editReply({
      content: `✅ Successfully claimed this ${ticketType} ticket!`
    });
    
    // Update the original message's buttons
    const disabledClaimButton = new ButtonBuilder()
      .setCustomId('claim-ticket')
      .setLabel(`🔖 Claimed by ${member.user.username}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);
    
    const unclaimButton = new ButtonBuilder()
      .setCustomId('unclaim-ticket')
      .setLabel('🔓 Unclaim')
      .setStyle(ButtonStyle.Primary);
    
    const forceUnclaimButton = new ButtonBuilder()
      .setCustomId('force-unclaim-ticket')
      .setLabel('⚠️ Force Unclaim')
      .setStyle(ButtonStyle.Danger);
    
    const closeButton = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Close')
      .setStyle(ButtonStyle.Danger);
    
    const row = new ActionRowBuilder().addComponents(disabledClaimButton, unclaimButton, forceUnclaimButton, closeButton);
    
    // Update the original message that contains the buttons
    const originalMessage = interaction.message;
    await originalMessage.edit({ components: [row] });
    
    // Extract number of carries from the original ticket embed or preserved progress
    let carriesRequested = 1; // Default to 1 if not found
    let carriesAlreadyDone = 0; // Default to 0 if not found
    
    // Check if this is a re-claim with preserved progress
    const customId = interaction.customId;
    if (customId.startsWith('claim-ticket-')) {
      // Extract preserved progress from button ID: claim-ticket-{needed}-{done}
      const parts = customId.split('-');
      if (parts.length >= 4) {
        carriesRequested = parseInt(parts[2]) || 1;
        carriesAlreadyDone = parseInt(parts[3]) || 0;
      }
    } else {
      // This is a fresh claim, extract from original embed
      try {
        const originalEmbed = originalMessage.embeds[0];
        if (originalEmbed && originalEmbed.fields) {
          const carriesField = originalEmbed.fields.find(field => 
            field.name.toLowerCase().includes('carries') || 
            field.name.toLowerCase().includes('carry')
          );
          if (carriesField) {
            const carriesMatch = carriesField.value.match(/(\d+)/);
            if (carriesMatch) {
              carriesRequested = parseInt(carriesMatch[1]);
            }
          }
        }
      } catch (error) {
        console.error('Error extracting carries count:', error);
      }
    }
    
    // Send a claim notification embed with carry information as a separate message
    const carriesNeeded = carriesRequested;
    const carriesDone = carriesAlreadyDone;
    
    // Get ticket type from channel name for pricing
    let priceTicketType = 'Unknown';
    if (channelName.includes('t4-eman-bruiser')) priceTicketType = 'T4 Enderman Bruiser';
    else if (channelName.includes('t4-eman-sepulture')) priceTicketType = 'T4 Enderman Sepulture';
    else if (channelName.includes('t2-blaze')) priceTicketType = 'T2 Blaze';
    else if (channelName.includes('t3-blaze')) priceTicketType = 'T3 Blaze';
    else if (channelName.includes('t4-blaze')) priceTicketType = 'T4 Blaze';
    else if (channelName.includes('f4-thorn')) priceTicketType = 'F4 Thorn';
    else if (channelName.includes('f5-livid')) priceTicketType = 'F5 Livid';
    else if (channelName.includes('f6-sadan')) priceTicketType = 'F6 Sadan';
    else if (channelName.includes('f7-necron')) priceTicketType = 'F7 Necron';
    else if (channelName.includes('m1')) priceTicketType = 'M1';
    else if (channelName.includes('m2')) priceTicketType = 'M2';
    else if (channelName.includes('m3')) priceTicketType = 'M3';
    else if (channelName.includes('m4-thorn')) priceTicketType = 'M4 Thorn';
    else if (channelName.includes('m5-livid')) priceTicketType = 'M5 Livid';
    else if (channelName.includes('m6-sadan')) priceTicketType = 'M6 Sadan';
    else if (channelName.includes('m7-necron')) priceTicketType = 'M7 Necron';
    else if (channelName.includes('dungeon')) priceTicketType = 'Dungeon';
    // Crimson specific types
    else if (channelName.includes('ashfang')) priceTicketType = 'Ashfang';
    else if (channelName.includes('basic-kuudra')) priceTicketType = 'Basic Kuudra';
    else if (channelName.includes('hot-kuudra')) priceTicketType = 'Hot Kuudra';
    else if (channelName.includes('burning-kuudra')) priceTicketType = 'Burning Kuudra';
    else if (channelName.includes('fiery-kuudra')) priceTicketType = 'Fiery Kuudra';
    else if (channelName.includes('infernal-kuudra')) priceTicketType = 'Infernal Kuudra';
    else if (channelName.includes('crimson')) priceTicketType = 'Crimson'; // fallback
    
    // Calculate payment information
    const pricePerCarry = CARRY_PRICES[priceTicketType] || 0;
    const totalPayment = carriesNeeded * pricePerCarry;
    const paidAmount = carriesDone * pricePerCarry;
    const remainingPayment = totalPayment - paidAmount;
    
    const claimTitle = carriesAlreadyDone > 0 ? '🔄 Ticket Re-Claimed' : '🔖 Ticket Claimed';
    const claimDescription = carriesAlreadyDone > 0 
      ? `This ticket has been re-claimed by ${member.user.tag} (${carriesAlreadyDone}/${carriesNeeded} carries already completed)`
      : `This ticket has been claimed by ${member.user.tag}`;
    
    const claimEmbed = new EmbedBuilder()
      .setTitle(claimTitle)
      .setDescription(claimDescription)
      .addFields([
        {
          name: '📋 Carries Needed',
          value: `${carriesNeeded} ${carriesNeeded === 1 ? 'carry' : 'carries'}`,
          inline: true
        },
        {
          name: '✅ Carries Done',
          value: `${carriesDone} ${carriesDone === 1 ? 'carry' : 'carries'}`,
          inline: true
        },
        {
          name: '\u200B', // Empty field for spacing
          value: '\u200B',
          inline: true
        },
        {
          name: '💰 Total Payment',
          value: `${formatCoins(totalPayment)} coins`,
          inline: true
        },
        {
          name: '💸 Remaining Payment',
          value: `${formatCoins(remainingPayment)} coins`,
          inline: true
        },
        {
          name: '✨ Paid Amount',
          value: `${formatCoins(paidAmount)} coins`,
          inline: true
        }
      ])
      .setColor(carriesDone >= carriesNeeded ? 'Gold' : 'Green')
      .setTimestamp();

    // Create initial tracker buttons (will be updated after message is sent)
    const decrementButton = new ButtonBuilder()
      .setCustomId(`decrement-carry-temp`)
      .setLabel('➖')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(carriesDone === 0); // Disabled if no carries done

    const incrementButton = new ButtonBuilder()
      .setCustomId(`increment-carry-temp`)
      .setLabel('➕')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(carriesDone >= carriesNeeded); // Disabled if all carries done

    const trackerRow = new ActionRowBuilder().addComponents(decrementButton, incrementButton);
    
    // Send the payment tracker message and store its ID for future updates
    const trackerMessage = await channel.send({ embeds: [claimEmbed], components: [trackerRow] });
    
    // Store the tracker message ID and claimer ID in the button custom IDs for later reference
    const newDecrementButton = new ButtonBuilder()
      .setCustomId(`decrement-carry-${carriesRequested}-${carriesDone}-${member.user.id}-${trackerMessage.id}`)
      .setLabel('➖')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(carriesDone === 0);

    const newIncrementButton = new ButtonBuilder()
      .setCustomId(`increment-carry-${carriesRequested}-${carriesDone}-${member.user.id}-${trackerMessage.id}`)
      .setLabel('➕')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(carriesDone >= carriesRequested);

    const newTrackerRow = new ActionRowBuilder().addComponents(newDecrementButton, newIncrementButton);
    
    // Update the message with the new button IDs that include claimer and message IDs
    await trackerMessage.edit({ embeds: [claimEmbed], components: [newTrackerRow] });
    
  } catch (error) {
    console.error('Error claiming ticket:', error);
    try {
      await interaction.editReply({
        content: '❌ An error occurred while claiming the ticket.'
      });
    } catch (editError) {
      console.error('Error editing reply:', editError);
      // If editReply fails, try followUp as a last resort
      try {
        await interaction.followUp({
          content: '❌ An error occurred while claiming the ticket.',
          ephemeral: true
        });
      } catch (followUpError) {
        console.error('Error with followUp:', followUpError);
      }
    }
  }
}

async function handleTicketUnclaim(interaction) {
  try {
    // Defer the reply immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const channel = interaction.channel;
    const member = interaction.member;
    const originalMessage = interaction.message;
    
    // Get the original claimer from the button label
    const originalClaimButton = originalMessage.components[0].components.find(btn => btn.customId === 'claim-ticket');
    const originalClaimer = originalClaimButton.label.replace('🔖 Claimed by ', '');
    
    // Check if the person unclaiming is the original claimer or staff
    const isOriginalClaimer = member.user.username === originalClaimer;
    const channelName = channel.name;
    let isStaff = false;
    
    // Check if user is staff for any ticket type
    isStaff = member.roles.cache.has(STAFF_ROLES.STAFF);
    
    if (!isOriginalClaimer && !isStaff) {
      await interaction.editReply({
        content: `❌ Only the original claimer (${originalClaimer}) or staff can unclaim this ticket.`
      });
      return;
    }
    
    // Find the latest carry tracker message to preserve progress
    let currentCarryProgress = { needed: 1, done: 0 };
    try {
      const messages = await channel.messages.fetch({ limit: 50 });
      const trackerMessage = messages.find(msg => 
        msg.author.bot && 
        msg.embeds.length > 0 && 
        msg.embeds[0].title === '🔖 Ticket Claimed'
      );
      
      if (trackerMessage && trackerMessage.embeds[0].fields) {
        const embed = trackerMessage.embeds[0];
        const carriesNeededField = embed.fields.find(field => field.name === '📋 Carries Needed');
        const carriesDoneField = embed.fields.find(field => field.name === '✅ Carries Done');
        
        if (carriesNeededField) {
          const neededMatch = carriesNeededField.value.match(/(\d+)/);
          if (neededMatch) currentCarryProgress.needed = parseInt(neededMatch[1]);
        }
        
        if (carriesDoneField) {
          const doneMatch = carriesDoneField.value.match(/(\d+)/);
          if (doneMatch) currentCarryProgress.done = parseInt(doneMatch[1]);
        }
        
        // Delete the old tracker message since ticket is being unclaimed
        await trackerMessage.delete();
      }
    } catch (error) {
      console.error('Error preserving carry progress:', error);
    }
    
    // Record carries completed by the unclaiming carrier
    let carryTrackingField = null;
    if (currentCarryProgress.done > 0) {
      try {
        // Determine ticket type for carry tracking
        let ticketType = null;
        let carryType = null;
        
        // Determine ticket type from channel name
        if (channelName.includes('slayer') || channelName.includes('eman') || channelName.includes('blaze')) {
          ticketType = 'Slayer';
        } else if (channelName.includes('dungeon') && !channelName.includes('mastermode') && !channelName.includes('m4') && !channelName.includes('m5') && !channelName.includes('m6') && !channelName.includes('m7')) {
          ticketType = 'Dungeon';
        } else if (channelName.includes('mastermode') || channelName.includes('m4') || channelName.includes('m5') || channelName.includes('m6') || channelName.includes('m7')) {
          ticketType = 'Mastermode';
        } else if (channelName.includes('crimson') || channelName.includes('ashfang') || channelName.includes('kuudra')) {
          ticketType = 'Crimson';
        }
        
        // Determine specific carry type
        const channelLower = channelName.toLowerCase();
        if (ticketType === 'Slayer') {
          if (channelLower.includes('bruiser')) carryType = 'T4 Eman Bruiser';
          else if (channelLower.includes('sepulture')) carryType = 'T4 Eman Sepulture';
          else if (channelLower.includes('eman')) carryType = 'T4 Eman Bruiser';
          else if (channelLower.includes('t2') && channelLower.includes('blaze')) carryType = 'T2 Blaze';
          else if (channelLower.includes('t3') && channelLower.includes('blaze')) carryType = 'T3 Blaze';
          else if (channelLower.includes('t4') && channelLower.includes('blaze')) carryType = 'T4 Blaze';
          else if (channelLower.includes('blaze')) carryType = 'T4 Blaze';
        } else if (ticketType === 'Dungeon') {
          if (channelLower.includes('f4')) carryType = 'F4';
          else if (channelLower.includes('f5')) carryType = 'F5';
          else if (channelLower.includes('f6')) carryType = 'F6';
          else if (channelLower.includes('f7')) carryType = 'F7';
          else carryType = 'Dungeon Carry';
        } else if (ticketType === 'Mastermode') {
          if (channelLower.includes('m1')) carryType = 'M1';
          else if (channelLower.includes('m2')) carryType = 'M2';
          else if (channelLower.includes('m3')) carryType = 'M3';
          else if (channelLower.includes('m4')) carryType = 'M4';
          else if (channelLower.includes('m5')) carryType = 'M5';
          else if (channelLower.includes('m6')) carryType = 'M6';
          else if (channelLower.includes('m7')) carryType = 'M7';
          else carryType = 'Mastermode Carry';
        } else if (ticketType === 'Crimson') {
          carryType = 'Crimson Carry';
        }
        
        if (carryType) {
          // Record the carries completed by the unclaiming carrier
          recordCarryCompletion(member.user.id, carryType, currentCarryProgress.done);
          console.log(`Recorded ${currentCarryProgress.done} ${carryType} carries for unclaiming carrier ${member.user.id}`);
          
          // Store field for later addition to embed
          carryTrackingField = {
            name: '📊 Carries Recorded',
            value: `✅ ${currentCarryProgress.done} ${carryType} ${currentCarryProgress.done === 1 ? 'carry' : 'carries'} credited to ${member.user.tag}`,
            inline: false
          };
        }
        
      } catch (trackingError) {
        console.error('Error recording carries for unclaiming carrier:', trackingError);
      }
    }
    
    // Edit the deferred reply
    await interaction.editReply({
      content: `✅ Ticket has been unclaimed and is now available for others to claim.`
    });
    
    // Store carry progress in the claim button's custom ID for the next claimer
    const claimButton = new ButtonBuilder()
      .setCustomId(`claim-ticket-${currentCarryProgress.needed}-${currentCarryProgress.done}`)
      .setLabel('🔖 Claim')
      .setStyle(ButtonStyle.Secondary);
    
    const closeButton = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Close')
      .setStyle(ButtonStyle.Danger);
    
    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);
    
    // Update the original message to remove unclaim button
    await originalMessage.edit({ components: [row] });
     // Send unclaim notification embed
    const unclaimEmbed = new EmbedBuilder()
      .setTitle('🔓 Ticket Unclaimed')
      .setDescription(`This ticket has been unclaimed by ${member.user.tag} and is now available for others to claim.`)
      .addFields([
        {
          name: '📊 Progress Preserved',
          value: `${currentCarryProgress.done}/${currentCarryProgress.needed} carries completed`,
          inline: true
        }
      ])
      .setColor('Orange')
      .setTimestamp();
    
    // Add carry tracking field if carries were recorded
    if (carryTrackingField) {
      unclaimEmbed.addFields(carryTrackingField);
    }

    await channel.send({ embeds: [unclaimEmbed] });
    
    // Determine which carrier role to ping again based on channel name
    let roleToPing = null;
    const channelNameLower = channel.name.toLowerCase();
    
    // Check for slayer types
    if (channelNameLower.includes('eman') || channelNameLower.includes('voidgloom')) {
      if (channelNameLower.includes('bruiser')) {
        roleToPing = CARRIER_ROLES.T4_EMAN_BRUISER;
      } else if (channelNameLower.includes('sepulture')) {
        roleToPing = CARRIER_ROLES.T4_EMAN_SEPULTURE;
      }
    } else if (channelNameLower.includes('blaze') || channelNameLower.includes('inferno')) {
      if (channelNameLower.includes('t2')) {
        roleToPing = CARRIER_ROLES.T2_BLAZE;
      } else if (channelNameLower.includes('t3')) {
        roleToPing = CARRIER_ROLES.T3_BLAZE;
      } else if (channelNameLower.includes('t4')) {
        roleToPing = CARRIER_ROLES.T4_BLAZE;
      }
    } 
    // Check for crimson types
    else if (channelNameLower.includes('ashfang')) {
      roleToPing = CARRIER_ROLES.ASHFANG;
    } else if (channelNameLower.includes('basic-kuudra')) {
      roleToPing = CARRIER_ROLES.BASIC_KUUDRA;
    } else if (channelNameLower.includes('hot-kuudra')) {
      roleToPing = CARRIER_ROLES.HOT_KUUDRA;
    } else if (channelNameLower.includes('burning-kuudra')) {
      roleToPing = CARRIER_ROLES.BURNING_KUUDRA;
    } else if (channelNameLower.includes('fiery-kuudra')) {
      roleToPing = CARRIER_ROLES.FIERY_KUUDRA;
    } else if (channelNameLower.includes('infernal-kuudra')) {
      roleToPing = CARRIER_ROLES.INFERNAL_KUUDRA;
    } 
    // Check for dungeon floors
    else if (channelNameLower.includes('f4') || channelNameLower.includes('thorn')) {
      roleToPing = CARRIER_ROLES.F4_THORN_CARRIER;
    } else if (channelNameLower.includes('f5') || channelNameLower.includes('livid')) {
      roleToPing = CARRIER_ROLES.F5_LIVID_CARRIER;
    } else if (channelNameLower.includes('f6') || channelNameLower.includes('sadan')) {
      roleToPing = CARRIER_ROLES.F6_SADAN_CARRIER;
    } else if (channelNameLower.includes('f7') || channelNameLower.includes('necron')) {
      roleToPing = CARRIER_ROLES.F7_NECRON_CARRIER;
    } 
    // Check for mastermode floors
    else if (channelNameLower.includes('m1') || channelNameLower.includes('bonzo')) {
      roleToPing = CARRIER_ROLES.M1_CARRIER;
    } else if (channelNameLower.includes('m2') || channelNameLower.includes('scarf')) {
      roleToPing = CARRIER_ROLES.M2_CARRIER;
    } else if (channelNameLower.includes('m3') || channelNameLower.includes('professor')) {
      roleToPing = CARRIER_ROLES.M3_CARRIER;
    } else if (channelNameLower.includes('m4') && channelNameLower.includes('thorn')) {
      roleToPing = CARRIER_ROLES.M4_THORN_CARRIER;
    } else if (channelNameLower.includes('m5') && channelNameLower.includes('livid')) {
      roleToPing = CARRIER_ROLES.M5_LIVID_CARRIER;
    } else if (channelNameLower.includes('m6') && channelNameLower.includes('sadan')) {
      roleToPing = CARRIER_ROLES.M6_SADAN_CARRIER;
    } else if (channelNameLower.includes('m7') && channelNameLower.includes('necron')) {
      roleToPing = CARRIER_ROLES.M7_NECRON_CARRIER;
    }
    
    // Send ping to re-notify carriers about unclaimed ticket
    const pingRole = roleToPing || STAFF_ROLES.STAFF;
    if (pingRole) {
      await channel.send(`<@&${pingRole}>`);
    }
    
  } catch (error) {
    console.error('Error unclaiming ticket:', error);
    await interaction.reply({
      content: '❌ An error occurred while unclaiming the ticket.',
      ephemeral: true
    });
  }
}

async function handleForceTicketUnclaim(interaction) {
  try {
    // Defer the reply immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const channel = interaction.channel;
    const member = interaction.member;
    const originalMessage = interaction.message;
    
    // Check if the user is an admin
    const isAdmin = member.roles.cache.has(STAFF_ROLES.ADMIN) || member.roles.cache.has(STAFF_ROLES.STAFF);
    
    if (!isAdmin) {
      await interaction.editReply({
        content: '❌ Only admins can force unclaim tickets.'
      });
      return;
    }
    
    // Get the original claimer from the button label
    const originalClaimButton = originalMessage.components[0].components.find(btn => btn.customId === 'claim-ticket');
    const originalClaimer = originalClaimButton.label.replace('🔖 Claimed by ', '');
    
    // Find the latest carry tracker message to preserve progress
    let currentCarryProgress = { needed: 1, done: 0 };
    try {
      const messages = await channel.messages.fetch({ limit: 50 });
      const trackerMessage = messages.find(msg => 
        msg.author.bot && 
        msg.embeds.length > 0 && 
        msg.embeds[0].title === '🔖 Ticket Claimed'
      );
      
      if (trackerMessage && trackerMessage.embeds[0].fields) {
        const embed = trackerMessage.embeds[0];
        const carriesNeededField = embed.fields.find(field => field.name === '📋 Carries Needed');
        const carriesDoneField = embed.fields.find(field => field.name === '✅ Carries Done');
        
        if (carriesNeededField) {
          const neededMatch = carriesNeededField.value.match(/(\d+)/);
          if (neededMatch) currentCarryProgress.needed = parseInt(neededMatch[1]);
        }
        
        if (carriesDoneField) {
          const doneMatch = carriesDoneField.value.match(/(\d+)/);
          if (doneMatch) currentCarryProgress.done = parseInt(doneMatch[1]);
        }
        
        // Delete the old tracker message since ticket is being force unclaimed
        await trackerMessage.delete();
      }
    } catch (error) {
      console.error('Error preserving carry progress during force unclaim:', error);
    }
    
    // Edit the deferred reply
    await interaction.editReply({
      content: `⚠️ Ticket has been force unclaimed by admin and is now available for others to claim.`
    });
    
    // Store carry progress in the claim button's custom ID for the next claimer
    const claimButton = new ButtonBuilder()
      .setCustomId(`claim-ticket-${currentCarryProgress.needed}-${currentCarryProgress.done}`)
      .setLabel('🔖 Claim')
      .setStyle(ButtonStyle.Secondary);
    
    const closeButton = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Close')
      .setStyle(ButtonStyle.Danger);
    
    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);
    
    // Update the original message to remove unclaim buttons
    await originalMessage.edit({ components: [row] });
    
    // Send force unclaim notification embed
    const forceUnclaimEmbed = new EmbedBuilder()
      .setTitle('⚠️ Ticket Force Unclaimed by Admin')
      .setDescription(`This ticket has been force unclaimed by admin ${member.user.tag} from ${originalClaimer} and is now available for others to claim.`)
      .addFields([
        {
          name: '📊 Progress Preserved',
          value: `${currentCarryProgress.done}/${currentCarryProgress.needed} carries completed`,
          inline: true
        }
      ])
      .setColor('Red')
      .setTimestamp();

    await channel.send({ embeds: [forceUnclaimEmbed] });
    
    // Determine which carrier role to ping again based on channel name
    let roleToPing = null;
    const channelNameLower = channel.name.toLowerCase();
    
    // Check for slayer types
    if (channelNameLower.includes('eman') || channelNameLower.includes('voidgloom')) {
      if (channelNameLower.includes('bruiser')) {
        roleToPing = CARRIER_ROLES.T4_EMAN_BRUISER;
      } else if (channelNameLower.includes('sepulture')) {
        roleToPing = CARRIER_ROLES.T4_EMAN_SEPULTURE;
      }
    } else if (channelNameLower.includes('blaze') || channelNameLower.includes('inferno')) {
      if (channelNameLower.includes('t2')) {
        roleToPing = CARRIER_ROLES.T2_BLAZE;
      } else if (channelNameLower.includes('t3')) {
        roleToPing = CARRIER_ROLES.T3_BLAZE;
      } else if (channelNameLower.includes('t4')) {
        roleToPing = CARRIER_ROLES.T4_BLAZE;
      }
    } 
    // Check for crimson types
    else if (channelNameLower.includes('ashfang')) {
      roleToPing = CARRIER_ROLES.ASHFANG;
    } else if (channelNameLower.includes('basic-kuudra')) {
      roleToPing = CARRIER_ROLES.BASIC_KUUDRA;
    } else if (channelNameLower.includes('hot-kuudra')) {
      roleToPing = CARRIER_ROLES.HOT_KUUDRA;
    } else if (channelNameLower.includes('burning-kuudra')) {
      roleToPing = CARRIER_ROLES.BURNING_KUUDRA;
    } else if (channelNameLower.includes('fiery-kuudra')) {
      roleToPing = CARRIER_ROLES.FIERY_KUUDRA;
    } else if (channelNameLower.includes('infernal-kuudra')) {
      roleToPing = CARRIER_ROLES.INFERNAL_KUUDRA;
    } 
    // Check for dungeon floors
    else if (channelNameLower.includes('f4') || channelNameLower.includes('thorn')) {
      roleToPing = CARRIER_ROLES.F4_THORN_CARRIER;
    } else if (channelNameLower.includes('f5') || channelNameLower.includes('livid')) {
      roleToPing = CARRIER_ROLES.F5_LIVID_CARRIER;
    } else if (channelNameLower.includes('f6') || channelNameLower.includes('sadan')) {
      roleToPing = CARRIER_ROLES.F6_SADAN_CARRIER;
    } else if (channelNameLower.includes('f7') || channelNameLower.includes('necron')) {
      roleToPing = CARRIER_ROLES.F7_NECRON_CARRIER;
    } 
    // Check for mastermode floors
    else if (channelNameLower.includes('m1') || channelNameLower.includes('bonzo')) {
      roleToPing = CARRIER_ROLES.M1_CARRIER;
    } else if (channelNameLower.includes('m2') || channelNameLower.includes('scarf')) {
      roleToPing = CARRIER_ROLES.M2_CARRIER;
    } else if (channelNameLower.includes('m3') || channelNameLower.includes('professor')) {
      roleToPing = CARRIER_ROLES.M3_CARRIER;
    } else if (channelNameLower.includes('m4') && channelNameLower.includes('thorn')) {
      roleToPing = CARRIER_ROLES.M4_THORN_CARRIER;
    } else if (channelNameLower.includes('m5') && channelNameLower.includes('livid')) {
      roleToPing = CARRIER_ROLES.M5_LIVID_CARRIER;
    } else if (channelNameLower.includes('m6') && channelNameLower.includes('sadan')) {
      roleToPing = CARRIER_ROLES.M6_SADAN_CARRIER;
    } else if (channelNameLower.includes('m7') && channelNameLower.includes('necron')) {
      roleToPing = CARRIER_ROLES.M7_NECRON_CARRIER;
    }
    
    // Send ping to re-notify carriers about force unclaimed ticket
    const pingRole = roleToPing || STAFF_ROLES.STAFF;
    if (pingRole) {
      await channel.send(`<@&${pingRole}>`);
    }
    
  } catch (error) {
    console.error('Error force unclaiming ticket:', error);
    await interaction.reply({
      content: '❌ An error occurred while force unclaiming the ticket.',
      ephemeral: true
    });
  }
}

async function handleTicketClose(interaction) {
  try {
    const channel = interaction.channel;
    const member = interaction.member;
    const channelName = channel.name;
    
    // Determine ticket type and check permissions
    let ticketType = null;
    let isStaff = false;
    
    // Determine ticket type
    if (channelName.includes('slayer') || channelName.includes('eman') || channelName.includes('blaze')) {
      ticketType = 'Slayer';
    } else if (channelName.includes('dungeon') && !channelName.includes('mastermode') && !channelName.includes('m4') && !channelName.includes('m5') && !channelName.includes('m6') && !channelName.includes('m7')) {
      ticketType = 'Dungeon';
    } else if (channelName.includes('mastermode') || channelName.includes('m4') || channelName.includes('m5') || channelName.includes('m6') || channelName.includes('m7')) {
      ticketType = 'Mastermode';
    } else if (channelName.includes('crimson') || channelName.includes('ashfang') || channelName.includes('kuudra')) {
      ticketType = 'Crimson';
    }
    
    // Check if user is staff
    isStaff = member.roles.cache.has(STAFF_ROLES.STAFF);
    
    // Defer the reply to prevent timeout (moved up to fetch messages for permission check)
    await interaction.deferReply({ ephemeral: true });
    
    // Fetch messages to check claim status for permissions
    const messages = await channel.messages.fetch({ limit: 100 });
    const claimMessage = messages.find(msg => 
      msg.embeds.length > 0 && 
      msg.embeds[0].title === '🔖 Ticket Claimed'
    );
    
    let claimerUserId = null;
    if (claimMessage) {
      const embed = claimMessage.embeds[0];
      const claimDescription = embed.description;
      const userMatch = claimDescription.match(/claimed by <@!?(\d+)>/);
      if (userMatch) {
        claimerUserId = userMatch[1];
      }
    }
    
    // Check if user has permission to close (staff or claimer)
    const isClaimerOrStaff = isStaff || (claimerUserId && member.user.id === claimerUserId);
    
    if (!isClaimerOrStaff) {
      await interaction.editReply({
        content: `❌ Only Staff or the person who claimed this ticket can close it.`
      });
      return;
    }
    
    // Get comprehensive ticket information from channel messages
    let ticketCreator = null;
    let ticketCreatorId = null;
    let ticketInfo = null;
    let claimedBy = null;
    let claimedById = null;
    let ticketSubType = null;
    let messageCount = messages.size; // Use the already fetched messages
    let creationTime = null;
    
    // Collect all channel participants (users with view permissions)
    let channelParticipants = [];
    try {
      const permissionOverwrites = channel.permissionOverwrites.cache;
      for (const [id, overwrite] of permissionOverwrites) {
        if (overwrite.type === 1) { // Type 1 = member (not role)
          const hasViewChannel = overwrite.allow.has('ViewChannel');
          if (hasViewChannel) {
            try {
              const user = await interaction.client.users.fetch(id);
              channelParticipants.push({
                id: id,
                username: user.username,
                displayName: user.displayName || user.username
              });
            } catch (err) {
              console.log(`Could not fetch participant user ${id}:`, err.message);
              channelParticipants.push({
                id: id,
                username: 'Unknown User',
                displayName: 'Unknown User'
              });
            }
          }
        }
      }
      
      // Also collect users who have sent messages but might not have explicit permissions
      const messageAuthors = new Set();
      for (const message of messages.values()) {
        if (!message.author.bot && message.author.id !== interaction.client.user.id) {
          messageAuthors.add(message.author.id);
        }
      }
      
      // Add message authors who aren't already in participants list
      for (const authorId of messageAuthors) {
        if (!channelParticipants.some(p => p.id === authorId)) {
          try {
            const user = await interaction.client.users.fetch(authorId);
            channelParticipants.push({
              id: authorId,
              username: user.username,
              displayName: user.displayName || user.username
            });
          } catch (err) {
            console.log(`Could not fetch message author ${authorId}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.log('Error collecting channel participants:', err.message);
    }
    
    // Try to extract creator from channel name first
    const channelParts = channelName.split('-');
    if (channelParts.length > 3) {
      ticketCreator = channelParts[channelParts.length - 1];
    }
    
    // Find the ticket creation message (has embed with ticket info)
    const ticketMessage = messages.find(msg => 
      msg.embeds.length > 0 && 
      msg.embeds[0].title && 
      (msg.embeds[0].title.includes('Ticket') || 
       msg.embeds[0].title.includes('BRUISER') || 
       msg.embeds[0].title.includes('SEPULTURE') || 
       msg.embeds[0].title.includes('BLAZE') ||
       msg.embeds[0].title.includes('DUNGEON') ||
       msg.embeds[0].title.includes('MASTERMODE') ||
       msg.embeds[0].title.includes('CRIMSON'))
    );
    
    if (ticketMessage) {
      const embed = ticketMessage.embeds[0];
      creationTime = ticketMessage.createdTimestamp;
      
      // Extract detailed ticket information
      if (embed.fields && embed.fields.length > 0) {
        ticketInfo = embed.fields.map(field => `**${field.name}:** ${field.value}`).join('\n');
        
        // Try to get ticket subtype from title or fields
        const title = embed.title.toLowerCase();
        if (title.includes('bruiser')) ticketSubType = 'T4 Eman Bruiser';
        else if (title.includes('sepulture')) ticketSubType = 'T4 Eman Sepulture';
        else if (title.includes('t2') && title.includes('blaze')) ticketSubType = 'T2 Blaze';
        else if (title.includes('t3') && title.includes('blaze')) ticketSubType = 'T3 Blaze';
        else if (title.includes('t4') && title.includes('blaze')) ticketSubType = 'T4 Blaze';
        else if (title.includes('dungeon') && !title.includes('mastermode')) ticketSubType = 'Dungeon Carry';
        else if (title.includes('mastermode') || title.includes('m4') || title.includes('m5') || title.includes('m6') || title.includes('m7')) ticketSubType = 'Mastermode Carry';
        else if (title.includes('crimson') || title.includes('ashfang') || title.includes('kuudra')) ticketSubType = 'Crimson Carry';
        
        // Try to get creator from embed fields
        const requestedByField = embed.fields.find(field => 
          field.name.toLowerCase().includes('requested') || 
          field.name.toLowerCase().includes('user') ||
          field.name.toLowerCase().includes('member')
        );
        if (requestedByField && !ticketCreator) {
          ticketCreator = requestedByField.value.replace(/<@!?(\d+)>/, '$1');
        }
      } else {
        ticketInfo = embed.description || 'No detailed information available';
      }
      
      // Fallback: If no subtype detected from embed, try channel name
      if (!ticketSubType && ticketType) {
        const channelLower = channelName.toLowerCase();
        if (ticketType === 'Slayer') {
          if (channelLower.includes('bruiser')) ticketSubType = 'T4 Eman Bruiser';
          else if (channelLower.includes('sepulture')) ticketSubType = 'T4 Eman Sepulture';
          else if (channelLower.includes('eman')) ticketSubType = 'T4 Eman Bruiser'; // Default eman
          else if (channelLower.includes('t2') && channelLower.includes('blaze')) ticketSubType = 'T2 Blaze';
          else if (channelLower.includes('t3') && channelLower.includes('blaze')) ticketSubType = 'T3 Blaze';
          else if (channelLower.includes('t4') && channelLower.includes('blaze')) ticketSubType = 'T4 Blaze';
          else if (channelLower.includes('blaze')) ticketSubType = 'T4 Blaze'; // Default blaze
        } else if (ticketType === 'Crimson') {
          if (channelLower.includes('ashfang')) ticketSubType = 'Crimson Carry';
          else if (channelLower.includes('kuudra')) ticketSubType = 'Crimson Carry';
          else ticketSubType = 'Crimson Carry'; // Default crimson
        } else if (ticketType === 'Dungeon') {
          ticketSubType = 'Dungeon Carry';
        } else if (ticketType === 'Mastermode') {
          ticketSubType = 'Mastermode Carry';
        }
      }
      
      // Try to get creator ID from embed description or author
      if (embed.description) {
        const userMention = embed.description.match(/<@!?(\d+)>/);
        if (userMention) {
          ticketCreatorId = userMention[1];
          try {
            const user = await interaction.client.users.fetch(userMention[1]);
            ticketCreator = user.username;
          } catch (err) {
            console.log('Could not fetch user:', err.message);
          }
        }
      }
    }
    
    // Use the already found claim message from permission check
    if (claimMessage) {
      const embed = claimMessage.embeds[0];
      const claimDescription = embed.description;
      
      // Extract claimer info with better parsing
      const userMatch = claimDescription.match(/claimed by <@!?(\d+)>/);
      const nameMatch = claimDescription.match(/claimed by (.+)/);
      
      if (userMatch) {
        claimedById = userMatch[1];
        try {
          const user = await interaction.client.users.fetch(userMatch[1]);
          claimedBy = user.username;
        } catch (err) {
          console.log('Could not fetch claimer user:', err.message);
          claimedBy = nameMatch ? nameMatch[1] : 'Unknown';
        }
      } else if (nameMatch) {
        claimedBy = nameMatch[1];
      }
    }
    
    // Calculate ticket duration
    const closureTime = Date.now();
    const duration = creationTime ? closureTime - creationTime : null;
    
    // Determine which logging channel to use based on ticket type
    let logChannelId = LOGGING_CONFIG.TICKET_LOGS_CHANNEL; // Default fallback
    let logChannelName = 'ticket logs';
    
    if (ticketType === 'Slayer') {
      // Determine specific slayer type for logging
      if (ticketSubType && (ticketSubType.includes('Eman') || ticketSubType.includes('Voidgloom'))) {
        logChannelId = LOGGING_CONFIG.VOIDGLOOM_LOGS_CHANNEL;
        logChannelName = 'voidgloom logs';
      } else if (ticketSubType && ticketSubType.includes('Blaze')) {
        logChannelId = LOGGING_CONFIG.BLAZE_LOGS_CHANNEL;
        logChannelName = 'blaze logs';
      } else {
        // Generic slayer - check channel name for more clues
        if (channelName.includes('eman') || channelName.includes('voidgloom')) {
          logChannelId = LOGGING_CONFIG.VOIDGLOOM_LOGS_CHANNEL;
          logChannelName = 'voidgloom logs';
        } else if (channelName.includes('blaze')) {
          logChannelId = LOGGING_CONFIG.BLAZE_LOGS_CHANNEL;
          logChannelName = 'blaze logs';
        }
      }
    } else if (ticketType === 'Dungeon') {
      logChannelId = LOGGING_CONFIG.DUNGEON_LOGS_CHANNEL;
      logChannelName = 'dungeon logs';
    } else if (ticketType === 'Mastermode') {
      logChannelId = LOGGING_CONFIG.MASTERMODE_LOGS_CHANNEL;
      logChannelName = 'mastermode logs';
    } else if (ticketType === 'Crimson') {
      logChannelId = LOGGING_CONFIG.CRIMSON_LOGS_CHANNEL;
      logChannelName = 'crimson logs';
    }
    
    // Create closure log embed with enhanced formatting
    const closeEmbed = new EmbedBuilder()
      .setTitle('🔒 Ticket Closed')
      .setDescription(`**${channelName}** has been closed by ${member.user.tag}`)
      .setColor(0xFF4444)
      .addFields(
        { name: '📋 Ticket Type', value: ticketSubType || ticketType || 'Unknown', inline: true },
        { name: '👤 Creator', value: ticketCreator ? `${ticketCreator}${ticketCreatorId ? ` (<@${ticketCreatorId}>)` : ''}` : 'Unknown', inline: true },
        { name: '🏷️ Claimed By', value: claimedBy ? `${claimedBy}${claimedById ? ` (<@${claimedById}>)` : ''}` : 'Not claimed', inline: true },
        { name: '🔐 Closed By', value: `${member.user.tag} (<@${member.user.id}>)`, inline: true },
        { name: '⏰ Closure Time', value: `<t:${Math.floor(closureTime / 1000)}:F>`, inline: true },
        { name: '💬 Messages', value: messageCount.toString(), inline: true }
      )
      .setTimestamp();
    
    if (duration) {
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      closeEmbed.addFields({ 
        name: '⏱️ Duration', 
        value: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`, 
        inline: true 
      });
    }
    
    if (ticketInfo && ticketInfo !== 'No details available') {
      closeEmbed.addFields({ name: '📝 Ticket Details', value: ticketInfo, inline: false });
    }
    
    // Send closure notification to the ticket channel
    await channel.send({ embeds: [closeEmbed] });
    
    // Record carry completion if ticket was claimed
    if (claimedById && ticketSubType) {
      try {
        // Determine the specific carry type
        let carryType = ticketSubType;
        
        // Extract specific floor information from channel name or ticket info if available
        if (ticketType === 'Dungeon' || ticketType === 'Mastermode') {
          const channelLower = channelName.toLowerCase();
          
          // Check for specific floors in channel name
          if (channelLower.includes('f4') || channelLower.includes('floor-4')) {
            carryType = 'F4';
          } else if (channelLower.includes('f5') || channelLower.includes('floor-5')) {
            carryType = 'F5';
          } else if (channelLower.includes('f6') || channelLower.includes('floor-6')) {
            carryType = 'F6';
          } else if (channelLower.includes('f7') || channelLower.includes('floor-7')) {
            carryType = 'F7';
          } else if (channelLower.includes('m1') || channelLower.includes('master-1')) {
            carryType = 'M1';
          } else if (channelLower.includes('m2') || channelLower.includes('master-2')) {
            carryType = 'M2';
          } else if (channelLower.includes('m3') || channelLower.includes('master-3')) {
            carryType = 'M3';
          } else if (channelLower.includes('m4') || channelLower.includes('master-4')) {
            carryType = 'M4';
          } else if (channelLower.includes('m5') || channelLower.includes('master-5')) {
            carryType = 'M5';
          } else if (channelLower.includes('m6') || channelLower.includes('master-6')) {
            carryType = 'M6';
          } else if (channelLower.includes('m7') || channelLower.includes('master-7')) {
            carryType = 'M7';
          }
          
          // Also check in ticket info for floor information
          if (ticketInfo) {
            const infoLower = ticketInfo.toLowerCase();
            if (infoLower.includes('f4') || infoLower.includes('floor 4')) {
              carryType = 'F4';
            } else if (infoLower.includes('f5') || infoLower.includes('floor 5')) {
              carryType = 'F5';
            } else if (infoLower.includes('f6') || infoLower.includes('floor 6')) {
              carryType = 'F6';
            } else if (infoLower.includes('f7') || infoLower.includes('floor 7')) {
              carryType = 'F7';
            } else if (infoLower.includes('m1') || infoLower.includes('master 1')) {
              carryType = 'M1';
            } else if (infoLower.includes('m2') || infoLower.includes('master 2')) {
              carryType = 'M2';
            } else if (infoLower.includes('m3') || infoLower.includes('master 3')) {
              carryType = 'M3';
            } else if (infoLower.includes('m4') || infoLower.includes('master 4')) {
              carryType = 'M4';
            } else if (infoLower.includes('m5') || infoLower.includes('master 5')) {
              carryType = 'M5';
            } else if (infoLower.includes('m6') || infoLower.includes('master 6')) {
              carryType = 'M6';
            } else if (infoLower.includes('m7') || infoLower.includes('master 7')) {
              carryType = 'M7';
            }
          }
        }
        
        // Record the carry completion - extract actual carries done by current claimer
        let carriesCompleted = 1; // Default to 1 if we can't determine actual amount
        
        // Look for carry tracking messages to get actual carries done by this claimer
        const carryTrackingMessage = messages.find(msg => 
          msg.embeds.length > 0 && 
          msg.embeds[0].title === '🔖 Ticket Claimed' &&
          msg.embeds[0].description && 
          msg.embeds[0].description.includes(claimedById)
        );
        
        if (carryTrackingMessage) {
          // Look for carries completed in the claim message
          const embed = carryTrackingMessage.embeds[0];
          if (embed.fields) {
            const carriesField = embed.fields.find(field => 
              field.name && field.name.includes('Carries') && 
              field.value && field.value.includes('/')
            );
            if (carriesField) {
              // Extract "X/Y carries completed" format
              const carryMatch = carriesField.value.match(/(\d+)\/(\d+)\s+carries/);
              if (carryMatch) {
                const carriesDone = parseInt(carryMatch[1]);
                const totalNeeded = parseInt(carryMatch[2]);
                carriesCompleted = carriesDone;
                console.log(`Found ${carriesDone}/${totalNeeded} carries in claim message`);
              }
            }
          }
        }
        
        // If we couldn't find it in claim message, look in button interactions
        if (carriesCompleted === 1) {
          const incrementMessages = messages.filter(msg => 
            msg.embeds.length > 0 && 
            msg.components && msg.components.length > 0 &&
            msg.components[0].components.some(btn => 
              btn.customId && btn.customId.includes('increment-carry')
            )
          );
          
          // Get the most recent carry tracking message
          if (incrementMessages.length > 0) {
            const latestCarryMessage = incrementMessages[incrementMessages.length - 1];
            const embed = latestCarryMessage.embeds[0];
            if (embed.description) {
              const carryMatch = embed.description.match(/(\d+)\/(\d+)\s+carries/);
              if (carryMatch) {
                const carriesDone = parseInt(carryMatch[1]);
                carriesCompleted = carriesDone;
                console.log(`Found ${carriesDone} carries in latest tracking message`);
              }
            }
          }
        }
        
        recordCarryCompletion(claimedById, carryType, carriesCompleted);
        console.log(`Recorded carry completion: ${carriesCompleted} ${carryType} carries by carrier ${claimedById}`);
        
        // Add carry tracking information to the close embed
        closeEmbed.addFields({
          name: '📊 Carry Tracked',
          value: `✅ Recorded ${carriesCompleted} ${carryType} ${carriesCompleted === 1 ? 'carry' : 'carries'} for <@${claimedById}>`,
          inline: false
        });
        
      } catch (trackingError) {
        console.error('Error recording carry completion:', trackingError);
        // Don't fail the ticket closure if tracking fails
      }
    }
    
    // Send permanent log to logging channel with enhanced format
    try {
      const guild = interaction.guild;
      const logChannel = guild.channels.cache.get(logChannelId);
      
      if (logChannel) {
        // Create a comprehensive log embed for permanent storage
        const permanentLogEmbed = new EmbedBuilder()
          .setTitle('🔒 Ticket Closure Log')
          .setDescription(`Channel **${channelName}** was closed by **${member.user.tag}**`)
          .setColor(0xFF4444)
          .addFields(
            { name: '📋 Ticket Type', value: ticketSubType || ticketType || 'Unknown', inline: true },
            { name: '👤 Creator', value: ticketCreator ? `${ticketCreator}${ticketCreatorId ? ` (${ticketCreatorId})` : ''}` : 'Unknown', inline: true },
            { name: '🏷️ Claimed By', value: claimedBy ? `${claimedBy}${claimedById ? ` (${claimedById})` : ''}` : 'Not claimed', inline: true },
            { name: '🔐 Closed By', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '🆔 Channel ID', value: channel.id, inline: true },
            { name: '⏰ Closure Time', value: `<t:${Math.floor(closureTime / 1000)}:F>`, inline: true },
            { name: '💬 Total Messages', value: messageCount.toString(), inline: true }
          )
          .setTimestamp()
          .setFooter({ 
            text: `Ticket ID: ${channel.id} • Closed at ${new Date().toLocaleString()}`,
            iconURL: member.user.displayAvatarURL()
          });
        
        if (creationTime) {
          permanentLogEmbed.addFields({ 
            name: '📅 Created At', 
            value: `<t:${Math.floor(creationTime / 1000)}:F>`, 
            inline: true 
          });
        }
        
        if (duration) {
          const hours = Math.floor(duration / (1000 * 60 * 60));
          const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
          permanentLogEmbed.addFields({ 
            name: '⏱️ Ticket Duration', 
            value: hours > 0 ? `${hours} hours ${minutes} minutes` : `${minutes} minutes`, 
            inline: true 
          });
        }
        
        if (ticketInfo && ticketInfo !== 'No details available') {
          // Truncate ticket info if too long to prevent embed limits
          const truncatedInfo = ticketInfo.length > 1000 ? ticketInfo.substring(0, 997) + '...' : ticketInfo;
          permanentLogEmbed.addFields({ 
            name: '📝 Original Request Details', 
            value: truncatedInfo, 
            inline: false 
          });
        }
        
        // Add participants list for reopen functionality
        if (channelParticipants.length > 0) {
          const participantsList = channelParticipants
            .map(p => `${p.displayName} (${p.id})`)
            .join('\n');
          permanentLogEmbed.addFields({
            name: '👥 Channel Participants',
            value: participantsList.length > 1000 ? 
              participantsList.substring(0, 997) + '...' : 
              participantsList,
            inline: false
          });
        }
        
        // Add conversation summary if there were messages
        if (messageCount > 5) {
          const recentMessages = Array.from(messages.values())
            .filter(msg => !msg.author.bot && msg.content.length > 0)
            .slice(0, 3)
            .reverse()
            .map(msg => `**${msg.author.username}:** ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`)
            .join('\n');
          
          if (recentMessages) {
            permanentLogEmbed.addFields({ 
              name: '💭 Recent Conversation', 
              value: recentMessages || 'No recent messages found', 
              inline: false 
            });
          }
        }

        // Send the log embed with reopen button (encode participants in button ID)
        const participantIds = channelParticipants.map(p => p.id).join(',');
        const reopenButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`reopen-ticket-${channel.id}-${ticketCreatorId || 'unknown'}-${Buffer.from(participantIds).toString('base64').substring(0, 50)}`)
            .setLabel('🔄 Reopen Ticket')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔄')
        );

        await logChannel.send({ 
          embeds: [permanentLogEmbed],
          components: [reopenButton]
        });
        console.log(`${ticketType} ticket closure logged to ${logChannelName} channel: ${logChannel.name}`);
      } else {
        console.warn(`Logging channel not found with ID: ${logChannelId}`);
      }
    } catch (logError) {
      console.error('Error sending to log channel:', logError);
    }
    
    // Send review request if there was a claimed carrier and a ticket creator
    if (claimedById && ticketCreatorId && ticketCreatorId !== 'unknown') {
      try {
        const reviewResult = await sendReviewRequest(
          interaction.client,
          ticketCreatorId,
          claimedById,
          claimedBy || 'Unknown Carrier',
          ticketSubType || ticketType || 'Carry Service',
          channelName,
          channel // Pass the channel for fallback
        );
        
        if (reviewResult.success) {
          console.log(`✅ Review request delivered via ${reviewResult.method} to ${ticketCreator} for carrier ${claimedBy}`);
          
          // Add review status to close embed
          let reviewStatusText = '';
          if (reviewResult.method === 'dm') {
            reviewStatusText = '✅ Review request sent via DM';
          } else if (reviewResult.method === 'ticket-channel') {
            reviewStatusText = '📧 Review request sent in channel (DM failed)';
          } else {
            reviewStatusText = '⚠️ Review delivery failed - logged for staff follow-up';
          }
          
          closeEmbed.addFields({
            name: '📝 Review System',
            value: reviewStatusText,
            inline: false
          });
        } else {
          console.log(`❌ Review request failed: ${reviewResult.reason}`);
          closeEmbed.addFields({
            name: '📝 Review System',
            value: `⚠️ Review delivery failed: ${reviewResult.dmError || reviewResult.reason}`,
            inline: false
          });
        }
      } catch (reviewError) {
        console.error('Error sending review request:', reviewError);
        closeEmbed.addFields({
          name: '📝 Review System',
          value: '❌ Review system error - please contact admin',
          inline: false
        });
      }
    }
    
    // Wait a moment for the messages to be sent
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Edit the deferred reply with enhanced feedback
    await interaction.editReply({
      content: `✅ **Ticket Closed Successfully**\n` +
               `📝 Closure log saved to logging channel\n` +
               `🗑️ Channel will be deleted in 10 seconds\n` +
               `💾 All ticket information has been archived`
    });
    
    // Archive/delete the channel after 10 seconds
    setTimeout(async () => {
      try {
        await channel.delete('Ticket closed by staff - All information logged');
        console.log(`Channel ${channelName} deleted after closure by ${member.user.tag}`);
      } catch (error) {
        console.error('Error deleting channel:', error);
      }
    }, 10000);
    
  } catch (error) {
    console.error('Error closing ticket:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while closing the ticket.'
        });
      } else {
        await interaction.reply({
          content: '❌ An error occurred while closing the ticket.',
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
  }
}

async function handleTicketReopen(interaction) {
  try {
    // Check if user is staff
    const member = interaction.member;
    const isStaff = member.roles.cache.has(STAFF_ROLES.STAFF);
    
    if (!isStaff) {
      await interaction.reply({
        content: '❌ Only staff members can reopen tickets.',
        ephemeral: true
      });
      return;
    }

    // Parse the custom ID to get ticket information
    const customIdParts = interaction.customId.split('-');
    const originalChannelId = customIdParts[2];
    const originalCreatorId = customIdParts[3];
    const encodedParticipants = customIdParts[4] || '';

    // Defer the reply
    await interaction.deferReply({ ephemeral: true });

    // Get the original embed to extract ticket information
    const logEmbed = interaction.message.embeds[0];
    
    // Extract participant information from the log embed
    let originalParticipants = [];
    const participantsField = logEmbed.fields.find(field => field.name === '👥 Channel Participants');
    if (participantsField) {
      // Parse participants from the field value: "DisplayName (userID)"
      const participantLines = participantsField.value.split('\n');
      for (const line of participantLines) {
        const match = line.match(/^(.+) \((\d+)\)$/);
        if (match) {
          originalParticipants.push({
            displayName: match[1],
            id: match[2]
          });
        }
      }
    }
    
    // Fallback: try to decode from button ID if embed parsing fails
    if (originalParticipants.length === 0 && encodedParticipants) {
      try {
        const decodedIds = Buffer.from(encodedParticipants, 'base64').toString();
        const participantIds = decodedIds.split(',').filter(id => id.length > 0);
        for (const id of participantIds) {
          try {
            const user = await interaction.client.users.fetch(id);
            originalParticipants.push({
              displayName: user.displayName || user.username,
              id: id
            });
          } catch (err) {
            console.log(`Could not fetch participant ${id}:`, err.message);
          }
        }
      } catch (err) {
        console.log('Could not decode participants from button ID:', err.message);
      }
    }
    
    // Extract information from the log embed
    let ticketType = 'Unknown';
    let originalChannelName = 'ticket-reopened';
    let ticketCreator = 'Unknown';
    
    // Parse embed fields to get ticket information
    for (const field of logEmbed.fields) {
      if (field.name === '📋 Ticket Type') {
        ticketType = field.value;
      } else if (field.name === '👤 Creator') {
        // Extract username from "username (id)" format
        const creatorMatch = field.value.match(/^([^(]+)/);
        if (creatorMatch) {
          ticketCreator = creatorMatch[1].trim();
        }
      }
    }

    // Extract original channel name from embed description
    const descriptionMatch = logEmbed.description.match(/Channel \*\*([^*]+)\*\*/);
    if (descriptionMatch) {
      originalChannelName = descriptionMatch[1];
    }

    // Create new ticket channel with similar name but marked as reopened
    const guild = interaction.guild;
    const newChannelName = `${originalChannelName}-reopened`;
    
    const newChannel = await guild.channels.create({
      name: newChannelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['ViewChannel'],
        },
        {
          id: interaction.client.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages'],
        },
        // Add staff permissions
        {
          id: STAFF_ROLES.STAFF,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages'],
        }
      ]
    });

    // Add all original participants to the reopened channel
    let addedParticipants = [];
    let failedParticipants = [];
    
    for (const participant of originalParticipants) {
      try {
        await newChannel.permissionOverwrites.create(participant.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });
        addedParticipants.push(participant);
        console.log(`Added participant ${participant.displayName} (${participant.id}) to reopened ticket`);
      } catch (err) {
        console.log(`Could not add participant ${participant.displayName} (${participant.id}):`, err.message);
        failedParticipants.push(participant);
      }
    }

    // Fallback: Add original creator if not already added and if we have their ID
    if (originalCreatorId && originalCreatorId !== 'unknown' && 
        !addedParticipants.some(p => p.id === originalCreatorId)) {
      try {
        await newChannel.permissionOverwrites.create(originalCreatorId, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });
        console.log(`Added original creator ${originalCreatorId} to reopened ticket`);
      } catch (err) {
        console.log('Could not add original creator to reopened channel:', err.message);
      }
    }

    // Create reopened ticket embed
    const reopenEmbed = new EmbedBuilder()
      .setTitle('🔄 Ticket Reopened')
      .setDescription(`This ticket was reopened by ${member.user.tag}`)
      .setColor(0x00FF00)
      .addFields(
        { name: '📋 Original Ticket Type', value: ticketType, inline: true },
        { name: '👤 Original Creator', value: originalCreatorId && originalCreatorId !== 'unknown' ? `${ticketCreator} (<@${originalCreatorId}>)` : ticketCreator, inline: true },
        { name: '🔄 Reopened By', value: `${member.user.tag} (<@${member.user.id}>)`, inline: true },
        { name: '📅 Reopened At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: '🆔 Original Channel ID', value: originalChannelId, inline: true },
        { name: '🆔 New Channel ID', value: newChannel.id, inline: true }
      )
      .setTimestamp();
    
    // Add participant restoration info
    if (addedParticipants.length > 0) {
      const participantList = addedParticipants
        .map(p => `<@${p.id}>`)
        .join(', ');
      reopenEmbed.addFields({
        name: '👥 Restored Participants',
        value: `${addedParticipants.length} original participants restored:\n${participantList}`,
        inline: false
      });
    }
    
    if (failedParticipants.length > 0) {
      const failedList = failedParticipants
        .map(p => p.displayName)
        .join(', ');
      reopenEmbed.addFields({
        name: '⚠️ Could Not Restore',
        value: `${failedParticipants.length} participants could not be restored: ${failedList}`,
        inline: false
      });
    }

    // Add ticket management buttons
    const ticketButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('claim-ticket-1-0')
        .setLabel('🏷️ Claim')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('close-ticket')
        .setLabel('🔒 Close')
        .setStyle(ButtonStyle.Danger)
    );

    // Send the reopen notification to the new channel
    await newChannel.send({ 
      embeds: [reopenEmbed], 
      components: [ticketButtons]
    });

    // Notify all restored participants
    if (addedParticipants.length > 0) {
      const participantMentions = addedParticipants.map(p => `<@${p.id}>`).join(' ');
      await newChannel.send(`📢 ${participantMentions} Your ticket has been reopened by staff. Please provide any additional information needed.`);
    } else if (originalCreatorId && originalCreatorId !== 'unknown') {
      // Fallback to just original creator if no participants were restored
      try {
        await newChannel.send(`📢 <@${originalCreatorId}> Your ticket has been reopened by staff. Please provide any additional information needed.`);
      } catch (err) {
        console.log('Could not notify original creator:', err.message);
      }
    }

    // Disable the reopen button in the log message
    const disabledButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket-reopened')
        .setLabel('✅ Reopened')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true)
    );

    await interaction.message.edit({
      embeds: interaction.message.embeds,
      components: [disabledButton]
    });

    // Reply to the staff member
    const successMessage = [
      `✅ **Ticket Reopened Successfully**`,
      `🔗 New ticket channel: ${newChannel}`,
      `📋 Original ticket type: ${ticketType}`,
      `👥 Restored ${addedParticipants.length} original participants`,
      failedParticipants.length > 0 ? `⚠️ Could not restore ${failedParticipants.length} participants` : '',
      `👤 Original creator: ${originalCreatorId && originalCreatorId !== 'unknown' ? `<@${originalCreatorId}>` : ticketCreator}`
    ].filter(Boolean).join('\n');

    await interaction.editReply({
      content: successMessage
    });

    console.log(`Ticket reopened by ${member.user.tag}: ${newChannelName} (${newChannel.id})`);

  } catch (error) {
    console.error('Error reopening ticket:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while reopening the ticket.'
        });
      } else {
        await interaction.reply({
          content: '❌ An error occurred while reopening the ticket.',
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
  }
}

// Handle select menu interactions for embed command
export async function handleSelectMenuInteraction(interaction) {
  try {
    if (interaction.customId === 'embed_category_select') {
      const selectedCategory = interaction.values[0];
      
      // Import the embed command to reuse its logic
      const embedCommand = await import('../commands/embed.js');
      
      // Create a new interaction object with the selected category
      const mockInteraction = {
        ...interaction,
        options: {
          getString: (name) => name === 'category' ? selectedCategory : null
        }
      };
      
      await embedCommand.default.execute(mockInteraction);
    }
    else if (interaction.customId.startsWith('embed_subcategory_select_')) {
      const selectedSubcategory = interaction.values[0];
      
      // Import the embed command to reuse its logic
      const embedCommand = await import('../commands/embed.js');
      
      // Create a new interaction object with the selected subcategory
      const mockInteraction = {
        ...interaction,
        options: {
          getString: (name) => name === 'subcategory' ? selectedSubcategory : null
        }
      };
      
      await embedCommand.default.execute(mockInteraction);
    }
  } catch (error) {
    console.error('Error handling select menu interaction:', error);
    await interaction.reply({
      content: '❌ An error occurred while processing your selection.',
      ephemeral: true
    });
  }
}

// Handle simple review button interactions
async function handleSimpleReviewInteraction(interaction) {
  try {
    const customId = interaction.customId;
    const parts = customId.split('-');
    const rating = parts[2]; // excellent, good, average, poor
    const carrierId = parts[3];
    const customerId = parts[4];
    const timestamp = parts[5];

    // Verify the user clicking is the customer or allow anyone if customer ID is unknown
    if (customerId !== 'unknown' && interaction.user.id !== customerId) {
      await interaction.reply({
        content: '❌ Only the customer can submit this review.',
        ephemeral: true
      });
      return;
    }

    // Get carrier information
    let carrierName = 'Unknown Carrier';
    try {
      const carrier = await interaction.client.users.fetch(carrierId);
      carrierName = carrier.username;
    } catch (err) {
      console.log('Could not fetch carrier:', err.message);
    }

    // Determine service type from channel name
    const channelName = interaction.channel.name;
    let serviceType = 'Carry Service';
    if (channelName.includes('eman') || channelName.includes('bruiser') || channelName.includes('sepulture')) {
      serviceType = 'Slayer Carry';
    } else if (channelName.includes('blaze')) {
      serviceType = 'Blaze Carry';
    } else if (channelName.includes('dungeon') || channelName.includes('f4') || channelName.includes('f5') || channelName.includes('f6') || channelName.includes('f7')) {
      serviceType = 'Dungeon Carry';
    } else if (channelName.includes('mastermode') || channelName.includes('m1') || channelName.includes('m2') || channelName.includes('m3') || channelName.includes('m4') || channelName.includes('m5') || channelName.includes('m6') || channelName.includes('m7')) {
      serviceType = 'Mastermode Carry';
    } else if (channelName.includes('crimson') || channelName.includes('ashfang') || channelName.includes('kuudra')) {
      serviceType = 'Crimson Carry';
    }

    // Save the review
    const reviewData = {
      carrierId: carrierId,
      carrierName: carrierName,
      customerId: interaction.user.id,
      customerName: interaction.user.username,
      rating: rating,
      serviceType: serviceType,
      channelName: channelName,
      guildId: interaction.guild.id
    };

    const saveResult = saveReview(reviewData);

    if (saveResult.success) {
      // Create confirmation embed
      const ratingEmojis = {
        excellent: '⭐⭐⭐⭐⭐',
        good: '⭐⭐⭐⭐',
        average: '⭐⭐⭐',
        poor: '⭐⭐'
      };

      const ratingTexts = {
        excellent: 'Excellent',
        good: 'Good', 
        average: 'Average',
        poor: 'Poor'
      };

      const colors = {
        excellent: 'Green',
        good: 'Blue',
        average: 'Yellow',
        poor: 'Red'
      };

      const confirmEmbed = new EmbedBuilder()
        .setTitle('✅ Review Submitted!')
        .setDescription(`Thank you for rating your **${serviceType}** experience!`)
        .setColor(colors[rating])
        .addFields(
          { name: '👤 Carrier', value: carrierName, inline: true },
          { name: '⭐ Rating', value: `${ratingEmojis[rating]} ${ratingTexts[rating]}`, inline: true },
          { name: '🎮 Service', value: serviceType, inline: true }
        )
        .setFooter({ text: 'Your feedback helps us improve our services!' })
        .setTimestamp();

      // Disable all buttons in the original message
      const disabledButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('review-submitted')
          .setLabel('✅ Review Submitted')
          .setStyle(ButtonStyle.Success)
          .setDisabled(true)
      );

      // Update the original message
      await interaction.update({
        embeds: [confirmEmbed],
        components: [disabledButtons]
      });

      // Send notification to carrier (if excellent or good)
      if (rating === 'excellent' || rating === 'good') {
        try {
          const carrier = await interaction.client.users.fetch(carrierId);
          await carrier.send({
            embeds: [new EmbedBuilder()
              .setTitle('🎉 Great Review Received!')
              .setDescription(`You received a **${ratingTexts[rating]}** review from ${interaction.user.username}!`)
              .setColor(colors[rating])
              .addFields(
                { name: '⭐ Rating', value: `${ratingEmojis[rating]} ${ratingTexts[rating]}`, inline: true },
                { name: '🎮 Service', value: serviceType, inline: true }
              )
              .setFooter({ text: 'Keep up the excellent work!' })
            ]
          });
        } catch (dmError) {
          console.log(`Could not send review notification to carrier ${carrierName}:`, dmError.message);
        }
      }

      console.log(`Review submitted: ${interaction.user.username} rated ${carrierName} as ${rating} for ${serviceType}`);

    } else {
      // Handle different error types
      let errorMessage = '❌ Failed to save your review. Please try again or contact an administrator.';
      
      if (saveResult.error === 'SELF_REVIEW') {
        errorMessage = '❌ You cannot review yourself! Only customers can submit reviews for carriers.';
      } else if (saveResult.error === 'COOLDOWN') {
        const hours = Math.floor(saveResult.timeRemaining / 60);
        const minutes = saveResult.timeRemaining % 60;
        const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        errorMessage = `❌ You are on cooldown and cannot submit another review for **${timeText}**.\n\n*Reviews are limited to once every 2 hours to prevent spam.*`;
      }
      
      await interaction.reply({
        content: errorMessage,
        ephemeral: true
      });
    }

  } catch (error) {
    console.error('Error handling simple review interaction:', error);
    await interaction.reply({
      content: '❌ An error occurred while processing your review.',
      ephemeral: true
    });
  }
}
