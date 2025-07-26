import { SlashCommandBuilder } from 'discord.js';
import { isCoOwner, isOwner } from '../utils/permissions.js';
import { STAFF_ROLES, CARRIER_ROLES } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Add roles to users (Co-Owner/Owner only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give the role to')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true)),

  async execute(interaction) {
    try {
      // Check if user has co-owner or owner permissions
      if (!isCoOwner(interaction.member) && !isOwner(interaction.member)) {
        await interaction.reply({
          content: '❌ **Access Denied** - This command requires Co-Owner or Owner permissions.',
          ephemeral: true
        });
        return;
      }

      const targetUser = interaction.options.getUser('user');
      const roleToAdd = interaction.options.getRole('role');
      const member = await interaction.guild.members.fetch(targetUser.id);

      // Check if user already has the role
      if (member.roles.cache.has(roleToAdd.id)) {
        await interaction.reply({
          content: `❌ ${targetUser.username} already has the role ${roleToAdd.name}.`,
          ephemeral: true
        });
        return;
      }

      // Add the requested role
      await member.roles.add(roleToAdd);

      // Check if the role is a carrier role and auto-assign SBC Carrier role
      const carrierRoleIds = Object.values(CARRIER_ROLES).filter(id => id); // Filter out null/undefined values
      const sbcCarrierRoleId = STAFF_ROLES.SBC_CARRIER;

      let autoAssignedSBC = false;
      if (carrierRoleIds.includes(roleToAdd.id) && sbcCarrierRoleId) {
        // Check if user doesn't already have SBC Carrier role
        if (!member.roles.cache.has(sbcCarrierRoleId)) {
          await member.roles.add(sbcCarrierRoleId);
          autoAssignedSBC = true;
        }
      }

      // Build response message
      let responseMessage = `✅ Successfully added **${roleToAdd.name}** role to ${targetUser.username}.`;
      
      if (autoAssignedSBC) {
        responseMessage += `\n🎯 Also auto-assigned **SBC Carrier** role since this is a carrier role.`;
      }

      await interaction.reply({
        content: responseMessage,
        ephemeral: true
      });

      // Log the role assignment
      console.log(`Role assignment: ${interaction.user.username} gave ${roleToAdd.name} to ${targetUser.username}${autoAssignedSBC ? ' (+ SBC Carrier auto-assigned)' : ''}`);

    } catch (error) {
      console.error('Error in addrole command:', error);
      
      let errorMessage = 'An error occurred while adding the role.';
      if (error.code === 50013) {
        errorMessage = '❌ Bot lacks permission to assign this role. Make sure the bot\'s role is higher than the role you\'re trying to assign.';
      } else if (error.code === 10011) {
        errorMessage = '❌ Role not found.';
      } else if (error.code === 10013) {
        errorMessage = '❌ User not found.';
      }

      await interaction.reply({
        content: errorMessage,
        ephemeral: true
      });
    }
  },
};
