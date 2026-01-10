import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    trackColor?: string;
    thumbSize?: number;
  }
>(({ className, trackColor, thumbSize = 20, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    data-slot="slider"
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range 
        className="absolute h-full transition-colors duration-200"
        data-slot="slider-range"
        style={{
          backgroundColor: trackColor || 'rgb(34, 197, 94)',
        }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className="block rounded-full border-2 bg-background ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" 
      data-slot="slider-thumb"
      style={{
        width: `${thumbSize}px`,
        height: `${thumbSize}px`,
        borderColor: trackColor || 'rgb(34, 197, 94)',
        boxShadow: `0 0 0 2px ${trackColor || 'rgb(34, 197, 94)'}20`,
        '--thumb-focus-color': trackColor || 'rgb(34, 197, 94)',
      } as React.CSSProperties & { '--thumb-focus-color': string }}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

