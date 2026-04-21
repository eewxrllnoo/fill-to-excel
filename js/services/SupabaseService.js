// js/services/SupabaseService.js
export class SupabaseService {
    constructor(url, anonKey) {
        this.url = url;
        this.anonKey = anonKey;
        this.supabase = null;
        this.isConnected = false;
    }

    async init() {
        try {
            this.supabase = window.supabase.createClient(this.url, this.anonKey);
            const { error } = await this.supabase
                .from('fso_reports')
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                console.warn('Supabase connection warning:', error.message);
                this.isConnected = false;
                return { success: false, error: error.message };
            }
            
            this.isConnected = true;
            return { success: true };
        } catch (error) {
            console.error('Supabase init error:', error);
            this.isConnected = false;
            return { success: false, error: error.message };
        }
    }

    async saveReport(reportData) {
        if (!this.isConnected) {
            return { success: false, error: 'Not connected to Supabase' };
        }

        try {
            const { data, error } = await this.supabase
                .from('fso_reports')
                .insert([reportData])
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Save error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateReport(id, updateData) {
        if (!this.isConnected) {
            return { success: false, error: 'Not connected to Supabase' };
        }

        try {
            const { data, error } = await this.supabase
                .from('fso_reports')
                .update(updateData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Update error:', error);
            return { success: false, error: error.message };
        }
    }

    async getAllReports() {
        if (!this.isConnected) {
            return { success: false, error: 'Not connected to Supabase' };
        }

        try {
            const { data, error } = await this.supabase
                .from('fso_reports')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Get all error:', error);
            return { success: false, error: error.message };
        }
    }

    async getReportById(id) {
        if (!this.isConnected) {
            return { success: false, error: 'Not connected to Supabase' };
        }

        try {
            const { data, error } = await this.supabase
                .from('fso_reports')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get by ID error:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteReport(id) {
        if (!this.isConnected) {
            return { success: false, error: 'Not connected to Supabase' };
        }
        
        try {
            const { error } = await this.supabase
                .from('fso_reports')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Delete error:', error);
            return { success: false, error: error.message };
        }
    }
}