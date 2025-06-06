"use client"

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  Globe, 
  Shield, 
  Users, 
  Gamepad2, 
  ShoppingBag, 
  MessageCircle,
  Video,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Check,
  Zap
} from 'lucide-react';
import { useBlocklist } from '@/hooks/use-blocklist';
import { toast } from 'sonner';

const POPULAR_SITES = [
  { name: 'Facebook', url: 'facebook.com', category: 'Social Media', icon: Users },
  { name: 'Instagram', url: 'instagram.com', category: 'Social Media', icon: Users },
  { name: 'Twitter/X', url: 'twitter.com', category: 'Social Media', icon: MessageCircle },
  { name: 'WhatsApp', url: 'web.whatsapp.com', category: 'Social Media', icon: MessageCircle },
  { name: 'YouTube', url: 'youtube.com', category: 'Entertainment', icon: Video },
  { name: 'Netflix', url: 'netflix.com', category: 'Entertainment', icon: Video },
  { name: 'Amazon', url: 'amazon.com', category: 'Shopping', icon: ShoppingBag },
  { name: 'Twitch', url: 'twitch.tv', category: 'Entertainment', icon: Gamepad2 },
];

const CATEGORIES = [
  { value: 'Social Media', label: 'Social Media', icon: Users, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'Entertainment', label: 'Entertainment', icon: Video, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'Shopping', label: 'Shopping', icon: ShoppingBag, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'Gaming', label: 'Gaming', icon: Gamepad2, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'News', label: 'News', icon: Globe, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'Other', label: 'Other', icon: Shield, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
];

interface BlocklistModalProps {
  children: React.ReactNode;
}

export function BlocklistModal({ children }: BlocklistModalProps) {
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    identifier: '',
    category: '',
    type: 'website' as 'website' | 'application'
  });
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'quick'>('list');

  const { 
    items, 
    loading, 
    error, 
    createItem, 
    deleteItem, 
    toggleItem,
    getItemsByCategory 
  } = useBlocklist();

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.identifier) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createItem({
        type: newItem.type,
        name: newItem.name,
        identifier: newItem.identifier,
        category: newItem.category || undefined,
        isActive: true
      });
      
      setNewItem({ name: '', identifier: '', category: '', type: 'website' });
      setActiveTab('list');
      toast.success(`${newItem.name} added to blocklist`);
    } catch (error) {
      toast.error('Failed to add item to blocklist');
    }
  };

  const handleQuickAdd = async (site: typeof POPULAR_SITES[0]) => {
    try {
      await createItem({
        type: 'website',
        name: site.name,
        identifier: site.url,
        category: site.category,
        isActive: true
      });
      
      toast.success(`${site.name} added to blocklist`);
    } catch (error) {
      toast.error(`Failed to add ${site.name}`);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    try {
      await deleteItem(id);
      toast.success(`${name} removed from blocklist`);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleToggleItem = async (id: string, name: string, currentState: boolean) => {
    try {
      await toggleItem(id);
      toast.success(`${name} ${currentState ? 'disabled' : 'enabled'}`);
    } catch (error) {
      toast.error('Failed to toggle item');
    }
  };

  const getCategoryBadge = (category?: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    if (!cat) return null;

    const Icon = cat.icon;
    return (
      <Badge className={`${cat.color} text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {cat.label}
      </Badge>
    );
  };

  const groupedItems = CATEGORIES.reduce((acc, category) => {
    acc[category.value] = getItemsByCategory(category.value);
    return acc;
  }, {} as Record<string, any[]>);

  const uncategorizedItems = items.filter(item => !item.category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Distraction Blocker Management
          </DialogTitle>
          <DialogDescription>
            Manage websites and applications that get blocked during focus sessions
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            My Blocklist ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Add Custom
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'quick'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Quick Add
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Blocklist Tab */}
          {activeTab === 'list' && (
            <div className="space-y-4 p-4">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading blocklist...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && items.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No blocklist items yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Add websites and apps to block during focus sessions
                  </p>
                  <Button onClick={() => setActiveTab('quick')} size="sm">
                    Quick Add Popular Sites
                  </Button>
                </div>
              )}

              {!loading && !error && items.length > 0 && (
                <div className="space-y-6">
                  {/* Categorized Items */}
                  {CATEGORIES.map(category => {
                    const categoryItems = groupedItems[category.value];
                    if (categoryItems.length === 0) return null;

                    const Icon = category.icon;
                    return (
                      <Card key={category.value}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            {category.label}
                            <Badge variant="secondary" className="ml-auto">
                              {categoryItems.length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {categoryItems.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Globe className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {item.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {item.identifier}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleItem(item.id, item.name, item.isActive)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                  >
                                    {item.isActive ? (
                                      <ToggleRight className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id, item.name)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Uncategorized Items */}
                  {uncategorizedItems.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Other
                          <Badge variant="secondary" className="ml-auto">
                            {uncategorizedItems.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {uncategorizedItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {item.name}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {item.identifier}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleItem(item.id, item.name, item.isActive)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                >
                                  {item.isActive ? (
                                    <ToggleRight className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add Custom Tab */}
          {activeTab === 'add' && (
            <div className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Custom Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Facebook"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select 
                        value={newItem.type} 
                        onValueChange={(value: 'website' | 'application') => 
                          setNewItem({ ...newItem, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="application">Application</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identifier">
                      {newItem.type === 'website' ? 'Website URL *' : 'Application Name *'}
                    </Label>
                    <Input
                      id="identifier"
                      placeholder={
                        newItem.type === 'website' 
                          ? 'e.g., facebook.com' 
                          : 'e.g., chrome.exe'
                      }
                      value={newItem.identifier}
                      onChange={(e) => setNewItem({ ...newItem, identifier: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newItem.category} 
                      onValueChange={(value: string) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <category.icon className="h-4 w-4" />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Blocklist
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Add Tab */}
          {activeTab === 'quick' && (
            <div className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Add Popular Sites
                  </CardTitle>
                  <CardDescription>
                    Add commonly distracting websites with one click
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {POPULAR_SITES.map((site) => {
                      const Icon = site.icon;
                      const isAlreadyAdded = items.some(item => 
                        item.identifier.includes(site.url.replace('www.', ''))
                      );
                      
                      return (
                        <div
                          key={site.url}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                              <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {site.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {site.url}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getCategoryBadge(site.category)}
                            {isAlreadyAdded ? (
                              <Badge variant="secondary" className="text-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Added
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleQuickAdd(site)}
                                variant="outline"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 