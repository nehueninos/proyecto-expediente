import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class ApiService {
  async login({ username, password }) {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: `${username}@expedientes.app`,
      password,
    });

    if (error) throw error;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    return { user: profile };
  }

  async register({ username, password, name, area }) {
    const email = `${username}@expedientes.app`;

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        username,
        name,
        area
      }])
      .select()
      .single();

    if (profileError) throw profileError;

    return { user: profile };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getExpedientes(filters = {}) {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('No autenticado');

    const { data: profile } = await supabase
      .from('users')
      .select('area')
      .eq('id', currentUser.user.id)
      .single();

    let query = supabase
      .from('expedientes')
      .select(`
        *,
        user:users!expedientes_user_id_fkey(username, name, area),
        creator:users!expedientes_created_by_fkey(username, name)
      `)
      .eq('area', profile.area)
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`numero.ilike.%${filters.search}%,titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`);
    }

    if (filters.estado && filters.estado !== 'all') {
      query = query.eq('estado', filters.estado);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(exp => ({
      _id: exp.id,
      ...exp
    }));
  }

  async createExpediente(expediente) {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('No autenticado');

    const { data: profile } = await supabase
      .from('users')
      .select('area')
      .eq('id', currentUser.user.id)
      .single();

    const { data, error } = await supabase
      .from('expedientes')
      .insert([{
        numero: expediente.numero,
        titulo: expediente.titulo,
        descripcion: expediente.descripcion,
        area: profile.area,
        estado: expediente.estado,
        prioridad: expediente.prioridad,
        user_id: currentUser.user.id,
        created_by: currentUser.user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createTransferRequest(expedienteId, toUserId, message = '') {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('No autenticado');

    const { data: toUserProfile } = await supabase
      .from('users')
      .select('area')
      .eq('id', toUserId)
      .single();

    const { data, error } = await supabase
      .from('transfer_notifications')
      .insert([{
        expediente_id: expedienteId,
        from_user_id: currentUser.user.id,
        to_user_id: toUserId,
        to_area: toUserProfile.area,
        message,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTransferNotifications() {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('No autenticado');

    const { data, error } = await supabase
      .from('transfer_notifications')
      .select(`
        *,
        expediente:expedientes(*),
        from_user:users!transfer_notifications_from_user_id_fkey(username, name, area)
      `)
      .eq('to_user_id', currentUser.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async acceptTransferRequest(notificationId) {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('No autenticado');

    const { data: notification } = await supabase
      .from('transfer_notifications')
      .select('*, expediente:expedientes(*)')
      .eq('id', notificationId)
      .single();

    const { error: updateNotificationError } = await supabase
      .from('transfer_notifications')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (updateNotificationError) throw updateNotificationError;

    const { data: toUserProfile } = await supabase
      .from('users')
      .select('area')
      .eq('id', currentUser.user.id)
      .single();

    const { error: updateExpedienteError } = await supabase
      .from('expedientes')
      .update({
        user_id: currentUser.user.id,
        area: toUserProfile.area,
        updated_at: new Date().toISOString()
      })
      .eq('id', notification.expediente_id);

    if (updateExpedienteError) throw updateExpedienteError;

    const { error: historyError } = await supabase
      .from('expediente_history')
      .insert([{
        expediente_id: notification.expediente_id,
        from_area: notification.expediente.area,
        to_area: notification.to_area,
        from_user_id: notification.from_user_id,
        to_user_id: currentUser.user.id,
        observaciones: notification.message,
      }]);

    if (historyError) throw historyError;

    return { success: true };
  }

  async rejectTransferRequest(notificationId) {
    const { error } = await supabase
      .from('transfer_notifications')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  }

  async getUsersByArea(area) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, name, area')
      .eq('area', area)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getExpedienteHistory(expedienteId) {
    const { data, error } = await supabase
      .from('expediente_history')
      .select(`
        *,
        from_user:users!expediente_history_from_user_id_fkey(username, name),
        to_user:users!expediente_history_to_user_id_fkey(username, name)
      `)
      .eq('expediente_id', expedienteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

const apiService = new ApiService();
export default apiService;
