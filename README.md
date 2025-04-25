#MERGING AND CLONING THE MAIN/ORIGIN FOR DEVELOPMENT

---

# FOR SHARED BRANCHES
Example: The branch name is sample-branch
```bash
git checkout -b sample-branch
git push -u  sample-branch
```
##Clone the repo or pull the branch

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
git checkout sample-branch
```
---
1. Edit code or create
2. Stage and commit
```bash
git add .
git commit -m "your message"
```
3. Pull before pushing(to avoid conflicts):
 ```bash
git pull origin sample-auth
```  
4. Then push
```bash
git push origin sample-auth
```
