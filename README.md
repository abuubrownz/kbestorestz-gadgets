# KBestoreTZ Connect

KBestoreTZ Enterprise Digital Platform — Product Design Prompt

You are a senior product designer and frontend architect.

Create a premium digital platform prototype for KBestoreTZ, a technology retail and repair ecosystem based in Tanzania.

The goal is to transform KBestoreTZ from a traditional gadget shop into a complete technology services platform.

Do not create a simple eCommerce website.

Design a scalable platform ecosystem.

Brand Identity

Company:
KBestoreTZ

Industry:
Technology Retail + Device Repair + ICT Services

Brand personality:

Premium

Trustworthy

Innovative

Modern

Fast

Customer-focused

Design inspiration:

Apple Store simplicity

Stripe dashboard quality

Linear application polish

Modern SaaS platforms

Platform Structure

Create the following experiences:

1. Public Website

Pages:

Homepage

Include:

Hero section

Premium technology visuals

Featured products

Repair services

Why choose KBestoreTZ

Customer reviews

CTA sections

Products

Features:

Product categories

Search

Filters

Product cards

Product details

Categories:

Smartphones

Laptops

Tablets

Accessories

Gaming

Smart devices

2. Online Store

Create:

Shopping cart

Checkout flow

Customer account

Order tracking

Order states:

Pending

Processing

Shipped

Delivered

3. Repair Service Platform

Create a dedicated repair experience.

Customer flow:

Book Repair

↓

Select Device

↓

Describe Problem

↓

Upload Images

↓

Choose Appointment

↓

Receive Tracking Number

Repair dashboard:

Status timeline:

Submitted

Received

Diagnosis

Quotation

Approved

Repairing

Testing

Completed

Collected

4. Customer Dashboard

Create:

Dashboard sections:

Profile

Orders

Repairs

Appointments

Warranty

Loyalty points

Notifications

5. Technician Dashboard

Create:

Features:

Assigned repairs

Device information

Repair notes

Status updates

Parts used

Completion report

6. Admin Dashboard

Create an enterprise dashboard.

Sections:

Sales

Revenue

Orders

Products

Repairs

Active repairs

Technician workload

Completed repairs

Inventory

Stock levels

Low stock alerts

Suppliers

Customers

Customer activity

Loyalty

Analytics

Charts:

Sales trends

Repair trends

Product performance

Design System

Use:

Typography:

Modern sans-serif

High readability

Colors:

Primary:

Deep black

Secondary:

White

Accent:

Electric blue

Support colors:

Green:
Success

Orange:
Warning

Red:
Error

Components:

Create reusable:

Buttons

Cards

Tables

Forms

Modals

Sidebars

Navigation

Status badges

Responsive Design

Support:

Desktop

Tablet

Mobile

Mobile experience should feel like a native application.

Technical Expectations

Generate:

Clean component structure

Reusable UI components

Modern frontend architecture

Responsive layouts

Accessible interfaces

Prepare the design so it can later be implemented using:

Next.js

React

TypeScript

Tailwind CSS

shadcn/ui

Important

Focus on:

Premium user experience

Business scalability

Clear user journeys

Professional enterprise appearance

This is a prototype for a future East African technology ecosystem platform.


Premium Homepage

After the master prompt:
Create the KBestoreTZ premium homepage.

The homepage should communicate that KBestoreTZ is East Africa's trusted technology destination.

Sections:

Hero Section

Include:

Premium technology imagery

Main headline

Supporting description

Shop Now CTA

Book Repair CTA

Example positioning:

"Your Complete Technology Partner"

"Buy, repair, upgrade and manage your devices with confidence."

Featured Categories

Create cards:

Smartphones

Laptops

Tablets

Accessories

Gaming

Smart Home

Repair Services Section

Show:

Phone repair

Laptop repair

Software installation

Screen replacement

Battery replacement

Include:

"Book Repair Now"

Featured Products

Create:

Product cards

Ratings

Pricing

Add to cart

Why Choose KBestoreTZ

Cards:

Genuine products

Expert technicians

Warranty support

Fast service

Customer Reviews

Newsletter

Footer

