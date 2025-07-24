import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export async function logTicket(data) {
  try {
    const { error } = await supabase.from('tickets').insert(data);
    if (error) throw error;
  } catch (error) {
    console.error('Error logging ticket:', error);
    throw new Error('Failed to log ticket.');
  }
}

export async function updateTicket(id, data) {
  try {
    const { error } = await supabase.from('tickets').update(data).eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw new Error('Failed to update ticket.');
  }
}

export async function getStats() {
  try {
    const { data, error } = await supabase.rpc('get_ticket_stats');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    throw new Error('Failed to fetch ticket stats.');
  }
}
