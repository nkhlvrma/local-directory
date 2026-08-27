"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, X, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { decideListing, bulkDecide } from "./actions";

type Item = {
  id: string;
  name: string;
  description: string | null;
  whatsapp_number: string;
  created_at: string;
  category: string;
  neighborhood: string;
};

export function AdminQueue({ items }: { items: Item[] }) {
  const [pending, startTransition] = useTransition();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = items.filter((i) => !hidden.has(i.id));

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (selected.size === visible.length) setSelected(new Set());
    else setSelected(new Set(visible.map((i) => i.id)));
  }
  function bulkAction(action: "approve" | "reject") {
    if (selected.size === 0) return;
    const ids = [...selected];
    startTransition(async () => {
      const res = await bulkDecide(ids, action);
      toast(
        action === "approve"
          ? `Approved ${res?.count ?? 0}`
          : `Rejected ${res?.count ?? 0}`,
      );
      setHidden((h) => {
        const next = new Set(h);
        ids.forEach((id) => next.add(id));
        return next;
      });
      setSelected(new Set());
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selected.size === visible.length && visible.length > 0}
            onCheckedChange={toggleAll}
          />
          <span className="text-xs text-muted-foreground">
            {selected.size} of {visible.length} selected
          </span>
        </div>
        {selected.size > 0 ? (
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => bulkAction("approve")}
            >
              <Check className="size-4" />
              Approve selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => bulkAction("reject")}
            >
              <X className="size-4" />
              Reject selected
            </Button>
          </div>
        ) : null}
      </div>

      {visible.map((i) => (
        <Card key={i.id} className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selected.has(i.id)}
              onCheckedChange={() => toggle(i.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{i.name}</span>
                <Badge variant="secondary">{i.category}</Badge>
                <Badge variant="secondary">{i.neighborhood}</Badge>
                <span className="text-xs text-muted-foreground">
                  {i.whatsapp_number}
                </span>
              </div>
              {i.description ? (
                <p className="text-sm mt-2">{i.description}</p>
              ) : null}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await decideListing(i.id, "approve");
                      if (res?.error) toast.error(res.error);
                      else {
                        toast(`Approved ${i.name}`);
                        setHidden((s) => new Set(s).add(i.id));
                      }
                    })
                  }
                >
                  <Check className="size-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await decideListing(i.id, "reject");
                      if (res?.error) toast.error(res.error);
                      else {
                        toast(`Rejected ${i.name}`);
                        setHidden((s) => new Set(s).add(i.id));
                      }
                    })
                  }
                >
                  <X className="size-4" />
                  Reject
                </Button>
                <Link href={`/admin/listings/${i.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
