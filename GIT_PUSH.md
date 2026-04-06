# Git push (GitHub)

**Remote:** `https://github.com/itconsultantbryant-svg/pgc_hr_system.git`

## Settings that reduce HTTP 400 / pack errors

Applied globally (safe to keep):

```bash
git config --global http.postBuffer 524288000
git config --global http.version HTTP/1.1
```

## Push

```bash
git push -u origin main
```

- **HTTPS:** username = your GitHub username (`itconsultantbryant-svg`), password = **Personal Access Token** (not your GitHub password). Scope: **`repo`** (classic) or fine-grained repo **Contents: Read and write**.

## SSH (optional)

```bash
git remote set-url origin git@github.com:itconsultantbryant-svg/pgc_hr_system.git
ssh-add ~/.ssh/id_ed25519   # if needed
git push -u origin main
```

Add your **public** SSH key to GitHub → **Settings → SSH and GPG keys** for this account.

## Why 403 happened before

- **`origin`** pointed at **`samsonbryant/...`** while your machine logged in as **`itconsultantbryant-svg`** (or another user) → permission denied.
- Fix: **`origin`** must be a repo **your account can write to** (e.g. **`itconsultantbryant-svg/pgc_hr_system`**).

## Security

- Do not commit **PATs** or embed tokens in the remote URL long term.
- Revoke any token that was pasted into chat or committed.
