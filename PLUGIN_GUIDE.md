# Console Plugin System - Complete Guide

## Overview

Console is a **tool-agnostic plugin platform** that can load tools from:
- ✅ Local `../plugins/` directory (for development)
- ✅ Published npm packages (for production)
- ✅ Mix of both (hybrid mode)

**Key Benefits:**
- No hardcoded tool references in Console
- Single `node_modules` with automatic dependency hoisting
- Add unlimited tools without modifying Console code
- Each tool declares its own dependencies

## Quick Start: Initial Setup

### Step 1: Create plugins Directory

```bash
cd /path/to/your_sys_1
mkdir -p plugins
```

### Step 2: Move Existing Tools

```bash
# Move your tools into the plugins directory
mv your-ui plugins/
# mv any-other-tool plugins/
```

### Step 3: Create package.json for Each Tool

```bash
cd plugins/your-ui

cat > package.json << 'EOF'
{
  "name": "@console-plugins/your-ui",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./your.tsx",
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.426.0"
  },
  "dependencies": {
  }
}
EOF
```

**Important:**
- `name` must be `@console-plugins/[tool-name]`
- `main` points to your main component file
- Add tool-specific dependencies to `dependencies` section
- Keep React in `peerDependencies`

### Step 4: Install with Workspace

```bash
cd console

# Clean old installations
rm -rf node_modules package-lock.json
rm package-lock.json

# Install everything (workspace auto-discovers plugins)
npm install
```

### Step 5: Check that your local .env.development file has these settings

```bash
VITE_API_URL='http://127.0.0.1:5001'
VITE_DEV_MODE=true
VITE_BOOTSTRAP_PLUGINS=schd,enerclave

```

The `VITE_BOOTSTRAP_PLUGINS` variable defines which plugins to load on startup (comma-separated list).

### Step 6: Start Development

```bash
npm run dev
```

**Check browser console for:**
```
✓ Loaded [tool-name]/main from local path
```

## How to Add a New Tool

### Method 1: Create New Tool from Scratch

```bash
# 1. Create plugin directory
mkdir -p plugins/my-new-tool
cd plugins/my-new-tool

# 2. Create package.json
cat > package.json << 'EOF'
{
  "name": "@console-plugins/my-new-tool",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./my-new-tool.tsx",
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "dependencies": {
  }
}
EOF

# 3. Create main component
cat > my-new-tool.tsx << 'EOF'
export default function MyNewTool({ 
  portfolio, 
  org, 
  tool, 
  section,
  tree,
  query,
  onNavigate 
}) {
  return (
    <div className="p-4">
      <h1>My New Tool</h1>
      <p>Portfolio: {portfolio}</p>
      <p>Organization: {org}</p>
    </div>
  );
}
EOF

# 4. Create navigation (optional)
mkdir -p navigation
cat > navigation/my-new-tool_sidenav.tsx << 'EOF'
export default function MyNewToolSideNav({ 
  portfolio, 
  org, 
  tool, 
  section, 
  onNavigate 
}) {
  return (
    <nav className="w-64 p-4">
      <h2>My Tool Nav</h2>
      <button onClick={() => onNavigate(`/${portfolio}/${org}/${tool}/dashboard`)}>
        Dashboard
      </button>
    </nav>
  );
}
EOF

# 5. Add to bootstrap plugins (optional, only if you want it to load on startup)
cd ../../console
# Edit .env.development and add plugin to VITE_BOOTSTRAP_PLUGINS: "schd,enerclave,my-new-tool"

# 6. Install (workspace auto-discovers)
npm install

# Done!
npm run dev
```

### Method 2: Clone Existing Tool

```bash
# 1. Clone tool repository
cd tools
git clone https://github.com/your-org/your-tool.git

# 2. Ensure it has package.json
cd your-tool
# If no package.json, create one (see structure below)

# 3. Add to bootstrap plugins (optional)
cd ../../console
# Edit .env.development and add plugin to VITE_BOOTSTRAP_PLUGINS if needed

# 4. Install
npm install

# Done!
```

### Method 3: Install from npm

