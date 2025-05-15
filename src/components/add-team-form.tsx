'use client';

import { Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';

interface AddTeamFormProps {
  onAddTeam: (name: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function AddTeamForm({ onAddTeam, onCancel, isOpen }: AddTeamFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onAddTeam(name.trim());
      setName('');
    }
  };

  if (!isOpen) {
    return (
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold text-2xl">Player Timer</h2>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Users className="h-4 w-4" />
          <span>Add Team</span>
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="teamname" className="font-medium text-sm">
            Team Name
          </label>
          <Input
            id="teamname"
            placeholder="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button
            className=" cursor-pointer"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Add Team
          </Button>
          <Button
            className=" cursor-pointer"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
