'use client';

import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import type { PlayerWithUser, TeamWithColors } from '~/server/api-client';
import type { Color } from '~/server/db/schema';
import { ColorSection } from './color-section';

interface TeamSectionProps {
  currentUserId: string;
  ownerId: string;
  team: TeamWithColors;
  players: PlayerWithUser[];
  onDeleteTeam: (team: TeamWithColors) => void;
  onAddPlayer: (teamId: string, colorId: string, position: number) => void;
}

export function TeamSection({
  currentUserId,
  ownerId,
  team,
  players,
  onDeleteTeam,
  onAddPlayer,
}: TeamSectionProps) {
  const [expanded, setExpanded] = useState(team.isDefault);

  // Count total players in the team
  const countPlayersInTeam = () => {
    return players.filter((player) => player.teamId === team.id).length;
  };

  // Get players for a specific color
  const getPlayersByColor = (color: Color) => {
    return players.filter(
      (player) => player.teamId === team.id && player.colorId === color.id,
    );
  };

  const onToggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  // Default color order if not specified
  const colorOrder = team.colors;

  // Create sortable items for the colors
  const colorItems = colorOrder.map((color) => `${team.id}-${color.id}`);

  return (
    <Collapsible
      open={expanded}
      onOpenChange={onToggleExpand}
      className="rounded-lg border p-2"
    >
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex flex-1 items-center justify-start gap-2 p-2 cursor-pointer"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="font-medium">{team.name}</span>
            <span className="ml-2 text-muted-foreground text-sm">
              ({countPlayersInTeam()} players)
            </span>
          </Button>
        </CollapsibleTrigger>

        {currentUserId === ownerId && !team.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-gray-500 hover:text-red-500 cursor-pointer"
            onClick={() => onDeleteTeam(team)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CollapsibleContent>
        <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-4">
          <SortableContext
            items={colorItems}
            strategy={horizontalListSortingStrategy}
          >
            {/* Render colors in the order specified by colorOrder */}
            {colorOrder.map((color) => (
              <ColorSection
                key={`[${team.id}][${color.id}]`}
                teamId={team.id}
                color={color}
                players={getPlayersByColor(color)}
                currentUserId={currentUserId}
                ownerId={ownerId}
                onAddPlayer={onAddPlayer}
              />
            ))}
          </SortableContext>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
