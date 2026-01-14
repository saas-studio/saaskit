/**
 * Seed Script for Project Tracker Example
 *
 * Generates realistic sample data for demonstrating kanban workflows
 * and task management patterns.
 *
 * Usage:
 *   npx ts-node examples/project-tracker/seed.ts
 *   # or
 *   project-tracker seed
 */

import { parseSchemaYaml, DataStore } from '../../packages/schema/src'
import { readFileSync } from 'fs'
import { join } from 'path'

// =============================================================================
// Types
// =============================================================================

interface User {
	id: string
	name: string
	email: string
	role: 'admin' | 'member' | 'viewer'
	avatar_url?: string
	created_at: string
}

interface Project {
	id: string
	name: string
	description: string
	status: 'active' | 'completed' | 'on_hold'
	start_date: string
	due_date: string
	owner_id: string
	created_at: string
	updated_at: string
}

interface Task {
	id: string
	title: string
	description: string
	status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
	priority: 'P0' | 'P1' | 'P2' | 'P3'
	project_id: string
	assignee_id?: string
	due_date?: string
	estimated_hours?: number
	actual_hours?: number
	created_at: string
	updated_at: string
}

interface Comment {
	id: string
	task_id: string
	user_id: string
	content: string
	created_at: string
}

interface Label {
	id: string
	name: string
	color: string
}

interface TaskLabel {
	id: string
	task_id: string
	label_id: string
	created_at: string
}

// =============================================================================
// ID Generation
// =============================================================================

function generateId(prefix: string): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
	let id = ''
	for (let i = 0; i < 8; i++) {
		id += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return `${prefix}_${id}`
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
}

// =============================================================================
// Date Helpers
// =============================================================================

function daysFromNow(days: number): string {
	const date = new Date()
	date.setDate(date.getDate() + days)
	return date.toISOString().split('T')[0]
}

function daysAgo(days: number): string {
	return daysFromNow(-days)
}

function now(): string {
	return new Date().toISOString()
}

// =============================================================================
// Seed Data
// =============================================================================

