import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Lightbulb, 
  Check, 
  X, 
  Brain,
  Shield,
  AlertTriangle,
  FileText,
  Target
} from "lucide-react";

const policyFormSchema = z.object({
  name: z.string().min(1, "Policy name is required"),
  description: z.string().optional(),
  type: z.enum(['dlp', 'phishing', 'malware', 'custom']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  keywords: z.string().optional(),
  senderPattern: z.string().optional(),
  attachmentTypes: z.string().optional(),
  actions: z.array(z.string()).min(1, "At least one action is required"),
});

type PolicyFormData = z.infer<typeof policyFormSchema>;

export default function PolicyManagement() {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const { toast } = useToast();

  // Fetch policies
  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["/api/policies"],
    refetchInterval: 30000,
  });

  // Fetch policy recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/policies/recommendations"],
    refetchInterval: 60000,
  });

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: (data: PolicyFormData) => {
      const policyData = {
        name: data.name,
        description: data.description || "",
        type: data.type,
        severity: data.severity,
        rules: {
          keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()) : [],
          senderPattern: data.senderPattern || "",
          attachmentTypes: data.attachmentTypes ? data.attachmentTypes.split(',').map(t => t.trim()) : [],
        },
        actions: data.actions,
        isActive: true,
      };
      return api.policy.createPolicy(policyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Policy created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create policy",
        variant: "destructive",
      });
    },
  });

  // Generate recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: () => api.policy.generateRecommendations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies/recommendations"] });
      toast({
        title: "Success",
        description: "AI recommendations generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive",
      });
    },
  });

  // Accept recommendation mutation
  const acceptRecommendationMutation = useMutation({
    mutationFn: (id: number) => api.policy.acceptRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies/recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({
        title: "Success",
        description: "Recommendation accepted and policy created",
      });
    },
  });

  // Reject recommendation mutation
  const rejectRecommendationMutation = useMutation({
    mutationFn: (id: number) => api.policy.rejectRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies/recommendations"] });
      toast({
        title: "Success",
        description: "Recommendation rejected",
      });
    },
  });

  // Toggle policy status mutation
  const togglePolicyMutation = useMutation({
    mutationFn: (policy: any) => 
      api.policy.updatePolicy(policy.id, { isActive: !policy.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({
        title: "Success",
        description: "Policy status updated",
      });
    },
  });

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "custom",
      severity: "medium",
      keywords: "",
      senderPattern: "",
      attachmentTypes: "",
      actions: ["alert"],
    },
  });

  const onSubmit = (data: PolicyFormData) => {
    createPolicyMutation.mutate(data);
  };

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'dlp':
        return <Shield className="w-4 h-4" />;
      case 'phishing':
        return <AlertTriangle className="w-4 h-4" />;
      case 'malware':
        return <Target className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <main className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Policy Management</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered security policies with intelligent recommendations
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => generateRecommendationsMutation.mutate()}
            disabled={generateRecommendationsMutation.isPending}
            variant="outline"
          >
            <Brain className="w-4 h-4 mr-2" />
            Generate AI Recommendations
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Security Policy</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Policy Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter policy name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Policy Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select policy type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dlp">Data Loss Prevention</SelectItem>
                              <SelectItem value="phishing">Phishing Protection</SelectItem>
                              <SelectItem value="malware">Malware Detection</SelectItem>
                              <SelectItem value="custom">Custom Policy</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this policy does"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords (comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="urgent, confidential, wire transfer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createPolicyMutation.isPending}
                    >
                      Create Policy
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations */}
        {showRecommendations && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    AI Recommendations
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowRecommendations(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendationsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
                      <p>Generating recommendations...</p>
                    </div>
                  ) : !recommendations || recommendations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recommendations available</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => generateRecommendationsMutation.mutate()}
                      >
                        Generate Recommendations
                      </Button>
                    </div>
                  ) : (
                    recommendations.map((rec) => (
                      <div key={rec.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {rec.description}
                            </p>
                          </div>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <p><strong>Reasoning:</strong> {rec.reasoning}</p>
                          <p><strong>Confidence:</strong> {(rec.confidence || 0).toFixed(1)}%</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => acceptRecommendationMutation.mutate(rec.id)}
                            disabled={acceptRecommendationMutation.isPending}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => rejectRecommendationMutation.mutate(rec.id)}
                            disabled={rejectRecommendationMutation.isPending}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Policies */}
        <div className={showRecommendations ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Active Security Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policiesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
                    <p>Loading policies...</p>
                  </div>
                ) : !policies || policies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No policies configured</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      Create Your First Policy
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {policies.map((policy) => (
                      <div 
                        key={policy.id} 
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              policy.isActive 
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {getPolicyTypeIcon(policy.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">{policy.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {policy.description || 'No description provided'}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getSeverityColor(policy.severity)}>
                                  {policy.severity}
                                </Badge>
                                <Badge variant="outline">
                                  {policy.type.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePolicyMutation.mutate(policy)}
                              disabled={togglePolicyMutation.isPending}
                            >
                              {policy.isActive ? (
                                <>
                                  <Pause className="w-3 h-3 mr-1" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 mr-1" />
                                  Enable
                                </>
                              )}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        {/* Policy Rules Preview */}
                        {policy.rules && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">Policy Rules:</p>
                            <div className="text-xs space-y-1">
                              {policy.rules.keywords && policy.rules.keywords.length > 0 && (
                                <p><strong>Keywords:</strong> {policy.rules.keywords.join(', ')}</p>
                              )}
                              {policy.rules.senderPattern && (
                                <p><strong>Sender Pattern:</strong> {policy.rules.senderPattern}</p>
                              )}
                              {policy.rules.attachmentTypes && policy.rules.attachmentTypes.length > 0 && (
                                <p><strong>Attachment Types:</strong> {policy.rules.attachmentTypes.join(', ')}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