```bash
cd console

# Install published plugin
npm install @console-plugins/some-tool@1.0.0

# Add to bootstrap plugins (optional)
# Edit .env.production and add plugin to VITE_BOOTSTRAP_PLUGINS if needed

# Set production mode
echo "VITE_DEV_MODE=false" > .env.local

# Run
npm run dev
```

## Tool Structure Requirements

### Required Files

```
plugins/[plugin-name]/
├── package.json              # Required: Plugin metadata
├── [plugin-name].tsx          # Required: Main component
├── navigation/              # Optional: Navigation
│   ├── [plugin-name]_sidenav.tsx
│   └── [plugin-name]_sheetnav.tsx
└── onboarding/             # Optional: Bootstrap
    └── [plugin-name]_onboarding.tsx
```

### Required package.json Fields

```json
{
  "name": "@console-plugins/[tool-name]",    // Required: Must follow this pattern
  "version": "1.0.0",                     // Required: Semantic version
  "type": "module",                       // Required: ESM
  "main": "./[tool-name].tsx",           // Required: Entry point
  "peerDependencies": {                  // Required: Shared deps
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "dependencies": {                      // Optional: Tool-specific deps
    "recharts": "^2.15.1",
    "leaflet": "^1.9.4"
  }
}
```

### Component Props Interface

All tool components receive these props:

```typescript
interface ToolComponentProps {
  portfolio: string;        // Portfolio ID
  org: string;             // Organization ID
  tool: string;            // Tool ID
  section?: string;        // Current section
  tree: TreeData;          // Application data tree
  query: Record<string, string>;  // URL query params
  onNavigate: (path: string) => void;  // Navigation function
  p1?: string;             // Additional path params
  p2?: string;
  p3?: string;
}
```

**Example component:**

```typescript
export default function MyTool(props: ToolComponentProps) {
  const { portfolio, org, tool, section, tree, query, onNavigate } = props;
  
  return (
    <div>
      <h1>My Tool</h1>
      <button onClick={() => onNavigate(`/${portfolio}/${org}/${tool}/settings`)}>
        Settings
      </button>
    </div>
  );
}
```

## Adding Tool Dependencies

### Tool-Specific Dependencies

When your tool needs packages like `recharts`, `leaflet`, etc.:

```bash
cd console

# Option 1: Install via npm
npm install recharts -w @console-plugins/my-plugin

# Option 2: Edit package.json manually
# Edit plugins/my-plugin/package.json
# Add to dependencies: "recharts": "^2.15.1"
npm install
```

**Result:** Dependencies are hoisted to `console/node_modules/`

### Shared Dependencies

Already in `console/package.json`:
- React, React DOM, React Router
- UI libraries (Radix UI, Lucide)
- Common utilities

Plugins should use `peerDependencies` for these.

## Configuration

### Console Configuration (Already Set)

**console/package.json:**
```json
{
  "workspaces": [
    ".",
    "../plugins/*"
  ]
}
```

**console/vite.config.ts:**
```typescript
{
  resolve: {
    alias: {
      '@plugins': path.resolve(__dirname, '../plugins')
    }
  }
}
```

### Environment Variables

**.env.development (Development):**
```bash
VITE_DEV_MODE=true          # Load from ../plugins/
VITE_API_URL=http://localhost:5000
VITE_BOOTSTRAP_PLUGINS=schd,enerclave  # Plugins to load on startup
```

**.env.production (Production):**
```bash
VITE_DEV_MODE=false         # Load from npm packages
VITE_API_URL=https://api.production.com
VITE_BOOTSTRAP_PLUGINS=schd,enerclave  # Plugins to load on startup
```

## Architecture Overview

### How It Works

1. **Plugin Discovery**
   - Console reads `VITE_BOOTSTRAP_PLUGINS` from `.env` files to know which plugins to load on startup
   - Workspace pattern `../plugins/*` auto-discovers plugin packages
   - npm creates symlinks: `node_modules/@console-plugins/my-plugin` → `../../plugins/my-plugin`

2. **Component Loading**
   ```typescript
   // Console dynamically imports plugins at runtime
   const PluginComponent = lazy(() => 
     importPluginComponent(pluginName, 'main')  // pluginName from URL/config
   );
   ```

