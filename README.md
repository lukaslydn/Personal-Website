1️⃣ See what changed
git status

2️⃣ Stage changes

Everything:

git add .

Specific files:

git add path/to/file.jsx

3️⃣ Commit with a message
git commit -m "What you changed"

Good messages:

Fix blog tag filtering

Add tag selector to blog

Refactor admin tag logic

4️⃣ Push to GitHub
git push

(First time only: git push -u origin main)

🚑 Oops Helpers

Forgot a file:

git add file && git commit --amend

Undo last commit (keep code):

git reset --soft HEAD~1

🧾 Ultra-Short Version (sticky note)
git status
git add .
git commit -m "message"
git push

---

Review, clean and learn all code step by step

Next features to be added:
Make posts editable and make drafts.
Build projects page
Add comments and likes (far future)
Allow to edit tags