Include:

Contact

Social links

Services

Locations

Design must feel premium, trustworthy, and modern.

eCommerce Module
Create the KBestoreTZ eCommerce experience.

Build:

Product Listing

Features:

Search

Filters

Categories

Brand filtering

Price filtering

Sorting

Product Detail Page

Include:

Image gallery

Product specifications

Price

Availability

Warranty

Reviews

Related products

Add to cart

Shopping Cart

Include:

Product list

Quantity update

Remove item

Price calculation

Checkout

Include:

Customer information

Delivery address

Payment method

Order summary

Customer Account

Include:

Orders

Saved products

Warranty

Reviews

Design should feel similar to premium electronics marketplaces.

PROMPT 4;Repair Management Platform
Create the KBestoreTZ device repair management experience.

The goal is to digitize phone, laptop, and tablet repairs.

Customer Repair Booking

Create workflow:

Step 1:
Select device

Examples:

iPhone

Samsung

Laptop

Tablet

Step 2:
Select problem

Examples:

Screen damage

Battery issue

Software problem

Charging problem

Step 3:
Upload images

Step 4:
Select appointment

Step 5:
Confirm request

Repair Tracking

Create timeline:

Submitted

↓

Received

↓

Diagnosis

↓

Quotation

↓

Approved

↓

Repairing

↓

Testing

↓

Completed

Technician Dashboard

Include:

Assigned repairs

Customer details

Device information

Repair notes

Status update

Design should feel like a professional service management system.

Admin Dashboard
Create the KBestoreTZ enterprise admin dashboard.

The dashboard manages the entire technology business.

Create:

Overview Dashboard

Show:

Revenue

Orders

Repairs

Customers

Inventory alerts

Product Management

Features:

Add product

Edit product

Stock management

Categories

Repair Management

Features:

Repair queue

Assign technician

Update status

Inventory

Include:

Products

Spare parts

Stock movement

Customer CRM

Include:

Customer profiles

History

Orders

Repairs

Analytics

Charts:

Sales trends

Popular products

Repair performance

Customer growth

Design:

Enterprise SaaS dashboard.
Clean.
Professional.
Data-focused.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7f53b4f1-8c2e-46ff-8e17-27d8350e8202).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

### Local development with Claude Code

Use Claude Code in VS Code to plan and implement changes. Keep each task on its own branch so production and the Lovable-connected `main` branch only receive reviewed work.

1. Clone the repository and install [Bun](https://bun.sh/docs/installation).
2. Create a feature branch from the latest `main`:

   ```sh
   git switch main
   git pull
   git switch -c feature/short-description
   ```

3. Open the repository in VS Code, start Claude Code, and describe the task, acceptance criteria, and any constraints. Review Claude's proposed edits and inspect the resulting diff before committing.
4. Run the checks locally:

   ```sh
   bun install --frozen-lockfile
   bun run build
   bun run lint
   bunx tsc --noEmit
   ```

5. Commit and push the feature branch, then open a pull request targeting `main`:

   ```sh
   git add .
   git commit -m "Describe the change"
   git push -u origin feature/short-description
   ```

6. Review the pull request on GitHub. Merge only after the required approval and the blocking `build` check pass. Merging to `main` syncs changes to Lovable; deploy behavior depends on the connected hosting configuration.

### Require review on GitHub

Repository administrators must configure this once in **Settings → Rules → Rulesets** (or **Branches → Add branch protection rule**) for `main`:

- Require a pull request before merging and at least one approval.
- Require the `build` status check from the `CI` workflow.
- Optionally dismiss stale approvals when new commits are pushed.
- Block force pushes and branch deletion.

GitHub does not let a pull request author approve their own pull request. Arrange for a second GitHub account/collaborator to review it; if you work alone, you can still review the diff and checks yourself, but merging will require an administrator bypass or a rule without required approval.

The `lint` and `typecheck` jobs currently report results but are non-blocking; make them required only after they are made reliable and blocking in `.github/workflows/ci.yml`. Repository settings cannot be enforced by this repository's files alone.

For local development, run:

```sh
bun install --frozen-lockfile
bun run dev
```
