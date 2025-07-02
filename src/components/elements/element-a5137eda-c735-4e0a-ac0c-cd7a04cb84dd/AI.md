---
name: animated-loader
description: A customizable animated loader with three colored dots moving in a square pattern, creating a visually engaging loading indicator.
keywords: loader, spinner, loading, animation, dots, progress
---

#### Animated Loader

***Purpose:***
This component provides a visually appealing animated loading indicator with three colored dots that move in a square pattern, creating a trail effect that keeps users engaged during loading states.

***Features:***
- Smooth animation with three dots moving in a coordinated pattern
- Fully customizable colors for all three dots
- Adjustable animation speed
- Configurable dot and container sizes
- Responsive movement that scales with container and dot size
- Works in both edit and published modes
- Animation stays contained within the component boundaries

***Properties:***
- size: number - Controls the overall container size in pixels (default: 80)
- dotSize: number - Sets the size of each dot in pixels (default: 28)
- primaryColor: string - Color of the main moving dot (default: #F10C49)
- secondaryColor: string - Color of the first shadow dot (default: #F4DD51)
- tertiaryColor: string - Color of the second shadow dot (default: #E3AAD6)
- animationDuration: number - Animation speed in seconds (default: 2, lower = faster)

***Notes:***
- The loader is centered within its container
- The animation runs continuously in a loop
- The movement distance automatically scales with container size for proper proportions
- The component is lightweight and doesn't affect page performance
- Shadow dots follow the main dot with a slight delay, creating a trail effect