export function generateSeedData() {
	// ---------------------------------------------------------------------------
	// Users
	// ---------------------------------------------------------------------------
	const users: User[] = [
		{
			id: 'usr_sarah001',
			name: 'Sarah Chen',
			email: 'sarah@example.com',
			role: 'admin',
			avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
			created_at: daysAgo(90),
		},
		{
			id: 'usr_mike002',
			name: 'Mike Johnson',
			email: 'mike@example.com',
			role: 'member',
			avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
			created_at: daysAgo(60),
		},
		{
			id: 'usr_alex003',
			name: 'Alex Rivera',
			email: 'alex@example.com',
			role: 'member',
			avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
			created_at: daysAgo(45),
		},
	]

	// ---------------------------------------------------------------------------
	// Projects
	// ---------------------------------------------------------------------------
	const projects: Project[] = [
		{
			id: 'prj_webapp01',
			name: 'Website Redesign',
			description:
				'Complete overhaul of the marketing website with new branding, improved UX, and mobile-first responsive design. Includes homepage, product pages, blog, and contact forms.',
			status: 'active',
			start_date: daysAgo(14),
			due_date: daysFromNow(30),
			owner_id: 'usr_sarah001',
			created_at: daysAgo(14),
			updated_at: daysAgo(1),
		},
	]

	// ---------------------------------------------------------------------------
	// Labels
	// ---------------------------------------------------------------------------
	const labels: Label[] = [
		{ id: 'lbl_bug001', name: 'bug', color: '#ef4444' },
		{ id: 'lbl_feat002', name: 'feature', color: '#22c55e' },
		{ id: 'lbl_urgent003', name: 'urgent', color: '#f59e0b' },
		{ id: 'lbl_frontend004', name: 'frontend', color: '#3b82f6' },
		{ id: 'lbl_backend005', name: 'backend', color: '#8b5cf6' },
	]

	// ---------------------------------------------------------------------------
	// Tasks - Distributed across kanban columns
	// ---------------------------------------------------------------------------
	const tasks: Task[] = [
		// BACKLOG (3 tasks)
		{
			id: 'tsk_research01',
			title: 'Research authentication libraries',
			description:
				'Evaluate Auth0, Clerk, and NextAuth for SSO integration. Consider pricing, features, and developer experience.',
			status: 'backlog',
			priority: 'P2',
			project_id: 'prj_webapp01',
			assignee_id: undefined,
			due_date: undefined,
			estimated_hours: 8,
			created_at: daysAgo(10),
			updated_at: daysAgo(10),
		},
		{
			id: 'tsk_explore02',
			title: 'Explore new animation library',
			description:
				'Look into Framer Motion vs GSAP for page transitions and micro-interactions.',
			status: 'backlog',
			priority: 'P3',
			project_id: 'prj_webapp01',
			assignee_id: undefined,
			estimated_hours: 4,
			created_at: daysAgo(8),
			updated_at: daysAgo(8),
		},
		{
			id: 'tsk_i18n03',
			title: 'Plan internationalization strategy',
			description:
				'Define supported languages and translation workflow for future multi-language support.',
			status: 'backlog',
			priority: 'P3',
			project_id: 'prj_webapp01',
			assignee_id: undefined,
			estimated_hours: 6,
			created_at: daysAgo(7),
			updated_at: daysAgo(7),
		},

		// TODO (3 tasks)
		{
			id: 'tsk_design04',
			title: 'Design database schema',
			description:
				'Create ERD for user accounts, blog posts, and contact submissions. Include indexes and relationships.',
			status: 'todo',
			priority: 'P1',
			project_id: 'prj_webapp01',
			assignee_id: 'usr_mike002',
			due_date: daysFromNow(5),
			estimated_hours: 12,
			created_at: daysAgo(6),
			updated_at: daysAgo(2),
		},
		{
			id: 'tsk_tests05',
			title: 'Write API integration tests',
			description:
				'Set up Jest and write tests for all REST endpoints. Aim for 80% coverage.',
			status: 'todo',
			priority: 'P2',
			project_id: 'prj_webapp01',
			assignee_id: 'usr_sarah001',
			due_date: daysFromNow(7),
			estimated_hours: 16,
			created_at: daysAgo(5),
			updated_at: daysAgo(3),
		},
		{
			id: 'tsk_docs06',
			title: 'Update API documentation',
			description: 'Document all endpoints in OpenAPI spec. Generate SDK from spec.',
			status: 'todo',
			priority: 'P3',
			project_id: 'prj_webapp01',
			assignee_id: 'usr_mike002',
			due_date: daysFromNow(10),
			estimated_hours: 8,
			created_at: daysAgo(4),
			updated_at: daysAgo(4),
		},

		// IN PROGRESS (2 tasks)
		{
			id: 'tsk_api07',
			title: 'Build REST API endpoints',
			description:
				'Implement CRUD operations for users, posts, and contacts. Use Hono framework with Zod validation.',
			status: 'in_progress',
			priority: 'P0',
			project_id: 'prj_webapp01',
			assignee_id: 'usr_alex003',
			due_date: daysFromNow(3),
			estimated_hours: 24,
			actual_hours: 16,
			created_at: daysAgo(7),
			updated_at: now(),
		},
		{
			id: 'tsk_auth08',
			title: 'Implement auth flow',
			description:
				'Set up login, logout, and password reset flows. Include email verification.',
			status: 'in_progress',
			priority: 'P1',
			project_id: 'prj_webapp01',
			assignee_id: 'usr_sarah001',
			due_date: daysFromNow(4),
			estimated_hours: 20,
			actual_hours: 8,
			created_at: daysAgo(5),
			updated_at: now(),
		},

		// REVIEW (2 tasks)
		{
			id: 'tsk_homepage09',
			title: 'Design homepage layout',
			description:
				'Create responsive homepage with hero section, features grid, testimonials, and CTA.',
			status: 'review',
			priority: 'P1',
			project_id: 'prj_webapp01',
			assignee_id: 'usr_mike002',
			due_date: daysAgo(1),
			estimated_hours: 16,
			actual_hours: 18,
			created_at: daysAgo(10),
			updated_at: daysAgo(1),
		},
		{
			id: 'tsk_mobile10',
			title: 'Mobile responsive fixes',
			description:
				'Fix navigation collapse on mobile, adjust typography scaling, and test on various devices.',
			status: 'review',
			priority: 'P1',
			project_id: 'prj_webapp01',
			assignee_id: 'usr_alex003',
			due_date: daysFromNow(1),
			estimated_hours: 8,
			actual_hours: 10,
			created_at: daysAgo(4),
			updated_at: daysAgo(1),
		},

		// DONE (2 tasks)
		{
			id: 'tsk_setup11',
			title: 'Project setup and CI/CD',
			description:
				'Initialize repo, set up Next.js, configure ESLint/Prettier, and create GitHub Actions pipeline.',
			status: 'done',
			priority: 'P0',
			project_id: 'prj_webapp01',
			assignee_id: 'usr_sarah001',
			due_date: daysAgo(10),
			estimated_hours: 8,
			actual_hours: 6,
			created_at: daysAgo(14),
			updated_at: daysAgo(10),
		},
		{
			id: 'tsk_figma12',
			title: 'Create Figma design system',
			description:
				'Build component library with colors, typography, spacing, and core UI components.',
			status: 'done',
			priority: 'P1',
			project_id: 'prj_webapp01',
			assignee_id: 'usr_mike002',
			due_date: daysAgo(7),
			estimated_hours: 12,
			actual_hours: 14,
			created_at: daysAgo(12),
			updated_at: daysAgo(7),
		},
	]

	// ---------------------------------------------------------------------------
	// Comments
	// ---------------------------------------------------------------------------
	const comments: Comment[] = [
		{
			id: 'cmt_001',
			task_id: 'tsk_api07',
			user_id: 'usr_sarah001',
			content:
				'Looking good so far! Can you add rate limiting to the endpoints before we deploy?',
			created_at: daysAgo(2),
		},
		{
			id: 'cmt_002',
			task_id: 'tsk_api07',
			user_id: 'usr_alex003',
			content:
				"Good call - I'll add it using the built-in Hono rate limiter. Should be done by EOD.",
			created_at: daysAgo(2),
		},
		{
			id: 'cmt_003',
			task_id: 'tsk_homepage09',
			user_id: 'usr_sarah001',
			content:
				'The hero section looks great! One small thing - can we make the CTA button slightly larger on mobile?',
			created_at: daysAgo(1),
		},
		{
			id: 'cmt_004',
			task_id: 'tsk_homepage09',
			user_id: 'usr_mike002',
			content: 'Updated! Check the latest deploy preview.',
			created_at: daysAgo(1),
		},
		{
			id: 'cmt_005',
			task_id: 'tsk_auth08',
			user_id: 'usr_alex003',
			content:
				'Are we using magic links or traditional password auth? Or both?',
			created_at: daysAgo(3),
		},
		{
			id: 'cmt_006',
			task_id: 'tsk_auth08',
			user_id: 'usr_sarah001',
			content:
				"Let's support both - magic links as primary with password as fallback. Some enterprise customers require passwords.",
			created_at: daysAgo(3),
		},
	]

	// ---------------------------------------------------------------------------
	// Task Labels
	// ---------------------------------------------------------------------------
	const taskLabels: TaskLabel[] = [
		{
			id: 'tl_001',
			task_id: 'tsk_api07',
			label_id: 'lbl_backend005',
			created_at: daysAgo(7),
		},
		{
			id: 'tl_002',
			task_id: 'tsk_api07',
			label_id: 'lbl_feat002',
			created_at: daysAgo(7),
		},
		{
			id: 'tl_003',
			task_id: 'tsk_auth08',
			label_id: 'lbl_backend005',
			created_at: daysAgo(5),
		},
		{
			id: 'tl_004',
			task_id: 'tsk_auth08',
			label_id: 'lbl_feat002',
			created_at: daysAgo(5),
		},
		{
			id: 'tl_005',
			task_id: 'tsk_homepage09',
			label_id: 'lbl_frontend004',
			created_at: daysAgo(10),
		},
		{
			id: 'tl_006',
			task_id: 'tsk_homepage09',
			label_id: 'lbl_feat002',
			created_at: daysAgo(10),
		},
		{
			id: 'tl_007',
			task_id: 'tsk_mobile10',
			label_id: 'lbl_frontend004',
			created_at: daysAgo(4),
		},
		{
			id: 'tl_008',
			task_id: 'tsk_mobile10',
			label_id: 'lbl_bug001',
			created_at: daysAgo(4),
		},
		{
			id: 'tl_009',
			task_id: 'tsk_setup11',
			label_id: 'lbl_backend005',
			created_at: daysAgo(14),
		},
		{
			id: 'tl_010',
			task_id: 'tsk_figma12',
			label_id: 'lbl_frontend004',
			created_at: daysAgo(12),
		},
	]

	return {
		users,
		projects,
		tasks,
		comments,
		labels,
		taskLabels,
	}
}

