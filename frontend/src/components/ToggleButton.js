import React from 'react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const ToggleButton = ({ enabled, onChange, enabledLabel, disabledLabel }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="focus-peaking-toggle" 
        checked={enabled} 
        onCheckedChange={onChange} 
        className={cn(
          enabled ? "bg-green-600" : "bg-gray-300"
        )}
      />
      <label
        htmlFor="focus-peaking-toggle"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {enabled 
          ? (enabledLabel || 'Enabled') 
          : (disabledLabel || 'Disabled')
        }
      </label>
    </div>
  );
};

export default ToggleButton;