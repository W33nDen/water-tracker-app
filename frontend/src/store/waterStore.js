import { create } from 'zustand';
import { getTodayWater, addWater, updateWater, deleteWater } from '../services/waterApi';

/**
 * Water tracking store (issue #10).
 *
 * State:
 *   records    — today's water records [{ id, volume, time }]
 *   percentage — % of daily norm achieved (raw, not capped at 100)
 *   isLoading  — true while fetching
 *   error      — string | null
 */
const useWaterStore = create((set, get) => ({
  records: [],
  percentage: 0,
  isLoading: false,
  error: null,

  /**
   * Fetches today's records + percentage from the backend.
   */
  fetchToday: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const { records, percentage } = await getTodayWater();
      set({ records, percentage });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to load water data';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Adds a new water record and re-fetches today's summary.
   * @param {{ volume: number, time: string }} payload
   */
  add: async (payload) => {
    await addWater(payload);
    await get().fetchToday();
  },

  /**
   * Updates a water record and re-fetches today's summary.
   * @param {string} id
   * @param {{ volume?: number, time?: string }} payload
   */
  update: async (id, payload) => {
    await updateWater(id, payload);
    await get().fetchToday();
  },

  /**
   * Deletes a water record and re-fetches today's summary.
   * @param {string} id
   */
  remove: async (id) => {
    await deleteWater(id);
    await get().fetchToday();
  },
}));

export default useWaterStore;
