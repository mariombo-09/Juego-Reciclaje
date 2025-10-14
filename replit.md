# Overview

EcoRunner is a 3D recycling education game built with React and Three.js. The game challenges players to run through city streets while correctly classifying waste items into appropriate recycling bins. Players must navigate between lanes, jump to interact with bins, and avoid obstacles while learning about proper waste sorting practices.

The application follows a full-stack architecture with an Express.js backend, React frontend using Three.js for 3D rendering, and PostgreSQL database integration through Drizzle ORM. The game features an infinite runner mechanic with procedurally generated environments, tutorial system, and progressive difficulty scaling.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern React features
- **3D Rendering**: Three.js via React Three Fiber for WebGL-based 3D graphics and game mechanics
- **UI Components**: Radix UI primitives with Tailwind CSS for consistent, accessible design system
- **State Management**: Zustand for lightweight, centralized game state management
- **Asset Loading**: React Three Drei for texture loading, controls, and 3D utilities
- **Build System**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js web server
- **Language**: TypeScript with ESM modules for modern JavaScript features
- **Development**: Hot module replacement via Vite middleware in development mode
- **Production**: Compiled JavaScript with esbuild for optimized server bundle

## Data Storage
- **Database**: PostgreSQL via Neon serverless database
- **ORM**: Drizzle ORM with type-safe schema definitions and migrations
- **Schema**: User management system with username/password authentication structure
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development

## Game Engine Architecture
- **Rendering**: Canvas-based WebGL rendering with shadow mapping and lighting
- **Physics**: Custom collision detection for lane-based movement system  
- **Procedural Generation**: Seeded random generation for consistent infinite environments
- **Audio**: HTML5 Audio API with sound effects and background music management
- **Input**: Keyboard controls via React Three Drei KeyboardControls

## State Management Pattern
- **Game State**: Centralized Zustand store managing game logic, player position, scoring, and tutorial progression
- **Audio State**: Separate store for sound management with mute/unmute functionality
- **Component State**: Local React state for UI-specific interactions and form handling

## Asset Pipeline
- **3D Models**: Support for GLTF/GLB model loading
- **Textures**: PNG texture loading with Three.js TextureLoader
- **Audio**: MP3/OGG/WAV audio file support
- **Fonts**: Web fonts via Fontsource with custom font loading

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection**: Environment-based DATABASE_URL configuration

## Development Tools
- **Drizzle Kit**: Database schema management and migration system
- **Vite Plugin**: Runtime error overlay for enhanced development experience
- **GLSL Plugin**: Shader support for advanced 3D effects

## UI/UX Libraries  
- **Radix UI**: Complete component library for accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe CSS class composition

## 3D Graphics Stack
- **Three.js**: Core 3D graphics library and WebGL wrapper
- **React Three Fiber**: React renderer for Three.js declarative 3D scenes
- **React Three Drei**: Helper library for common Three.js patterns and utilities
- **React Three Post-processing**: Post-processing effects pipeline

## Build and Development
- **TypeScript**: Static type checking and enhanced developer experience
- **esbuild**: Fast JavaScript bundler for production server builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins
- **Replit Integration**: Runtime error modal plugin for cloud development