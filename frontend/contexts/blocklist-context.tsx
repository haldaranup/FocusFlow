"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { blocklistApi } from '../services/api';

export interface BlocklistItem {
  id: string;
  type: 'website' | 'application';
  name: string;
  identifier: string;
  isActive: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlocklistItemDto {
  type: 'website' | 'application';
  name: string;
  identifier: string;
  isActive?: boolean;
  category?: string;
}

interface BlocklistContextType {
  items: BlocklistItem[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  createItem: (data: CreateBlocklistItemDto) => Promise<BlocklistItem>;
  updateItem: (id: string, data: Partial<CreateBlocklistItemDto>) => Promise<BlocklistItem>;
  deleteItem: (id: string) => Promise<void>;
  toggleItem: (id: string) => Promise<BlocklistItem>;
  getActiveItems: () => BlocklistItem[];
  getItemsByCategory: (category?: string) => BlocklistItem[];
}

const BlocklistContext = createContext<BlocklistContextType | undefined>(undefined);

export const BlocklistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<BlocklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all blocklist items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blocklistApi.getAll();
      setItems(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch blocklist items');
    } finally {
      setLoading(false);
    }
  };

  // Create a new blocklist item
  const createItem = async (data: CreateBlocklistItemDto) => {
    try {
      setError(null);
      const response = await blocklistApi.create(data);
      setItems(prev => [response.data, ...prev]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create blocklist item');
      throw err;
    }
  };

  // Update an existing blocklist item
  const updateItem = async (id: string, data: Partial<CreateBlocklistItemDto>) => {
    try {
      setError(null);
      const response = await blocklistApi.update(id, data);
      setItems(prev => prev.map(item => 
        item.id === id ? response.data : item
      ));
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update blocklist item');
      throw err;
    }
  };

  // Delete a blocklist item
  const deleteItem = async (id: string) => {
    try {
      setError(null);
      await blocklistApi.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete blocklist item');
      throw err;
    }
  };

  // Toggle active status of an item
  const toggleItem = async (id: string) => {
    try {
      setError(null);
      const response = await blocklistApi.toggle(id);
      setItems(prev => prev.map(item => 
        item.id === id ? response.data : item
      ));
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle blocklist item');
      throw err;
    }
  };

  // Get active items only
  const getActiveItems = () => {
    return items.filter(item => item.isActive);
  };

  // Get items by category
  const getItemsByCategory = (category?: string) => {
    if (!category) return items.filter(item => !item.category);
    return items.filter(item => item.category === category);
  };

  // Initialize data
  useEffect(() => {
    fetchItems();
  }, []);

  const value = {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    toggleItem,
    getActiveItems,
    getItemsByCategory,
  };

  return (
    <BlocklistContext.Provider value={value}>
      {children}
    </BlocklistContext.Provider>
  );
};

export const useBlocklist = () => {
  const context = useContext(BlocklistContext);
  if (context === undefined) {
    throw new Error('useBlocklist must be used within a BlocklistProvider');
  }
  return context;
}; 