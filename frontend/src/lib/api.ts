import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

class ApiClient {
  private client: AxiosInstance

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
    })
  }

  // Reminders
  async getReminders(skip = 0, limit = 100) {
    const response = await this.client.get('/reminders', {
      params: { skip, limit },
    })
    return response.data
  }

  async getReminder(id: number) {
    const response = await this.client.get(`/reminders/${id}`)
    return response.data
  }

  async getActiveReminders() {
    const response = await this.client.get('/reminders/active/all')
    return response.data
  }

  async getRemindersWithMedicine(skip = 0, limit = 100) {
    const response = await this.client.get('/reminders/with-medicine', {
      params: { skip, limit },
    })
    return response.data
  }

  async getActiveRemindersWithMedicine() {
    const response = await this.client.get('/reminders/active/with-medicine')
    return response.data
  }

  async createReminder(data: unknown) {
    const response = await this.client.post('/reminders', data)
    return response.data
  }

  async updateReminder(id: number, data: unknown) {
    const response = await this.client.put(`/reminders/${id}`, data)
    return response.data
  }

  async patchReminder(id: number, data: unknown) {
    const response = await this.client.patch(`/reminders/${id}`, data)
    return response.data
  }

  async deleteReminder(id: number) {
    await this.client.delete(`/reminders/${id}`)
  }

  // Reminder Instances
  async getReminderInstances(skip = 0, limit = 100) {
    const response = await this.client.get('/reminder-instances', {
      params: { skip, limit },
    })
    return response.data
  }

  async getReminderInstance(id: number) {
    const response = await this.client.get(`/reminder-instances/${id}`)
    return response.data
  }

  async getReminderInstancesByReminder(reminderId: number) {
    const response = await this.client.get(`/reminder-instances/reminder/${reminderId}`)
    return response.data
  }

  async getReminderInstancesByReminderWithMedicine(reminderId: number, limit?: number) {
    const response = await this.client.get(`/reminder-instances/reminder/${reminderId}/with-medicine`, {
      params: limit ? { limit } : {},
    })
    return response.data
  }

  async getPendingReminderInstances() {
    const response = await this.client.get('/reminder-instances/pending/all')
    return response.data
  }

  async getReminderInstancesByStatus(status: string) {
    const response = await this.client.get(`/reminder-instances/status/${status}`)
    return response.data
  }

  async getReminderInstancesWithMedicine(skip = 0, limit = 100) {
    const response = await this.client.get('/reminder-instances/with-medicine', {
      params: { skip, limit },
    })
    return response.data
  }

  async getTodayReminderInstancesWithMedicine() {
    const response = await this.client.get('/reminder-instances/today/with-medicine')
    return response.data
  }

  async getMonthReminderInstancesWithMedicine(year: number, month: number) {
    const response = await this.client.get(`/reminder-instances/month/${year}/${month}/with-medicine`)
    return response.data
  }

  async updateReminderInstance(id: number, data: unknown) {
    const response = await this.client.put(`/reminder-instances/${id}`, data)
    return response.data
  }

  async patchReminderInstance(id: number, data: unknown) {
    const response = await this.client.patch(`/reminder-instances/${id}`, data)
    return response.data
  }

  // Medicines
  async getMedicines(skip = 0, limit = 100) {
    const response = await this.client.get('/medicines', {
      params: { skip, limit },
    })
    return response.data
  }

  async getMedicine(id: number) {
    const response = await this.client.get(`/medicines/${id}`)
    return response.data
  }

  async getMedicinesByElderly(elderlyId: number) {
    const response = await this.client.get(`/medicines/elderly/${elderlyId}`)
    return response.data
  }

  async createMedicine(data: unknown) {
    const response = await this.client.post('/medicines', data)
    return response.data
  }

  async updateMedicine(id: number, data: unknown) {
    const response = await this.client.put(`/medicines/${id}`, data)
    return response.data
  }

  async patchMedicine(id: number, data: unknown) {
    const response = await this.client.patch(`/medicines/${id}`, data)
    return response.data
  }

  async deleteMedicine(id: number) {
    await this.client.delete(`/medicines/${id}`)
  }

  // Elderly Profiles
  async getElderlyProfiles(skip = 0, limit = 100) {
    const response = await this.client.get('/elderly-profiles', {
      params: { skip, limit },
    })
    return response.data
  }

  async getElderlyProfile(id: number) {
    const response = await this.client.get(`/elderly-profiles/${id}`)
    return response.data
  }
}

export const api = new ApiClient(API_BASE_URL)
