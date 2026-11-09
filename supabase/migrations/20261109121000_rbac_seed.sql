-- KBestoreTZ: RBAC seed data (Phase 1, part 2 of 3).
--
-- Seeds the six approved roles, the fixed permission catalogue, the role-permission
-- matrix and the role-grant ceilings. Idempotent: safe to re-run in the SQL editor.
--
-- Permission codes are code-controlled. Super Admin may change role-to-permission
-- mappings later, but new permission strings require a migration and review.

-- 1. Roles -----------------------------------------------------------------------------
insert into public.roles (code, name, description, rank, is_system)
values
  ('customer', 'Customer',
   'Own account, orders, invoices, repairs, warranties and payments.', 10, true),
  ('technician', 'Technician',
   'Assigned repairs, diagnosis, estimates, parts usage and quality checks.', 20, true),
  ('store_manager', 'Store Manager',
   'Assigned branch operations: inventory, orders, repairs, staff supervision and branch reports.', 30, true),
  ('admin', 'Administrator',
   'Daily operations, customers, products, inventory, orders, repairs and limited staff administration.', 40, true),
  ('finance_officer', 'Finance Officer',
   'Payment verification, invoices, refunds within limits, reconciliation and financial reporting.', 40, true),
  ('super_admin', 'Super Admin',
   'Global platform, staff, roles, security, branch configuration, integrations and audit access.', 100, true)
on conflict (code) do update
  set name = excluded.name,
      description = excluded.description,
      rank = excluded.rank,
      is_system = excluded.is_system;

