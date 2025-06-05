import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Copy, Key, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyWithFallback } from '@/hooks/useCompanyWithFallback';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ApiKey } from '@/types/subscription';

const ApiManagement = () => {
  const { user } = useAuth();
  const { company } = useCompanyWithFallback(user?.id);
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as ApiKey[];
    },
    enabled: !!user,
  });

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (keyName: string) => {
      if (!user || !company) throw new Error('User or company not found');
      
      // Generate a random API key
      const apiKey = `gst_${crypto.randomUUID().replace(/-/g, '')}`;
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          company_id: company.id,
          key_name: keyName,
          api_key: apiKey,
          is_active: true,
          rate_limit: 1000,
          scopes: ['read', 'write']
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setNewKeyName('');
      setIsCreating(false);
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  });

  // Delete API key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your API key.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    createKeyMutation.mutate(newKeyName);
  };

  const handleDeleteKey = (keyId: string, keyName: string) => {
    if (window.confirm(`Are you sure you want to delete the API key "${keyName}"? This action cannot be undone.`)) {
      deleteKeyMutation.mutate(keyId);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard.",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const maskApiKey = (apiKey: string) => {
    return `${apiKey.substring(0, 8)}${'*'.repeat(24)}${apiKey.substring(-4)}`;
  };

  if (isLoading) {
    return <div>Loading API keys...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Management</h2>
        <p className="text-muted-foreground">
          Manage your API keys to integrate with our invoice management system.
        </p>
      </div>

      {/* Create New API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create New API Key
          </CardTitle>
          <CardDescription>
            Generate a new API key to access our REST API endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyName">Key Name</Label>
            <Input
              id="keyName"
              placeholder="e.g., Production App, Mobile App, etc."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleCreateKey} 
            disabled={isCreating || !newKeyName.trim()}
          >
            {isCreating ? 'Creating...' : 'Create API Key'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Your API Keys
          </CardTitle>
          <CardDescription>
            Manage your existing API keys and monitor their usage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys found. Create your first API key to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{key.key_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {showKeys[key.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(key.api_key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id, key.key_name)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">API Key:</span>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {showKeys[key.id] ? key.api_key : maskApiKey(key.api_key)}
                      </code>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Rate Limit:</span>
                        <span className="ml-2">{key.rate_limit} requests/hour</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Used:</span>
                        <span className="ml-2">
                          {key.last_used_at 
                            ? new Date(key.last_used_at).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation Link */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to integrate with our API endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our REST API provides endpoints for managing invoices, customers, products, and generating reports.
              Use your API key in the Authorization header for all requests.
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Quick Start Example:</h4>
              <code className="text-sm">
                curl -H "Authorization: Bearer YOUR_API_KEY" \<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;https://api.yourdomain.com/v1/invoices
              </code>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Available Endpoints:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• GET /v1/invoices - List all invoices</li>
                <li>• POST /v1/invoices - Create new invoice</li>
                <li>• GET /v1/customers - List all customers</li>
                <li>• POST /v1/customers - Create new customer</li>
                <li>• GET /v1/products - List all products</li>
                <li>• POST /v1/products - Create new product</li>
                <li>• GET /v1/reports/gst - Generate GST reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiManagement;