3. **Dependency Resolution**
   - Each plugin declares dependencies in its `package.json`
   - npm workspace hoists all dependencies to `console/node_modules/`
   - Single React instance, no duplicates

4. **Development Flow**
   ```
   Edit plugins/my-plugin/my-plugin.tsx
   → Vite detects change
   → Hot reload
   → Changes appear in browser
   ```

### Plugin-Agnostic Design

Console has **zero hardcoded plugin references**:
- ✅ No plugin names in Console source code
- ✅ Bootstrap plugins configured via environment variables
- ✅ Components loaded dynamically
- ✅ Add unlimited plugins without modifying Console

## Common Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Workspace Management

```bash
# List all workspace packages
npm ls --workspaces

# Install dependency for specific tool
npm install recharts -w @console-plugins/my-tool

# Update all dependencies
npm update --workspaces

# Check for duplicates
npm dedupe
```

### Tool Management

```bash
# Add new plugin (after creating files)
cd console
npm install

# Remove plugin
rm -rf ../plugins/plugin-name
npm install

# Update plugin version
cd ../plugins/my-plugin
# Edit package.json version
cd ../../console
npm install
```

### Debugging

```bash
# Check tool is discovered
npm ls @console-plugins/my-tool

# Check React is single instance
npm ls react

# View workspace structure
npm ls --workspaces

# Clear caches
rm -rf node_modules/.vite
npm cache clean --force
```

## Publishing Tools to npm

### Step 1: Prepare Tool Package

```bash
cd tools/my-tool

# Update package.json
# Remove "private": true
# Ensure version is correct

# Test package
npm pack --dry-run
```

### Step 2: Publish

```bash
# Login to npm (one-time)
npm login

# Publish
npm publish --access public

# Or publish with tag
npm publish --access public --tag beta
```

### Step 3: Use Published Package

```bash
cd console

# Install from npm
npm install @console-plugins/my-plugin@1.0.0

# Add to bootstrap plugins (optional)
# Edit .env.local: VITE_BOOTSTRAP_PLUGINS=schd,enerclave,my-plugin

# Set production mode
echo "VITE_DEV_MODE=false" > .env.local

# Run
npm run dev
```

## Development Modes

### Mode 1: Local Development

```bash
# Plugins in ../plugins/ directory
VITE_DEV_MODE=true npm run dev
```

**Use for:**
- Active tool development
- Testing changes locally
- Hot reload needed

### Mode 2: npm Packages

```bash
# Tools from node_modules/@console-plugins/
VITE_DEV_MODE=false npm run dev
```

**Use for:**
- Production deployment
- Using stable tool versions
- Testing published packages

### Mode 3: Hybrid (Recommended for Development)

```bash
# Some plugins local, some from npm
npm install @console-plugins/stable-plugin-1
npm install @console-plugins/stable-plugin-2
# Keep plugins/my-active-plugin/ for editing
VITE_DEV_MODE=true npm run dev
```

**Result:**
- `my-active-plugin` → loads from local (editable)
- `stable-plugin-1` → loads from npm
- `stable-plugin-2` → loads from npm

## Troubleshooting

### Plugin Not Loading

```bash
# 1. Check plugin exists
ls ../plugins/my-plugin

# 2. Check package.json exists
cat ../plugins/my-plugin/package.json

# 3. Check plugin in bootstrap list (if applicable)
grep "VITE_BOOTSTRAP_PLUGINS" .env.development

# 4. Check workspace
npm ls --workspaces | grep my-plugin

# 5. Reinstall
rm -rf node_modules && npm install
```

### Dependencies Not Resolving

```bash
# Check plugin's dependencies
cat ../plugins/my-plugin/package.json

# Reinstall workspace
cd console
npm install

# Force reinstall
npm install --force
```

### Multiple React Errors

```bash
# Ensure React is in peerDependencies
cd ../plugins/my-plugin
# Edit package.json:
# Move "react" from dependencies to peerDependencies

cd ../../console
npm install

# Verify single React
npm ls react
```

### Workspace Not Recognizing Plugin

```bash
# Check plugin has required fields
cat ../plugins/my-plugin/package.json
# Must have: "name": "@console-plugins/..."

# Verify workspace pattern
cat package.json | grep -A 3 workspaces
# Should show: "../plugins/*"

# Reinstall
npm install
```

