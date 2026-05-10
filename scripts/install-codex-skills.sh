#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repo_skills_dir="$repo_root/.codex/skills"
codex_skills_dir="${CODEX_HOME:-$HOME/.codex}/skills"

skills=(
  "teleport-implementation-loop"
  "teleport-triage-divergence"
  "teleport-dehack-simplify"
)

mkdir -p "$codex_skills_dir"

for skill in "${skills[@]}"; do
  src="$repo_skills_dir/$skill"
  dst="$codex_skills_dir/$skill"

  if [[ ! -d "$src" ]]; then
    echo "missing repo skill: $src" >&2
    exit 1
  fi

  rm -rf "$dst"
  ln -s "$src" "$dst"
  echo "linked $dst -> $src"
done