// =============================================================================
// Seeder Class
// =============================================================================

export class ProjectTrackerSeeder {
	private store: DataStore

	constructor() {
		// Load and parse the schema
		const schemaPath = join(import.meta.dir || __dirname, 'schema.yaml')
		const schemaYaml = readFileSync(schemaPath, 'utf-8')
		const schema = parseSchemaYaml(schemaYaml)
		this.store = new DataStore(schema)
	}

	async seed(): Promise<void> {
		const data = generateSeedData()

		console.log('Seeding project-tracker database...\n')

		// Seed users
		for (const user of data.users) {
			this.store.create('users', user)
		}
		console.log(`  Created ${data.users.length} users`)

		// Seed projects
		for (const project of data.projects) {
			this.store.create('projects', project)
		}
		console.log(`  Created ${data.projects.length} projects`)

		// Seed labels
		for (const label of data.labels) {
			this.store.create('labels', label)
		}
		console.log(`  Created ${data.labels.length} labels`)

		// Seed tasks
		for (const task of data.tasks) {
			this.store.create('tasks', task)
		}
		console.log(`  Created ${data.tasks.length} tasks`)

		// Seed comments
		for (const comment of data.comments) {
			this.store.create('comments', comment)
		}
		console.log(`  Created ${data.comments.length} comments`)

		// Seed task labels
		for (const taskLabel of data.taskLabels) {
			this.store.create('task_labels', taskLabel)
		}
		console.log(`  Created ${data.taskLabels.length} task-label associations`)

		// Print summary
		this.printSummary(data)
	}

