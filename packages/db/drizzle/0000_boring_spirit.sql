CREATE TYPE "public"."ai_action_type" AS ENUM('generate_title', 'improve_title', 'summarize_slide', 'generate_speaker_notes', 'explain_for_teaching', 'make_executive', 'suggest_visibility', 'propose_conclusion');--> statement-breakpoint
CREATE TYPE "public"."ai_suggestion_status" AS ENUM('pending', 'accepted', 'edited', 'rejected', 'failed');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('source_notebook', 'output_image', 'output_svg', 'output_html', 'data_frame', 'thumbnail', 'export_html', 'export_zip', 'export_pdf', 'export_pptx', 'export_nbxp', 'theme_asset', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."block_type" AS ENUM('markdown', 'code', 'output', 'image', 'table', 'html', 'latex', 'log', 'error', 'ai_summary', 'placeholder');--> statement-breakpoint
CREATE TYPE "public"."cell_type" AS ENUM('markdown', 'code', 'raw', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."export_type" AS ENUM('html', 'html_zip', 'pdf', 'pptx', 'nbxp');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('queued', 'running', 'completed', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."notebook_processing_status" AS ENUM('idle', 'queued', 'processing', 'processed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notebook_validation_status" AS ENUM('pending', 'validating', 'valid', 'invalid');--> statement-breakpoint
CREATE TYPE "public"."output_type" AS ENUM('execute_result', 'display_data', 'stream', 'error', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."presentation_mode" AS ENUM('default', 'executive', 'teaching', 'research');--> statement-breakpoint
CREATE TYPE "public"."presentation_status" AS ENUM('draft', 'ready', 'archived');--> statement-breakpoint
CREATE TYPE "public"."render_strategy" AS ENUM('markdown', 'code', 'plain_text', 'html_sanitized', 'html_sandboxed', 'image', 'svg', 'latex', 'data_frame', 'stream', 'error', 'placeholder', 'unsupported');--> statement-breakpoint
CREATE TYPE "public"."slide_layout" AS ENUM('title', 'section', 'content', 'code_output', 'output_focus', 'figure_focus', 'table_focus', 'comparison', 'appendix');--> statement-breakpoint
CREATE TYPE "public"."slide_status" AS ENUM('normal', 'too_dense', 'has_unsupported_output', 'has_hidden_logs', 'needs_review');--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"actor_user_id" uuid,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"event_type" text NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"presentation_id" uuid NOT NULL,
	"slide_id" uuid,
	"requested_by_user_id" uuid,
	"action_type" "ai_action_type" NOT NULL,
	"status" "ai_suggestion_status" DEFAULT 'pending' NOT NULL,
	"input_context_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"suggestion_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"applied_patch_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"source_notebook_id" uuid,
	"source_cell_id" uuid,
	"source_output_id" uuid,
	"asset_type" "asset_type" NOT NULL,
	"storage_key" text NOT NULL,
	"filename" text,
	"media_type" text NOT NULL,
	"byte_size" integer DEFAULT 0 NOT NULL,
	"sha256" text,
	"width" integer,
	"height" integer,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "export_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"presentation_id" uuid NOT NULL,
	"requested_by_user_id" uuid,
	"result_asset_id" uuid,
	"export_type" "export_type" NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notebook_cells" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_notebook_id" uuid NOT NULL,
	"cell_index" integer NOT NULL,
	"cell_type" "cell_type" NOT NULL,
	"execution_count" integer,
	"source" text DEFAULT '' NOT NULL,
	"classification" text,
	"is_noise" boolean DEFAULT false NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notebook_outputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notebook_cell_id" uuid NOT NULL,
	"output_index" integer NOT NULL,
	"output_type" "output_type" NOT NULL,
	"mime_type" text,
	"render_strategy" "render_strategy" DEFAULT 'unsupported' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_noise" boolean DEFAULT false NOT NULL,
	"data_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presentations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"source_notebook_id" uuid,
	"theme_id" uuid,
	"title" text NOT NULL,
	"mode" "presentation_mode" DEFAULT 'default' NOT NULL,
	"status" "presentation_status" DEFAULT 'draft' NOT NULL,
	"presentation_model_version" text DEFAULT '1.0.0' NOT NULL,
	"settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"presentation_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"token_hash" text NOT NULL,
	"permissions_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slide_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slide_id" uuid NOT NULL,
	"source_cell_id" uuid,
	"source_output_id" uuid,
	"asset_id" uuid,
	"block_order" integer NOT NULL,
	"block_type" "block_type" NOT NULL,
	"content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"visibility_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"render_config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presentation_id" uuid NOT NULL,
	"slide_order" integer NOT NULL,
	"title" text,
	"subtitle" text,
	"layout" "slide_layout" DEFAULT 'content' NOT NULL,
	"status" "slide_status" DEFAULT 'normal' NOT NULL,
	"speaker_notes" text,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_notebooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"original_filename" text NOT NULL,
	"storage_key" text NOT NULL,
	"sha256" text,
	"file_size_bytes" integer,
	"nbformat" integer,
	"nbformat_minor" integer,
	"validation_status" "notebook_validation_status" DEFAULT 'pending' NOT NULL,
	"processing_status" "notebook_processing_status" DEFAULT 'idle' NOT NULL,
	"cell_count" integer DEFAULT 0 NOT NULL,
	"output_count" integer DEFAULT 0 NOT NULL,
	"detected_mime_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"validation_errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"validation_warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_builtin" boolean DEFAULT true NOT NULL,
	"tokens_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_presentation_id_presentations_id_fk" FOREIGN KEY ("presentation_id") REFERENCES "public"."presentations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_slide_id_slides_id_fk" FOREIGN KEY ("slide_id") REFERENCES "public"."slides"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_source_notebook_id_source_notebooks_id_fk" FOREIGN KEY ("source_notebook_id") REFERENCES "public"."source_notebooks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_source_cell_id_notebook_cells_id_fk" FOREIGN KEY ("source_cell_id") REFERENCES "public"."notebook_cells"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_source_output_id_notebook_outputs_id_fk" FOREIGN KEY ("source_output_id") REFERENCES "public"."notebook_outputs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_presentation_id_presentations_id_fk" FOREIGN KEY ("presentation_id") REFERENCES "public"."presentations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_result_asset_id_assets_id_fk" FOREIGN KEY ("result_asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notebook_cells" ADD CONSTRAINT "notebook_cells_source_notebook_id_source_notebooks_id_fk" FOREIGN KEY ("source_notebook_id") REFERENCES "public"."source_notebooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notebook_outputs" ADD CONSTRAINT "notebook_outputs_notebook_cell_id_notebook_cells_id_fk" FOREIGN KEY ("notebook_cell_id") REFERENCES "public"."notebook_cells"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentations" ADD CONSTRAINT "presentations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentations" ADD CONSTRAINT "presentations_source_notebook_id_source_notebooks_id_fk" FOREIGN KEY ("source_notebook_id") REFERENCES "public"."source_notebooks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentations" ADD CONSTRAINT "presentations_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_presentation_id_presentations_id_fk" FOREIGN KEY ("presentation_id") REFERENCES "public"."presentations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_blocks" ADD CONSTRAINT "slide_blocks_slide_id_slides_id_fk" FOREIGN KEY ("slide_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_blocks" ADD CONSTRAINT "slide_blocks_source_cell_id_notebook_cells_id_fk" FOREIGN KEY ("source_cell_id") REFERENCES "public"."notebook_cells"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_blocks" ADD CONSTRAINT "slide_blocks_source_output_id_notebook_outputs_id_fk" FOREIGN KEY ("source_output_id") REFERENCES "public"."notebook_outputs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_blocks" ADD CONSTRAINT "slide_blocks_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slides" ADD CONSTRAINT "slides_presentation_id_presentations_id_fk" FOREIGN KEY ("presentation_id") REFERENCES "public"."presentations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_notebooks" ADD CONSTRAINT "source_notebooks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_events_project_id_idx" ON "activity_events" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "activity_events_actor_user_id_idx" ON "activity_events" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "activity_events_entity_type_entity_id_idx" ON "activity_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "activity_events_event_type_idx" ON "activity_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "activity_events_created_at_idx" ON "activity_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_events_project_id_created_at_idx" ON "activity_events" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_suggestions_project_id_idx" ON "ai_suggestions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "ai_suggestions_presentation_id_idx" ON "ai_suggestions" USING btree ("presentation_id");--> statement-breakpoint
CREATE INDEX "ai_suggestions_slide_id_idx" ON "ai_suggestions" USING btree ("slide_id");--> statement-breakpoint
CREATE INDEX "ai_suggestions_requested_by_user_id_idx" ON "ai_suggestions" USING btree ("requested_by_user_id");--> statement-breakpoint
CREATE INDEX "ai_suggestions_action_type_idx" ON "ai_suggestions" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "ai_suggestions_status_idx" ON "ai_suggestions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_suggestions_created_at_idx" ON "ai_suggestions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "assets_project_id_idx" ON "assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "assets_source_notebook_id_idx" ON "assets" USING btree ("source_notebook_id");--> statement-breakpoint
CREATE INDEX "assets_source_cell_id_idx" ON "assets" USING btree ("source_cell_id");--> statement-breakpoint
CREATE INDEX "assets_source_output_id_idx" ON "assets" USING btree ("source_output_id");--> statement-breakpoint
CREATE INDEX "assets_asset_type_idx" ON "assets" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "assets_created_at_idx" ON "assets" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "assets_storage_key_idx" ON "assets" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "assets_sha256_idx" ON "assets" USING btree ("sha256");--> statement-breakpoint
CREATE INDEX "export_jobs_project_id_idx" ON "export_jobs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "export_jobs_presentation_id_idx" ON "export_jobs" USING btree ("presentation_id");--> statement-breakpoint
CREATE INDEX "export_jobs_requested_by_user_id_idx" ON "export_jobs" USING btree ("requested_by_user_id");--> statement-breakpoint
CREATE INDEX "export_jobs_result_asset_id_idx" ON "export_jobs" USING btree ("result_asset_id");--> statement-breakpoint
CREATE INDEX "export_jobs_status_idx" ON "export_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "export_jobs_export_type_idx" ON "export_jobs" USING btree ("export_type");--> statement-breakpoint
CREATE INDEX "export_jobs_created_at_idx" ON "export_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "export_jobs_presentation_id_status_created_at_idx" ON "export_jobs" USING btree ("presentation_id","status","created_at");--> statement-breakpoint
CREATE INDEX "notebook_cells_source_notebook_id_idx" ON "notebook_cells" USING btree ("source_notebook_id");--> statement-breakpoint
CREATE INDEX "notebook_cells_cell_type_idx" ON "notebook_cells" USING btree ("cell_type");--> statement-breakpoint
CREATE INDEX "notebook_cells_is_noise_idx" ON "notebook_cells" USING btree ("is_noise");--> statement-breakpoint
CREATE UNIQUE INDEX "notebook_cells_source_notebook_id_cell_index_idx" ON "notebook_cells" USING btree ("source_notebook_id","cell_index");--> statement-breakpoint
CREATE INDEX "notebook_outputs_notebook_cell_id_idx" ON "notebook_outputs" USING btree ("notebook_cell_id");--> statement-breakpoint
CREATE INDEX "notebook_outputs_output_type_idx" ON "notebook_outputs" USING btree ("output_type");--> statement-breakpoint
CREATE INDEX "notebook_outputs_render_strategy_idx" ON "notebook_outputs" USING btree ("render_strategy");--> statement-breakpoint
CREATE INDEX "notebook_outputs_is_noise_idx" ON "notebook_outputs" USING btree ("is_noise");--> statement-breakpoint
CREATE UNIQUE INDEX "notebook_outputs_notebook_cell_id_output_index_idx" ON "notebook_outputs" USING btree ("notebook_cell_id","output_index");--> statement-breakpoint
CREATE INDEX "presentations_project_id_idx" ON "presentations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "presentations_source_notebook_id_idx" ON "presentations" USING btree ("source_notebook_id");--> statement-breakpoint
CREATE INDEX "presentations_theme_id_idx" ON "presentations" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "presentations_status_idx" ON "presentations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "presentations_mode_idx" ON "presentations" USING btree ("mode");--> statement-breakpoint
CREATE INDEX "presentations_created_at_idx" ON "presentations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "presentations_project_id_created_at_idx" ON "presentations" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "projects_user_id_created_at_idx" ON "projects" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "share_links_project_id_idx" ON "share_links" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "share_links_presentation_id_idx" ON "share_links" USING btree ("presentation_id");--> statement-breakpoint
CREATE INDEX "share_links_created_by_user_id_idx" ON "share_links" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "share_links_token_hash_idx" ON "share_links" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "share_links_is_revoked_idx" ON "share_links" USING btree ("is_revoked");--> statement-breakpoint
CREATE INDEX "share_links_created_at_idx" ON "share_links" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "share_links_presentation_id_is_revoked_idx" ON "share_links" USING btree ("presentation_id","is_revoked");--> statement-breakpoint
CREATE INDEX "slide_blocks_slide_id_idx" ON "slide_blocks" USING btree ("slide_id");--> statement-breakpoint
CREATE INDEX "slide_blocks_source_cell_id_idx" ON "slide_blocks" USING btree ("source_cell_id");--> statement-breakpoint
CREATE INDEX "slide_blocks_source_output_id_idx" ON "slide_blocks" USING btree ("source_output_id");--> statement-breakpoint
CREATE INDEX "slide_blocks_asset_id_idx" ON "slide_blocks" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "slide_blocks_block_type_idx" ON "slide_blocks" USING btree ("block_type");--> statement-breakpoint
CREATE INDEX "slide_blocks_created_at_idx" ON "slide_blocks" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "slide_blocks_slide_id_block_order_idx" ON "slide_blocks" USING btree ("slide_id","block_order");--> statement-breakpoint
CREATE INDEX "slides_presentation_id_idx" ON "slides" USING btree ("presentation_id");--> statement-breakpoint
CREATE INDEX "slides_status_idx" ON "slides" USING btree ("status");--> statement-breakpoint
CREATE INDEX "slides_layout_idx" ON "slides" USING btree ("layout");--> statement-breakpoint
CREATE INDEX "slides_created_at_idx" ON "slides" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "slides_presentation_id_slide_order_idx" ON "slides" USING btree ("presentation_id","slide_order");--> statement-breakpoint
CREATE INDEX "source_notebooks_project_id_idx" ON "source_notebooks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "source_notebooks_validation_status_idx" ON "source_notebooks" USING btree ("validation_status");--> statement-breakpoint
CREATE INDEX "source_notebooks_processing_status_idx" ON "source_notebooks" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "source_notebooks_created_at_idx" ON "source_notebooks" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "source_notebooks_storage_key_idx" ON "source_notebooks" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "source_notebooks_sha256_idx" ON "source_notebooks" USING btree ("sha256");--> statement-breakpoint
CREATE INDEX "source_notebooks_project_id_created_at_idx" ON "source_notebooks" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "themes_slug_idx" ON "themes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "themes_is_builtin_idx" ON "themes" USING btree ("is_builtin");--> statement-breakpoint
CREATE INDEX "themes_created_at_idx" ON "themes" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");