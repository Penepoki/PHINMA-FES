# MERGING AND CLONING THE MAIN/ORIGIN FOR DEVELOPMENT AND TUTORIALS FOR A COLLABORATIVE WORKFLOW

### Note: If you dont have the files or havent clone the repository yet, follow these steps
 We will use this current repository as an example. [https://github.com/Tinangeli/merged-front-back
]
And the example branch is named: samplemerged

### Select a Folder or path

Select a folder you've want to put/clone the project. After selecting,
From Github, copy the repo's URL (HTTPS preferred), then run: 
```bash
git clone https://github.com/Tinangeli/merged-front-back
```

### Then go to that path or folder
```bash
cd to-the-name-of-the-repo-folder
```

---

# Checkout the shared branch
## If the branch already exist:
run:
```bash
git fetch origin
git checkout samplemerged
```
Example branch: samplemerged

## If creating a new branch
```bash
 git checkout -b samplemerged
 git push -u origin samplemerged
```
Example branch: samplemerged

---

# For Collaborative tutorial

## ALWAYS SYNC WITH THE REMOTE REPOSITORY:

Check remote version if any updates or pushes were made by others:

```bash
git fetch origin Branch-Name
```

After making changes
```bash
git add .
git commit -m "Your message"
```
Pull latest changes(For conflict avoidance)
```bash
git pull origin samplemerged
```

If no conflicts, you are ready to push:
```bash
git push origin samplemerged
```

# Smooth merging tips:
1. Always [git pull] before [git push]
2. Communicate, messages about what changed and worked at.
3. If there's a conflict, Git detects and marks the files. Manually edit and fix them. then:
```bash
git add .
git commit -m "Your message here"
git push origin samplemerged
```