	private printSummary(data: ReturnType<typeof generateSeedData>): void {
		const tasksByStatus = {
			backlog: data.tasks.filter((t) => t.status === 'backlog').length,
			todo: data.tasks.filter((t) => t.status === 'todo').length,
			in_progress: data.tasks.filter((t) => t.status === 'in_progress').length,
			review: data.tasks.filter((t) => t.status === 'review').length,
			done: data.tasks.filter((t) => t.status === 'done').length,
		}

		console.log('\n' + '='.repeat(60))
		console.log('SEED COMPLETE')
		console.log('='.repeat(60))
		console.log(`
Project: ${data.projects[0].name}
Owner: ${data.users.find((u) => u.id === data.projects[0].owner_id)?.name}
Timeline: ${data.projects[0].start_date} to ${data.projects[0].due_date}

Team:
${data.users.map((u) => `  - ${u.name} (${u.role})`).join('\n')}

Kanban Board:
  BACKLOG (${tasksByStatus.backlog}) | TODO (${tasksByStatus.todo}) | IN PROGRESS (${tasksByStatus.in_progress}) | REVIEW (${tasksByStatus.review}) | DONE (${tasksByStatus.done})

Labels:
${data.labels.map((l) => `  - ${l.name} (${l.color})`).join('\n')}

Total: ${data.tasks.length} tasks, ${data.comments.length} comments
`)
	}

	getStore() {
		return this.store
	}
}

// =============================================================================
// CLI Entry Point
// =============================================================================

async function main() {
	const seeder = new ProjectTrackerSeeder()
	await seeder.seed()
}

// Run if executed directly
if (require.main === module) {
	main().catch(console.error)
}

export { main as seed }
