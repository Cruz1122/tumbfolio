import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const INITIATE_PATH = "**/api/notebooks/uploads/initiate";
const COMPLETE_PATH = "**/api/notebooks/uploads/complete";
const SIGNED_UPLOAD_PATH = "**/mock-upload";

async function uploadNotebook(page: Page) {
  await page.locator('input[type="file"]').setInputFiles({
    name: "demo.ipynb",
    mimeType: "application/x-ipynb+json",
    buffer: Buffer.from('{"cells":[]}'),
  });
}

async function waitForHeroFade(page: Page) {
  await page.waitForFunction(() => {
    const feedback = document.querySelector('[data-testid="hero-feedback"]');
    return feedback?.getAttribute("data-transition-state") === "fading";
  });
}

test("shows success feedback in the center, turns green, and then redirects", async ({
  page,
}) => {
  await page.route(INITIATE_PATH, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        upload_id: "upload-1",
        storage_key: "uploads/demo.ipynb",
        upload_url: "http://127.0.0.1:3000/mock-upload",
        expires_in_seconds: 3600,
        status: "accepted",
      }),
    });
  });

  await page.route(SIGNED_UPLOAD_PATH, async (route) => {
    await route.fulfill({ status: 200, body: "" });
  });

  await page.route(COMPLETE_PATH, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        project_id: "proj-1",
        source_notebook_id: "nb-1",
        validation_status: "valid",
        processing_status: "completed",
      }),
    });
  });

  await page.goto("/");
  await uploadNotebook(page);

  const title = page.getByTestId("hero-title");
  const subtitle = page.getByTestId("hero-subtitle");
  const primaryButton = page.getByTestId("hero-primary-cta");
  const hero = page.getByTestId("hero");
  const logo = page.getByTestId("hero-logo");
  const feedback = page.getByTestId("hero-feedback");

  await waitForHeroFade(page);
  await expect(title).toHaveText("Notebook listo para revisar");
  await expect(subtitle).toHaveText(
    "Tu notebook ya entró. En un momento te llevamos al resumen para validar y seguir.",
  );
  await expect(primaryButton).toHaveText(/Continuar/);
  await expect(hero).toHaveAttribute("data-accent", "green");
  await expect(logo).toHaveAttribute("data-tone", "green");
  await expect(logo).toHaveAttribute("data-logo-src", "/tumbfolio-green.svg");
  await expect(feedback).toHaveAttribute("data-transition-state", "fading");
  await expect(page).toHaveURL(/\/notebooks\/nb-1\/summary/, { timeout: 4000 });
});

test("shows error feedback, fades the full visual block, and resets after 5 seconds", async ({
  page,
}) => {
  await page.route(INITIATE_PATH, async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        error_code: "FILE_TOO_LARGE",
      }),
    });
  });

  await page.goto("/");
  await uploadNotebook(page);

  const title = page.getByTestId("hero-title");
  const subtitle = page.getByTestId("hero-subtitle");
  const primaryButton = page.getByTestId("hero-primary-cta");
  const hero = page.getByTestId("hero");
  const logo = page.getByTestId("hero-logo");
  const feedback = page.getByTestId("hero-feedback");

  await expect(title).toHaveText("La solicitud falló");
  await expect(subtitle).toHaveText("El notebook supera el tamaño máximo permitido.");
  await expect(primaryButton).toHaveText(/Reintentar/);
  await expect(hero).toHaveAttribute("data-accent", "red");
  await expect(logo).toHaveAttribute("data-tone", "red");
  await expect(logo).toHaveAttribute("data-logo-src", "/tumbfolio-red.svg");
  await expect(feedback).toHaveAttribute("data-transition-state", "fading");
  await expect(page.getByTestId("hero-previous-copy")).toHaveAttribute(
    "data-visual-transition",
    "fade-out",
  );
  await expect(page.getByRole("link", { name: "Ver colección" })).toBeVisible();

  await page.waitForTimeout(6500);
  await expect(hero).toHaveAttribute("data-accent", "orange");
  await expect(logo).toHaveAttribute("data-logo-src", "/tumbfolio.svg");
  await expect(title).toHaveText("Notebooks entran, presentaciones salen");
  await expect(primaryButton).toHaveText(/^Subir$/);
});

