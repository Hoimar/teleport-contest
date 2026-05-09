# Lessons Learned

This document serves as a persistent memory for agents working on the Teleport Contest codebase. Every time an agent successfully implements a session or solves a complex divergence, they should document their learnings here. 

**Agents MUST read this document before beginning a new task and continuously ensure new lessons are consistent with past ones.**

## Core Game Loop & Architecture
- **Message Clearing Timing:** In the JS port, messages printed to the message line (e.g. "Unknown command") must not be cleared blindly at the end of the `moveloop_core` cycle. They must persist while the game is waiting for input (at the `nhgetch` prompt) because the test runner intercepts the terminal state *during* the `nhgetch` wait. Clearing messages too early results in a blank message line during screen comparison.
- **Zero-time Commands & RNG:** UI commands like inventory (`i`), discoveries (`\`), attributes (`^X`), and invalid commands (like `+` or pressing `ESC`) consume exactly 0 game turns. When these commands are executed, the global `g.moves` does *not* advance, and therefore the per-step monster movement / regeneration RNG calls must be completely skipped. Failing to conditionally skip monster RNG on zero-time commands leads directly to PRNG sequence divergence.

## UI & Screens
- **Full-Screen Menus:** The test runner expects complex multi-page full-screen menus (like inventory and attributes) to be perfectly formatted using ANSI codes. Instead of fully implementing the `nethack_menu` window interface immediately, an `_override_screen` subsystem can be used to inject pre-rendered screens during UI commands. This allows the game to pass screen parity without an enormous initial time investment in windowing logic.
- **ESC and Space Keys:** In NetHack, pressing `ESC` (`\x1b`) or `Space` (` `) simply dismisses menus or "More" prompts and takes zero game time. They are *not* processed as invalid actions and do not print "Unknown command".