### Component Not Found

```bash
# Check file exists
ls ../plugins/my-plugin/my-plugin.tsx

# Check file name matches main in package.json
cat ../plugins/my-plugin/package.json | grep main

# Check exports in package.json
cat ../plugins/my-plugin/package.json | grep -A 3 exports
```

## Directory Structure

### After Setup

```
enerclave_sys_1/
├── plugins/                     # All plugins here
│   ├── my-plugin/
│   │   ├── package.json
│   │   ├── my-plugin.tsx
│   │   └── navigation/
│   ├── another-plugin/
│   │   ├── package.json
│   │   └── another-plugin.tsx
│   └── third-plugin/
│       ├── package.json
│       └── third-plugin.tsx
│
└── console/                     # Main application
    ├── package.json             # Workspace root
    ├── node_modules/            # All dependencies
    │   ├── react/
    │   ├── recharts/            # From plugins
    │   └── @console-plugins/    # Symlinks to ../plugins/
    ├── .env.development         # Bootstrap plugins config
    ├── .env.production
    ├── src/
    │   ├── lib/
    │   │   └── plugin-registry.ts
    │   └── types/
    │       └── tool-types.ts
    └── vite.config.ts
```

## Benefits

### 1. No Duplicate Dependencies

**Before:**
```
console/node_modules/      (200 MB)
plugin-a/node_modules/     (150 MB) ← Duplicate
plugin-b/node_modules/     (150 MB) ← Duplicate
Total: ~500 MB
```

**After:**
```
console/node_modules/      (200 MB) ← Everything here
plugins/plugin-a/          (0 MB)   ← Just source
plugins/plugin-b/          (0 MB)   ← Just source
Total: ~200 MB ← 60% savings
```

### 2. Plugin-Agnostic Platform

- ✅ Zero hardcoded plugin references
- ✅ Add unlimited plugins without modifying Console
- ✅ Plugins discovered automatically
- ✅ Clean separation of concerns

### 3. Flexible Development

- ✅ Develop locally with hot reload
- ✅ Use published npm packages
- ✅ Mix local and published plugins
- ✅ Each plugin independent

### 4. Easy Distribution

- ✅ Publish plugins to npm registry
- ✅ Users: `npm install @console-plugins/my-plugin`
- ✅ Version control per plugin
- ✅ Independent releases

## Quick Reference

### File Checklist for New Plugin

- [ ] Create `plugins/[name]/` directory
- [ ] Create `package.json` with required fields
- [ ] Create `[name].tsx` main component
- [ ] (Optional) Create `navigation/[name]_sidenav.tsx`
- [ ] (Optional) Create `navigation/[name]_sheetnav.tsx`
- [ ] (Optional) Create `onboarding/[name]_onboarding.tsx`
- [ ] (Optional) Add plugin to `VITE_BOOTSTRAP_PLUGINS` in `.env.development` if you want it to load on startup
- [ ] Run `npm install` in console
- [ ] Test with `npm run dev`

### Required package.json Fields

```json
{
  "name": "@console-plugins/[tool-name]",     ← Must match pattern
  "version": "1.0.0",                      ← Semantic version
  "type": "module",                        ← ESM modules
  "main": "./[tool-name].tsx",            ← Entry point
  "peerDependencies": {                   ← Shared dependencies
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

### Key Commands

```bash
# Create new plugin
mkdir -p plugins/my-plugin && cd plugins/my-plugin
# Create package.json and components
cd ../../console && npm install

# Add plugin dependency
npm install recharts -w @console-plugins/my-plugin

# Publish plugin
cd plugins/my-plugin
npm publish --access public

# Use published plugin
npm install @console-plugins/my-plugin
```

## Summary

**Console is now a plugin platform:**

1. **Add plugins** → Create in `plugins/` directory
2. **Configure** → Optionally add to `VITE_BOOTSTRAP_PLUGINS` in `.env` files
3. **Install** → Run `npm install`
4. **Done** → Plugins load automatically

No Console code modification required. Add unlimited plugins following the standard structure.

For questions or issues, check the troubleshooting section above. 🚀

