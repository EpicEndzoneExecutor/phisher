import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Zap, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface AIConfig {
  provider: string;
  model: string;
  apiEndpoint: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  customInstructions: string;
}

interface AIConfigurationProps {
  config: AIConfig;
  onConfigChange: (config: AIConfig) => void;
  onTestConnection: () => void;
  isConnected: boolean;
  isTesting: boolean;
  connectionError?: string;
}

export const AIConfiguration = ({ 
  config, 
  onConfigChange, 
  onTestConnection, 
  isConnected, 
  isTesting,
  connectionError 
}: AIConfigurationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleConfigChange = (field: keyof AIConfig, value: string | number) => {
    onConfigChange({ ...config, [field]: value });
  };

  const presetConfigs = {
    ollama: {
      provider: "Ollama",
      model: "llama3.1:8b",
      apiEndpoint: "http://localhost:11434/api/generate",
      temperature: 0.7,
      maxTokens: 1000,
    },
    openai: {
      provider: "OpenAI",
      model: "gpt-4",
      apiEndpoint: "https://api.openai.com/v1/chat/completions",
      temperature: 0.7,
      maxTokens: 1000,
    },
    perplexity: {
      provider: "Perplexity",
      model: "llama-3.1-sonar-small-128k-online",
      apiEndpoint: "https://api.perplexity.ai/chat/completions",
      temperature: 0.7,
      maxTokens: 1000,
    }
  };

  const loadPreset = (preset: keyof typeof presetConfigs) => {
    const presetConfig = presetConfigs[preset];
    onConfigChange({
      ...config,
      ...presetConfig
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Configuration
            </CardTitle>
            <CardDescription>
              Configure your AI model for email generation
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-success" : ""}>
              {isConnected ? "Connected" : "Not Connected"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {(isExpanded || !isConnected) && (
        <CardContent>
          <div className="space-y-6">
            {/* Quick Presets */}
            <div className="space-y-2">
              <Label>Quick Setup</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset("ollama")}
                >
                  Ollama (Local)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset("openai")}
                >
                  OpenAI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset("perplexity")}
                >
                  Perplexity
                </Button>
              </div>
            </div>

            <Separator />

            {/* Provider Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select 
                  onValueChange={(value) => handleConfigChange("provider", value)} 
                  value={config.provider}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ollama">Ollama (Local)</SelectItem>
                    <SelectItem value="OpenAI">OpenAI</SelectItem>
                    <SelectItem value="Perplexity">Perplexity</SelectItem>
                    <SelectItem value="Custom">Custom API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={config.model}
                  onChange={(e) => handleConfigChange("model", e.target.value)}
                  placeholder="e.g., llama3.1:8b or gpt-4"
                />
              </div>
            </div>

            {/* API Configuration */}
            <div className="space-y-2">
              <Label htmlFor="apiEndpoint">API Endpoint</Label>
              <Input
                id="apiEndpoint"
                value={config.apiEndpoint}
                onChange={(e) => handleConfigChange("apiEndpoint", e.target.value)}
                placeholder="e.g., http://localhost:11434/api/generate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (if required)</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                placeholder="Enter your API key"
              />
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">
                  Temperature ({config.temperature})
                </Label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => handleConfigChange("temperature", parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Lower = more focused, Higher = more creative
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => handleConfigChange("maxTokens", parseInt(e.target.value))}
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="space-y-2">
              <Label htmlFor="customInstructions">Custom Instructions</Label>
              <Textarea
                id="customInstructions"
                value={config.customInstructions}
                onChange={(e) => handleConfigChange("customInstructions", e.target.value)}
                placeholder="Additional instructions for the AI model..."
                rows={3}
              />
            </div>

            {/* Test Connection */}
            <Button
              onClick={onTestConnection}
              disabled={isTesting || !config.apiEndpoint}
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isTesting ? "Testing Connection..." : "Test Connection"}
            </Button>

            {/* Connection Error */}
            {connectionError && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2 text-destructive">Connection Error:</h4>
                <p className="text-xs text-destructive/80">{connectionError}</p>
              </div>
            )}

            {/* Connection Tips */}
            {config.provider === "Ollama" && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Ollama Setup Tips:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Install Ollama from https://ollama.ai</li>
                  <li>• Run: ollama pull llama3.1:8b</li>
                  <li>• Start with CORS: OLLAMA_ORIGINS=* ollama serve</li>
                  <li>• Or use: ollama serve --host 0.0.0.0</li>
                </ul>
              </div>
            )}

            {(config.provider === "OpenAI" || config.provider === "Perplexity") && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">API Key Setup:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Get your API key from the provider's dashboard</li>
                  <li>• Ensure you have sufficient credits/quota</li>
                  <li>• For production, use environment variables or Supabase secrets</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};