test("does not trigger a full fade while loading copy changes internally", async ({
  page,
}) => {
  await page.route(INITIATE_PATH, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        upload_id: "upload-3",
        storage_key: "uploads/demo.ipynb",
        upload_url: "http://127.0.0.1:3000/mock-upload",
        expires_in_seconds: 3600,
        status: "accepted",
      }),
    });
  });

  await page.route(SIGNED_UPLOAD_PATH, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    await route.fulfill({ status: 200, body: "" });
  });

  await page.route(COMPLETE_PATH, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        project_id: "proj-1",
        source_notebook_id: "nb-3",
        validation_status: "valid",
        processing_status: "completed",
      }),
    });
  });

  await page.goto("/");
  await uploadNotebook(page);

  const feedback = page.getByTestId("hero-feedback");
  const primaryButton = page.getByTestId("hero-primary-cta");

  await expect(primaryButton).toHaveText(/Preparando/);
  await expect(feedback).toHaveAttribute("data-transition-state", "idle");
  await expect(page.getByTestId("hero-previous-copy")).toHaveCount(0);

  await expect(primaryButton).toHaveText(/Subiendo/);
  await expect(feedback).toHaveAttribute("data-transition-state", "idle");
  await expect(page.getByTestId("hero-previous-copy")).toHaveCount(0);
});

test("fades from error back to orange while retrying, before any later success state", async ({
  page,
}) => {
  let initiateAttempts = 0;
  let completeAttempts = 0;
  let releaseSecondComplete: (() => void) | null = null;
  const secondCompleteGate = new Promise<void>((resolve) => {
    releaseSecondComplete = resolve;
  });

  await page.route(INITIATE_PATH, async (route) => {
    initiateAttempts += 1;

    if (initiateAttempts === 1) {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error_code: "INVALID_INPUT",
        }),
      });
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        upload_id: "upload-2",
        storage_key: "uploads/demo.ipynb",
        upload_url: "http://127.0.0.1:3000/mock-upload",
        expires_in_seconds: 3600,
        status: "accepted",
      }),
    });
  });

  await page.route(SIGNED_UPLOAD_PATH, async (route) => {
    await route.fulfill({ status: 200, body: "" });
  });

  await page.route(COMPLETE_PATH, async (route) => {
    completeAttempts += 1;

    if (completeAttempts === 1) {
      await secondCompleteGate;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        project_id: "proj-1",
        source_notebook_id: "nb-2",
        validation_status: "valid",
        processing_status: "completed",
      }),
    });
  });

  await page.goto("/");
  await uploadNotebook(page);

  const hero = page.getByTestId("hero");
  const logo = page.getByTestId("hero-logo");
  const feedback = page.getByTestId("hero-feedback");
  await expect(hero).toHaveAttribute("data-accent", "red");
  await expect(logo).toHaveAttribute("data-tone", "red");
  await expect(logo).toHaveAttribute("data-logo-src", "/tumbfolio-red.svg");

  await uploadNotebook(page);

  await waitForHeroFade(page);
  await expect(hero).toHaveAttribute("data-accent", "orange");
  await expect(logo).toHaveAttribute("data-tone", "orange");
  await expect(logo).toHaveAttribute("data-logo-src", "/tumbfolio.svg");
  await expect(feedback).toHaveAttribute("data-transition-state", "fading");
  await expect(page.getByTestId("hero-primary-cta")).toHaveText(/Preparando|Subiendo/);

  await page.waitForTimeout(500);
  await expect(feedback).toHaveAttribute("data-transition-state", "idle");
  await expect(feedback).not.toHaveAttribute("data-previous-accent", "red");

  releaseSecondComplete?.();
});
