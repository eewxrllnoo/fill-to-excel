// Service - Handles Supabase database operations
export class SupabaseService {
    constructor(url, key) {
        this.supabase = window.supabase.createClient(url, key);
        this.tableName = 'fso_expense_reports';
    }

    async saveReport(reportData) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert([reportData])
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error saving report:', error);
            return { success: false, error: error.message };
        }
    }

    async getAllReports() {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching reports:', error);
            return { success: false, error: error.message };
        }
    }

    async getReportsByEngineer(engineerName) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('field_engineer_name', engineerName)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching reports:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteReport(id) {
        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting report:', error);
            return { success: false, error: error.message };
        }
    }

    subscribeToChanges(callback) {
        return this.supabase
            .channel('fso_reports_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: this.tableName }, 
                () => {
                    callback();
                }
            )
            .subscribe();
    }
}