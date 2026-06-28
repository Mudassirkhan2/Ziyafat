"use client"

import { useFormContext } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function SectionLabel({
  children,
  number,
}: {
  children: React.ReactNode;
  number?: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {number != null && (
        <span
          className="inline-flex w-6 h-6 items-center justify-center rounded-[7px] text-[11px] font-bold flex-shrink-0"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--secondary)",
            background: "color-mix(in oklab, var(--secondary), #fff 86%)",
          }}
        >
          {number}
        </span>
      )}
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-medium">
        {children}
      </span>
      <span className="flex-1 h-px bg-outline-low" />
    </div>
  );
}

/** @deprecated sections are now separated by divide-y on the card wrapper */
export function SectionDivider() {
  return null;
}

export interface SelectOption {
  value: string
  label: string
}

interface FormInputProps {
  name: string
  label: string
  placeholder?: string
  type?: string
  step?: string
  className?: string
}

export function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  step,
  className,
}: FormInputProps) {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} step={step} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface FormSelectProps {
  name: string
  label: string
  placeholder?: string
  options: readonly SelectOption[]
  className?: string
}

export function FormSelect({
  name,
  label,
  placeholder,
  options,
  className,
}: FormSelectProps) {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface FormTextareaProps {
  name: string
  label: string
  placeholder?: string
  rows?: number
  className?: string
}

export function FormTextarea({
  name,
  label,
  placeholder,
  rows = 3,
  className,
}: FormTextareaProps) {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea placeholder={placeholder} rows={rows} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface FormSwitchProps {
  name: string
  label: string
}

export function FormSwitch({ name, label }: FormSwitchProps) {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center gap-2">
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel className="!mt-0">{label}</FormLabel>
        </FormItem>
      )}
    />
  )
}

interface FormDatePickerProps {
  name: string
  label: string
  placeholder?: string
  className?: string
}

export function FormDatePicker({
  name,
  label,
  placeholder = "Pick a date",
  className,
}: FormDatePickerProps) {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger
              className={cn(
                "flex h-[44px] w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors hover:bg-accent",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? format(field.value as Date, "PPP") : placeholder}
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </PopoverTrigger>
            <PopoverContent align="start">
              <Calendar
                mode="single"
                selected={field.value as Date | undefined}
                onSelect={field.onChange}
                disabled={(date) => date < new Date("1900-01-01")}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
