import type { Presentation } from "@tumbfolio/domain";

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
  slides: [
    {
      id: FIXTURE_IDS.slideId,
      presentationId: FIXTURE_IDS.presentationId,
      order: 0,
      title: "First slide",
      layout: "title",
      status: "normal",
      sourceCellIds: [],
      blocks: []
    }
  ],
  metadata: {},
  presentationModelVersion: "1.0.0"
};
