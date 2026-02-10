# Rules for Career Page

This document defines the rules and constraints for working with this project using Codex (or any AI coding agent).

## Goal
Create a maintainable, extendable career site .

## Core Principles
- No backend
- No frameworks
- Vanilla HTML, CSS, JavaScript
- Simple and readable code
- Structure over design

## File Structure

The project follows this structure:

├── index.html # Page structure only
├── script.js # Data loading and rendering
├── styles.css # Minimal, neutral styling
├── agent.md # Rules for Codex / AI agent
└── data/
├── en.json # English content (source of truth)
└── ru.json # Russian content (optional, added later)


## Data
- All content is stored in JSON files
- One JSON file per language (e.g. en.json, ru.json)
- JSON files are the single source of truth
- No hardcoded content in HTML

## JavaScript
- Used only for:
- loading JSON data
- rendering content
- No build tools

## HTML
- Contains only structure and containers
- No content duplication
- No language-specific text
- No inline scripts

## CSS
- Minimal
- Neutral
- No heavy layout systems
- No CSS frameworks
- Page must be responsive and look good on both desktop and mobile

## UI/UX Notes
- Sections with long content (e.g., experience, projects) should support collapsible/accordion behavior
- Nested sections are allowed, up to 3–4 levels deep
- The interface should resemble a project tree view
- Keep implementation simple and minimal
- Accordion behavior is optional at the MVP stage
- Ensure usability on desktop and mobile


## Internationalization
- Languages are separated by files, not by fields
- Example:
  - `data/en.json`
  - `data/ru.json`
- Language switching logic should stay simple
- No mixed-language content in one file

## Scope Control
- Do not add features unless explicitly requested
- Avoid overengineering
- Prefer simple solutions


## Evolution Rules
- Data structure may evolve
- Backward compatibility is not required at early stages
- Refactoring is expected and acceptable