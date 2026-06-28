"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useOrg, useUpdateOrg } from "@/lib/organisation-api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { StorefrontSection } from "@/lib/types";

const SECTION_LABELS: Record<StorefrontSection["type"], string> = {
  hero:      "Hero — org name, tagline, and banner image",
  dish_grid: "Menu — active dishes grouped by category",
  about:     "About — address, phone, and email",
  contact:   "Contact — contact details footer",
};

const DEFAULT_SECTIONS: StorefrontSection[] = [
  { type: "hero",      enabled: true,  order: 0, config: {} },
  { type: "dish_grid", enabled: true,  order: 1, config: {} },
  { type: "about",     enabled: true,  order: 2, config: {} },
  { type: "contact",   enabled: false, order: 3, config: {} },
];

function SortableRow({
  section,
  onToggle,
  disabled,
}: {
  section: StorefrontSection;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.type });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-outline p-3 bg-surface-high"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-on-surface-low hover:text-on-surface text-lg leading-none select-none"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium text-on-surface capitalize">
          {section.type.replace("_", " ")}
        </p>
        <p className="text-xs text-on-surface-low">{SECTION_LABELS[section.type]}</p>
      </div>
      <Switch checked={section.enabled} onCheckedChange={onToggle} disabled={disabled} />
    </div>
  );
}

export default function StorefrontSettingsPage() {
  const { data: org, isLoading } = useOrg();
  const updateOrg = useUpdateOrg();

  const [sections, setSections] = useState<StorefrontSection[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    if (org) {
      setSections(
        org.storefront_sections.length > 0
          ? [...org.storefront_sections].sort((a, b) => a.order - b.order)
          : DEFAULT_SECTIONS
      );
    }
  }, [org]);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((prev) => {
        const oldIndex = prev.findIndex((s) => s.type === active.id);
        const newIndex = prev.findIndex((s) => s.type === over.id);
        return arrayMove(prev, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
      });
    }
  }

  function toggleSection(type: StorefrontSection["type"]) {
    setSections((prev) =>
      prev.map((s) => (s.type === type ? { ...s, enabled: !s.enabled } : s))
    );
  }

  function handleSave() {
    updateOrg.mutate({ storefront_sections: sections });
  }

  if (isLoading) return <p className="text-on-surface-medium">Loading…</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-on-surface-medium">
        Drag sections to reorder them on your public storefront. Toggle to show or hide each section.
      </p>

      <div className={updateOrg.isPending ? "pointer-events-none opacity-60" : ""}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.type)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableRow
                  key={section.type}
                  section={section}
                  onToggle={() => toggleSection(section.type)}
                  disabled={updateOrg.isPending}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {updateOrg.isError && <p className="text-sm text-red-400">Failed to save. Try again.</p>}
      {updateOrg.isSuccess && <p className="text-sm text-green-400">Storefront layout saved.</p>}

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={updateOrg.isPending}>
          {updateOrg.isPending ? "Saving…" : "Save Layout"}
        </Button>
      </div>
    </div>
  );
}
