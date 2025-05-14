'use client';

import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface AddPlayerFormProps {
  teamId: string;
  colorId: string;
  position: number;
  onAdd: (teamId: string, colorId: string, position: number) => void;
}

export function AddPlayerForm({
  teamId,
  colorId,
  position,
  onAdd,
}: AddPlayerFormProps) {
  const handleSubmit = () => {
    onAdd(teamId, colorId, position);
  };

  return (
    <Button
      variant="secondary"
      className="flex w-full items-center justify-center gap-2 cursor-pointer"
      onClick={handleSubmit}
    >
      <Plus className="h-4 w-4" />
      <span>Add Player</span>
    </Button>
  );
}
