import { STAFF_ROLES } from '../config.js';

export const hasTicketAccess = async (interaction, ticketChannel) => {
  const member = interaction.member;
  const permissions = ticketChannel.permissionsFor(member);
  return permissions.has('ViewChannel');
};

export const isStaff = (member) => {
  return member.roles.cache.has(STAFF_ROLES.STAFF) || 
         member.roles.cache.has(STAFF_ROLES.ADMIN);
};

export const isAdmin = (member) => {
  return member.roles.cache.has(STAFF_ROLES.ADMIN);
};

export const hasCarrierRole = (member, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  
  return requiredRoles.some(roleId => {
    return roleId && member.roles.cache.has(roleId);
  }) || isStaff(member);
};

export const canManageTicket = (member, ticketOwnerId) => {
  return member.id === ticketOwnerId || isStaff(member);
};

export const canForceAction = (member) => {
  return isAdmin(member);
};
