'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Competitor {
  id: string;
  name: string;
  website_url: string | null;
  created_at: string;
}

export default function Competitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website_url: ''
  });

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      const response = await fetch('/api/scraping/competitors');
      if (!response.ok) throw new Error('Failed to fetch competitors');
      const data = await response.json();
      setCompetitors(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load competitors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/scraping/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error('Failed to add competitor');
      }
      
      const data = await response.json();
      setCompetitors(prev => [data, ...prev]);
      setFormData({ name: '', website_url: '' });
      setShowAddForm(false);
      toast.success('Competitor added successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add competitor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) return;
    
    try {
      const response = await fetch(`/api/scraping/competitors?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete competitor');
      
      setCompetitors(prev => prev.filter(comp => comp.id !== id));
      toast.success('Competitor deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete competitor');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading competitors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Competitors</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          Add Competitor
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 p-4 rounded-lg space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 rounded-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Website URL</label>
            <input
              type="url"
              value={formData.website_url}
              onChange={e => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 rounded-lg"
              placeholder="https://"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {competitors.map(competitor => (
          <div 
            key={competitor.id}
            className="flex justify-between items-center bg-white/5 p-4 rounded-lg"
          >
            <div>
              <h3 className="font-medium">{competitor.name}</h3>
              {competitor.website_url && (
                <a 
                  href={competitor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline"
                >
                  {competitor.website_url}
                </a>
              )}
            </div>
            <button
              onClick={() => handleDelete(competitor.id)}
              className="p-2 text-red-400 hover:text-red-500"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 