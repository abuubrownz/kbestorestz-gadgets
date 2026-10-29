<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Sitemap static URLs derive from required route staticData.sitemap decisions; dynamic product URLs use the storefront's local public collection, so private workflows never enter the inventory.

# Working agreement for every coding agent

Read `docs/ENGINEERING_STATUS.md` before changing anything. It holds the verified system state,
the branch map, the real-vs-sample map, and the current Now/Next/Blocked list.

Non-negotiables:

1. **Never rewrite published git history** (see the Lovable note above).
2. **One workstream = one branch = one pull request.** Keep `main` buildable.
3. **Do not apply database migrations, deploy, enable live SMS/email/payments, or change auth/PII
   without explicit CTO approval.** Migration files are written to be reviewed, not run by an agent.
4. **Never merge or push `refs/agents/...` checkpoint refs**, and never commit secrets.
5. **Definition of done:** `bun run build` passes, `tsc --noEmit` passes, the change is described in
   the PR, new tables have least-privilege RLS, and `docs/ENGINEERING_STATUS.md` is updated.
6. **Handoff:** report branch, commit, commands run, results, anything unverified, and the next
   concrete step. Leave the tree clean or list every uncommitted file.

The stack is TanStack Start + React 19 + Vite + Tailwind 4 + shadcn/ui + Supabase — not Next.js.
Business screens currently read sample data from `src/lib/data.ts`; only authentication is real.
