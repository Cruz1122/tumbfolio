import { PresentationDocumentSchema, type PresentationDocument } from "../presentation-model/index.js";
import { FIXTURE_PROJECT_ID, FIXTURE_NOTEBOOK_ID } from "./normalized-notebook.fixture.js";
import { themeFixture } from "./themes.fixture.js";

export const FIXTURE_PRESENTATION_ID = "00000000-0000-4000-8000-000000000040";
export const FIXTURE_SLIDE_IDS = {
  title: "00000000-0000-4000-8000-000000000050",
  content: "00000000-0000-4000-8000-000000000051",
  figureFocus: "00000000-0000-4000-8000-000000000052"
} as const;
export const FIXTURE_BLOCK_IDS = {
  titleMarkdown: "00000000-0000-4000-8000-000000000060",
  code: "00000000-0000-4000-8000-000000000061",
  output: "00000000-0000-4000-8000-000000000062",
  image: "00000000-0000-4000-8000-000000000063",
  aiSummary: "00000000-0000-4000-8000-000000000064"
} as const;
export const FIXTURE_ASSET_IDS = {
  outputImage: "00000000-0000-4000-8000-000000000070"
} as const;

export const presentationDocumentFixture: PresentationDocument = PresentationDocumentSchema.parse({
  presentation: {
    id: FIXTURE_PRESENTATION_ID,
    projectId: FIXTURE_PROJECT_ID,
    sourceNotebookId: FIXTURE_NOTEBOOK_ID,
    title: "Analysis Report",
    description: "A comprehensive data analysis presentation",
    themeId: "00000000-0000-4000-8000-000000000080",
    mode: "default",
    status: "draft",
    slideCount: 3,
    metadata: {},
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:05:00.000Z"
  },
  slides: [
    {
      id: FIXTURE_SLIDE_IDS.title,
      presentationId: FIXTURE_PRESENTATION_ID,
      slideOrder: 0,
      title: "Analysis Report",
      subtitle: "Q1 2026",
      layout: "title",
      status: "normal",
      sourceCellIds: [],
      metadata: {},
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z"
    },
    {
      id: FIXTURE_SLIDE_IDS.content,
      presentationId: FIXTURE_PRESENTATION_ID,
      slideOrder: 1,
      title: "Code & Output",
      layout: "code_output",
      status: "normal",
      sourceCellIds: [],
      metadata: {},
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z"
    },
    {
      id: FIXTURE_SLIDE_IDS.figureFocus,
      presentationId: FIXTURE_PRESENTATION_ID,
      slideOrder: 2,
      title: "Results Overview",
      layout: "figure_focus",
      status: "normal",
      sourceCellIds: [],
      metadata: {},
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z"
    }
  ],
  blocks: [
    {
      id: FIXTURE_BLOCK_IDS.titleMarkdown,
      slideId: FIXTURE_SLIDE_IDS.title,
      blockOrder: 0,
      blockType: "markdown",
      content: { markdown: "# Analysis Report\n\nQ1 2026" },
      visibility: {
        showCode: false, showOutput: true, showMarkdown: true,
        collapseCode: true, collapseLogs: true,
        renderOutputAsImage: false, includeInExport: true, visibleInEditor: true
      },
      metadata: {},
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z"
    },
    {
      id: FIXTURE_BLOCK_IDS.code,
      slideId: FIXTURE_SLIDE_IDS.content,
      blockOrder: 0,
      blockType: "code",
      sourceCellId: "00000000-0000-4000-8000-000000000021",
      content: { code: 'print("hello world")', language: "python" },
      visibility: {
        showCode: true, showOutput: true, showMarkdown: true,
        collapseCode: false, collapseLogs: true,
        renderOutputAsImage: false, includeInExport: true, visibleInEditor: true
      },
      metadata: {},
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z"
    },
    {
      id: FIXTURE_BLOCK_IDS.aiSummary,
      slideId: FIXTURE_SLIDE_IDS.figureFocus,
      blockOrder: 0,
      blockType: "ai_summary",
      content: { text: "Key finding: revenue grew 20% QoQ." },
      visibility: {
        showCode: false, showOutput: true, showMarkdown: true,
        collapseCode: true, collapseLogs: true,
        renderOutputAsImage: false, includeInExport: true, visibleInEditor: true
      },
      metadata: {},
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z"
    }
  ],
  assets: [],
  theme: themeFixture
});
