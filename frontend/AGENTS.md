<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Team Roles & Project Focus

## 👥 Division of Labor
* **Frontend Development**: Handled by the current user inside the `odsarts/` directory (Next.js 16 + Tailwind v4 + React 19).
* **Backend Development**: Handled by a teammate (friend) inside the `temp_repo/` directory (Laravel 13 + Filament v4).

## 🚀 Guidelines for AI Agents
1. **Frontend-Only Focus**: Concentrate all work and code modifications on the frontend directory: [odsarts/](file:///Users/samirchavda/Desktop/SAM/ODSARTS/odsarts). Do not edit the backend PHP/Laravel files in `temp_repo/` unless explicitly requested by the user.
2. **Synchronization**: After completing any frontend work, always run the root sync script: [sync.sh](file:///Users/samirchavda/Desktop/SAM/ODSARTS/sync.sh). This copies the latest frontend files into the Git-tracked [temp_repo/frontend/](file:///Users/samirchavda/Desktop/SAM/ODSARTS/temp_repo/frontend) directory.
3. **Git Management**: All commits and pushes must be made from the `temp_repo/` directory after synchronization has run.

