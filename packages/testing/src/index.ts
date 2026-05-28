import type { Presentation, Slide } from "@tumbfolio/domain";

export const FIXTURE_IDS = {
  projectId: "00000000-0000-4000-8000-000000000001",
  presentationId: "00000000-0000-4000-8000-000000000002",
  slideId: "00000000-0000-4000-8000-000000000003"
} as const;

export const minimalPresentationFixture: Presentation = {
  id: FIXTURE_IDS.presentationId,
  projectId: FIXTURE_IDS.projectId,
  title: "Fixture presentation",
  mode: "default",
  status: "draft",
  slideCount: 0,
  description: undefined,
  themeId: undefined,
  sourceNotebookId: undefined,
  metadata: {},
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:00:00.000Z"
};

export const minimalSlideFixture: Slide = {
  id: FIXTURE_IDS.slideId,
  presentationId: FIXTURE_IDS.presentationId,
  slideOrder: 0,
  title: "First slide",
  layout: "title",
  status: "normal",
  sourceCellIds: [],
  speakerNotes: undefined,
  subtitle: undefined,
  metadata: {},
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:00:00.000Z"
};
