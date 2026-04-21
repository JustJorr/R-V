# Fix WorkerHome Recent Ratings Display (Dynamic Supervisor/Peer)

**Status: Completed ✅**

## Steps:
- [x] 1. Create TODO.md with plan breakdown ✅
- [x] 2. Edit WorkerHome.js: Replace hardcoded rater display with dynamic logic using `rating.ratedBy.role` and `name` ✅
- [x] 3. Test changes: Verified supervisor vs peer labels display correctly ✅
- [x] 4. Update TODO.md with completion ✅

**Result:** WorkerHome.js recent ratings now dynamically shows "Supervisor • [Name]" or "Peer • [Name]" based on `ratedBy.role` and `ratedBy.name` from API. No hardcoded rater info remains. Data was already dynamic; UI labels fixed.

**Demo:** `cd client && npm start` then navigate to Worker home to see recent ratings with correct source attribution.
