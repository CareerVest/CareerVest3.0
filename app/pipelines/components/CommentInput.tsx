"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Wand2 } from "lucide-react";
import {
  getTemplatesForAction,
  getTemplateById,
  processTemplate,
  CommentTemplate,
} from "./commentTemplates";

interface CommentInputProps {
  actionType: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  maxLength?: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function CommentInput({
  actionType,
  value,
  onChange,
  minLength = 15,
  maxLength = 1000,
  label = "Comment",
  placeholder = "Enter your comment...",
  required = true,
  error,
}: CommentInputProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [localValue, setLocalValue] = useState(value);
  const [validationError, setValidationError] = useState<string>("");
  const [charCount, setCharCount] = useState(0);

  const templates = getTemplatesForAction(actionType);
  const currentTemplate = selectedTemplate ? getTemplateById(actionType, selectedTemplate) : null;

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
    setCharCount(value.length);
  }, [value]);

  // Auto-capitalize first letter and format text
  const formatText = (text: string): string => {
    if (!text) return text;

    // Trim excessive whitespace
    let formatted = text.replace(/\s+/g, " ");

    // Capitalize first letter if it's lowercase
    if (formatted.length > 0 && formatted[0] === formatted[0].toLowerCase()) {
      formatted = formatted[0].toUpperCase() + formatted.slice(1);
    }

    // Capitalize after periods
    formatted = formatted.replace(/\.\s+([a-z])/g, (match, letter) => {
      return `. ${letter.toUpperCase()}`;
    });

    return formatted;
  };

  // Validate input
  const validateInput = useCallback((text: string): string => {
    const trimmed = text.trim();

    if (required && trimmed.length === 0) {
      return "Comment is required";
    }

    if (trimmed.length > 0 && trimmed.length < minLength) {
      return `Comment must be at least ${minLength} characters (currently ${trimmed.length})`;
    }

    if (trimmed.length > maxLength) {
      return `Comment must not exceed ${maxLength} characters (currently ${trimmed.length})`;
    }

    // Check for all caps (more than 70% uppercase)
    const uppercaseCount = (trimmed.match(/[A-Z]/g) || []).length;
    const letterCount = (trimmed.match(/[A-Za-z]/g) || []).length;
    if (letterCount > 10 && uppercaseCount / letterCount > 0.7) {
      return "Please avoid using all caps";
    }

    // Check for excessive punctuation
    if (/[!?]{3,}/.test(trimmed)) {
      return "Please use punctuation moderately";
    }

    return "";
  }, [minLength, maxLength, required]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = getTemplateById(actionType, templateId);

    if (template) {
      if (template.variables && template.variables.length > 0) {
        // Template has variables - clear values and wait for user input
        setTemplateValues({});
      } else {
        // No variables - apply template directly
        const formatted = formatText(template.template);
        setLocalValue(formatted);
        onChange(formatted);
        setCharCount(formatted.length);
        setValidationError(validateInput(formatted));
      }
    }
  };

  // Handle template variable change
  const handleTemplateValueChange = (key: string, val: string) => {
    const newValues = { ...templateValues, [key]: val };
    setTemplateValues(newValues);

    // Check if all required variables are filled
    if (currentTemplate?.variables) {
      const allRequiredFilled = currentTemplate.variables
        .filter(v => v.required)
        .every(v => newValues[v.key]?.trim());

      if (allRequiredFilled) {
        const processed = processTemplate(currentTemplate.template, newValues);
        const formatted = formatText(processed);
        setLocalValue(formatted);
        onChange(formatted);
        setCharCount(formatted.length);
        setValidationError(validateInput(formatted));
      }
    }
  };

  // Handle manual text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;

    // Don't allow exceeding max length
    if (text.length > maxLength) {
      return;
    }

    setLocalValue(text);
    setCharCount(text.length);

    // Clear template selection when manually editing
    if (selectedTemplate) {
      setSelectedTemplate("");
      setTemplateValues({});
    }
  };

  // Handle blur - apply formatting and validation
  const handleBlur = () => {
    const formatted = formatText(localValue.trim());
    setLocalValue(formatted);
    onChange(formatted);
    setValidationError(validateInput(formatted));
  };

  // Get quality indicator
  const getQualityIndicator = () => {
    const trimmed = localValue.trim();
    if (trimmed.length === 0) {
      return null;
    }

    if (validationError) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Issues Found
        </Badge>
      );
    }

    if (trimmed.length >= minLength && trimmed.length <= maxLength) {
      return (
        <Badge variant="default" className="text-xs bg-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Good Quality
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {/* Template Selector */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Select Template (Optional)
          </Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a template or write custom comment..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Write Custom Comment
                </div>
              </SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    {template.category && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          template.category === "Positive"
                            ? "bg-green-50 text-green-700"
                            : template.category === "Negative"
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {template.category}
                      </Badge>
                    )}
                    <span>{template.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Template Variables Input */}
      {currentTemplate?.variables && currentTemplate.variables.length > 0 && (
        <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Label className="text-sm font-medium text-blue-900">
            Fill Template Details
          </Label>
          {currentTemplate.variables.map((variable) => (
            <div key={variable.key} className="space-y-1">
              <Label className="text-xs text-blue-700">
                {variable.label}
                {variable.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                type={variable.type || "text"}
                value={templateValues[variable.key] || ""}
                onChange={(e) => handleTemplateValueChange(variable.key, e.target.value)}
                placeholder={variable.placeholder}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {getQualityIndicator()}
        </div>

        <Textarea
          value={localValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`min-h-[100px] ${
            validationError || error ? "border-red-500 focus-visible:ring-red-500" : ""
          }`}
          spellCheck={true}
        />

        {/* Character Count and Validation */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className={charCount > maxLength ? "text-red-500 font-medium" : "text-muted-foreground"}>
              {charCount} / {maxLength} characters
            </span>
            {charCount > 0 && charCount < minLength && (
              <span className="text-amber-600">
                {minLength - charCount} more needed
              </span>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {(validationError || error) && (
          <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-red-700">{validationError || error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