-- 2. Permission catalogue --------------------------------------------------------------
insert into public.permissions (code, name, domain, risk, description)
values
  -- Customer self-service baseline (every account holds CUSTOMER)
  ('account.read_own', 'Read own account', 'account', 'low',
   'Read the signed-in user''s own profile and contact details.'),
  ('account.update_own', 'Update own account', 'account', 'low',
   'Update the signed-in user''s own profile and contact details.'),
  ('orders.read_own', 'Read own orders', 'orders', 'low',
   'Read orders that belong to the signed-in customer.'),
  ('invoices.read_own', 'Read own invoices', 'invoices', 'low',
   'Read invoices that belong to the signed-in customer.'),
  ('payments.read_own', 'Read own payments', 'payments', 'low',
   'Read payments made by the signed-in customer.'),
  ('warranties.read_own', 'Read own warranties', 'warranties', 'low',
   'Read warranties registered to the signed-in customer.'),
  ('repairs.read_own', 'Read own repairs', 'repairs', 'low',
   'Read repair tickets that belong to the signed-in customer.'),
  ('repairs.book_own', 'Book own repairs', 'repairs', 'low',
   'Create a repair booking for the signed-in customer.'),
  ('repairs.track_own', 'Track own repairs', 'repairs', 'low',
   'Track an own repair with its reference number and a verified OTP.'),

  -- Customers and catalogue
  ('customers.read', 'Read customers', 'customers', 'medium',
   'Read customer records within the actor''s branch scope.'),
  ('customers.update', 'Update customers', 'customers', 'medium',
   'Update permitted customer details within the actor''s branch scope.'),
  ('products.read', 'Read products', 'products', 'low',
   'Read product records, including unpublished fields allowed to staff.'),
  ('products.create', 'Create products', 'products', 'medium',
   'Create catalogue products.'),
  ('products.update', 'Update products', 'products', 'medium',
   'Edit prices, descriptions, publication state and product media.'),

  -- Inventory
  ('inventory.read', 'Read inventory', 'inventory', 'low',
   'Read stock levels and movements within the actor''s branch scope.'),
  ('inventory.adjust', 'Adjust inventory', 'inventory', 'high',
   'Record stock adjustments with a reason and movement entry.'),
  ('inventory.transfer', 'Transfer inventory', 'inventory', 'high',
   'Transfer stock between branches with authority over both branches.'),

  -- Orders
  ('orders.read', 'Read orders', 'orders', 'medium',
   'Read orders within the actor''s branch scope.'),
  ('orders.manage', 'Manage orders', 'orders', 'high',
   'Create, update or cancel orders within the actor''s branch scope.'),

  -- Repairs
  ('repairs.read', 'Read repairs', 'repairs', 'medium',
   'Read repair tickets within the actor''s branch scope. Technicians still only see assigned tickets.'),
  ('repairs.assign', 'Assign repairs', 'repairs', 'medium',
   'Assign a repair ticket to a technician within the branch.'),
  ('repairs.update_status', 'Update repair status', 'repairs', 'medium',
   'Move an assigned repair through its approved stages.'),
  ('repairs.estimate.create', 'Create repair estimates', 'repairs', 'medium',
   'Prepare a diagnosis and repair estimate.'),
  ('repairs.approve_estimate', 'Approve repair estimates', 'repairs', 'high',
   'Approve an estimate for a customer. The creator cannot approve their own estimate.'),
  ('repairs.parts.manage', 'Manage repair parts', 'repairs', 'high',
   'Record parts used on a repair and adjust the related stock.'),
  ('repairs.quality_check', 'Repair quality checks', 'repairs', 'medium',
   'Record the technical quality check before a repair is released.'),
  ('warranties.read', 'Read warranties', 'warranties', 'medium',
   'Read warranty records within the actor''s scope.'),
  ('warranties.manage', 'Manage warranties', 'warranties', 'high',
   'Create, update or void warranty records.'),

  -- Finance
  ('invoices.read', 'Read invoices', 'invoices', 'medium',
   'Read invoices within the actor''s branch scope.'),
  ('invoices.manage', 'Manage invoices', 'invoices', 'high',
   'Create, issue, correct or void invoices.'),
  ('payments.read', 'Read payments', 'payments', 'medium',
   'Read payments within the actor''s branch scope.'),
  ('payments.verify', 'Verify payments', 'payments', 'high',
   'Verify a payment against the bank, mobile-money or card record.'),
  ('payments.reconcile', 'Reconcile payments', 'payments', 'high',
   'Reconcile payments and settlements against the ledger.'),
  ('refunds.request', 'Request refunds', 'refunds', 'medium',
   'Request a refund for a customer.'),
  ('refunds.approve', 'Approve refunds', 'refunds', 'critical',
   'Approve a refund within the approval limit. The requester cannot approve their own refund.'),
  ('refunds.process', 'Process refunds', 'refunds', 'critical',
   'Execute an approved refund and record the transaction reference.'),
  ('reports.financial.read', 'Read financial reports', 'reports', 'high',
   'Read revenue, settlement, refund and reconciliation reports.'),

  -- Administration and reporting
  ('reports.operational.read', 'Read operational reports', 'reports', 'medium',
   'Read branch sales, repair and inventory reports.'),
  ('reports.global.read', 'Read global reports', 'reports', 'high',
   'Read cross-branch and platform-wide reports.'),
  ('staff.read', 'Read staff', 'staff', 'medium',
   'Read staff employment records and branch assignments within scope.'),
  ('staff.manage', 'Manage staff', 'staff', 'high',
   'Manage employment records, schedules and operational notes. Does not include role assignment.'),
  ('roles.read', 'Read roles', 'roles', 'medium',
   'Read role definitions and existing role assignments.'),
  ('roles.assign', 'Assign roles', 'roles', 'critical',
   'Grant or revoke assignable roles within the grant ceiling. Never to self.'),
  ('permissions.manage', 'Manage permissions', 'permissions', 'critical',
   'Change role-to-permission mappings and security configuration.'),
  ('branches.read', 'Read branches', 'branches', 'low',
   'Read branch records.'),
  ('branches.manage', 'Manage branches', 'branches', 'critical',
   'Create, update or deactivate branches.'),
  ('audit_logs.read', 'Read audit logs', 'audit_logs', 'critical',
   'Read the append-only privileged-action audit log.'),
  ('system.settings.manage', 'Manage system settings', 'system', 'critical',
   'Change platform-wide settings.'),
  ('system.integrations.manage', 'Manage integrations', 'system', 'critical',
   'Configure payment, SMS, email and other external integrations.'),
  ('access.cross_branch', 'Cross-branch access', 'access', 'critical',
   'Apply existing base permissions across branches. Grants no new base capability.')
