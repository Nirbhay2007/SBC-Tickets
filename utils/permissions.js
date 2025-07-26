import { STAFF_ROLES } from '../config.js';

export const hasTicketAccess = async (interaction, ticketChannel) => {
  const member = interaction.member;
  const permissions = ticketChannel.permissionsFor(member);
  return permissions.has('ViewChannel');
};

export const isStaff = (member) => {
  return member.roles.cache.has(STAFF_ROLES.STAFF) || 
         member.roles.cache.has(STAFF_ROLES.ADMIN) ||
         member.roles.cache.has(STAFF_ROLES.MANAGER) ||
         member.roles.cache.has(STAFF_ROLES.CO_OWNER) ||
         member.roles.cache.has(STAFF_ROLES.OWNER);
};

export const isAdmin = (member) => {
  return member.roles.cache.has(STAFF_ROLES.ADMIN) ||
         member.roles.cache.has(STAFF_ROLES.MANAGER) ||
         member.roles.cache.has(STAFF_ROLES.CO_OWNER) ||
         member.roles.cache.has(STAFF_ROLES.OWNER);
};

export const isManager = (member) => {
  return member.roles.cache.has(STAFF_ROLES.MANAGER) ||
         member.roles.cache.has(STAFF_ROLES.CO_OWNER) ||
         member.roles.cache.has(STAFF_ROLES.OWNER);
};

export const isCoOwner = (member) => {
  return member.roles.cache.has(STAFF_ROLES.CO_OWNER) ||
         member.roles.cache.has(STAFF_ROLES.OWNER);
};

export const isOwner = (member) => {
  return member.roles.cache.has(STAFF_ROLES.OWNER);
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
