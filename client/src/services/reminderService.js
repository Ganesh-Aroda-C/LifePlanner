import api from './api';

export const reminderService = {
  async getReminders(params = {}) {
    const response = await api.get('/reminders', { params });
    return response.data;
  },

  async createReminder(reminderData) {
    const response = await api.post('/reminders', reminderData);
    return response.data;
  },

  async updateReminder(id, reminderData) {
    const response = await api.put(`/reminders/${id}`, reminderData);
    return response.data;
  },

  async acknowledgeReminder(id) {
    const response = await api.patch(`/reminders/${id}/acknowledge`);
    return response.data;
  },

  async snoozeReminder(id, minutes = 15) {
    const response = await api.patch(`/reminders/${id}/snooze`, { minutes });
    return response.data;
  },

  async deleteReminder(id) {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  },
};