on conflict (code) do update
  set name = excluded.name,
      domain = excluded.domain,
      risk = excluded.risk,
      description = excluded.description,
      is_system = excluded.is_system;

-- 3. Role to permission matrix ---------------------------------------------------------
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code = 'customer'
  and p.code = any (array[
    'account.read_own', 'account.update_own',
    'orders.read_own', 'invoices.read_own', 'payments.read_own',
    'warranties.read_own', 'repairs.read_own', 'repairs.book_own', 'repairs.track_own'
  ]::text[])
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code = 'technician'
  and p.code = any (array[
    'products.read', 'inventory.read',
    'repairs.read', 'repairs.update_status', 'repairs.estimate.create',
    'repairs.parts.manage', 'repairs.quality_check',
    'branches.read'
  ]::text[])
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code = 'admin'
  and p.code = any (array[
    'customers.read', 'customers.update',
    'products.read', 'products.create', 'products.update',
    'inventory.read', 'inventory.adjust', 'inventory.transfer',
    'orders.read', 'orders.manage',
    'repairs.read', 'repairs.assign', 'repairs.update_status',
    'repairs.estimate.create', 'repairs.approve_estimate',
    'repairs.parts.manage', 'repairs.quality_check',
    'warranties.read', 'warranties.manage',
    'invoices.read', 'payments.read', 'refunds.request',
    'reports.operational.read',
    'staff.read', 'staff.manage',
    'roles.read', 'roles.assign',
    'branches.read'
  ]::text[])
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code = 'store_manager'
  and p.code = any (array[
    'customers.read', 'customers.update',
    'products.read',
    'inventory.read', 'inventory.adjust',
    'orders.read', 'orders.manage',
    'repairs.read', 'repairs.assign', 'repairs.update_status',
    'repairs.estimate.create', 'repairs.approve_estimate',
    'repairs.parts.manage', 'repairs.quality_check',
    'warranties.read', 'warranties.manage',
    'invoices.read', 'payments.read', 'refunds.request',
    'reports.operational.read',
    'staff.read', 'staff.manage',
    'branches.read'
  ]::text[])
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code = 'finance_officer'
  and p.code = any (array[
    'customers.read', 'products.read', 'orders.read',
    'invoices.read', 'invoices.manage',
    'payments.read', 'payments.verify', 'payments.reconcile',
    'refunds.request', 'refunds.approve', 'refunds.process',
    'reports.financial.read',
    'branches.read'
  ]::text[])
on conflict do nothing;

-- Super Admin holds every permission. Branch scope is still explicit per assignment.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code = 'super_admin'
on conflict do nothing;

-- 4. Grant ceilings --------------------------------------------------------------------
-- Rank alone is not enough: the actor role must be listed here for the target role.
insert into public.role_assignment_rules (actor_role_id, target_role_id, requires_approval)
select actor.id, target.id,
  target.code in ('admin', 'finance_officer', 'super_admin')
from public.roles actor
cross join public.roles target
where (
    actor.code = 'super_admin'
    and target.code in ('technician', 'store_manager', 'admin', 'finance_officer', 'super_admin')
  )
  or (
    actor.code = 'admin'
    and target.code in ('technician', 'store_manager')
  )
on conflict (actor_role_id, target_role_id) do update
  set requires_approval = excluded.requires_approval;

-- 5. High-risk combinations ------------------------------------------------------------
-- Flagged for Super Admin approval and periodic review, not blocked outright.
insert into public.role_conflict_rules (role_a_id, role_b_id, severity, requires_super_admin)
select a.id, b.id, 'warn', true
from public.roles a
join public.roles b on b.code = 'finance_officer'
where a.code = 'admin'
on conflict (role_a_id, role_b_id) do nothing;

insert into public.role_conflict_rules (role_a_id, role_b_id, severity, requires_super_admin)
select a.id, b.id, 'warn', true
from public.roles a
join public.roles b on b.code = 'finance_officer'
where a.code = 'store_manager'
on conflict (role_a_id, role_b_id) do nothing;
