import { XMLBuilder } from "fast-xml-parser";
import { NBXP_PACKAGE_VERSION } from "@tumbfolio/domain";

export { NBXP_PACKAGE_VERSION };
export const NBXP_MIME_TYPE = "application/vnd.tumbfolio.nbxp+zip";

export type NbxpManifestPart = {
  href: string;
  mediaType: string;
  required: boolean;
  sha256?: string;
};

export type NbxpManifest = {
  packageVersion: typeof NBXP_PACKAGE_VERSION;
  parts: NbxpManifestPart[];
};

export function createBaseManifest(parts: NbxpManifestPart[]): NbxpManifest {
  return {
    packageVersion: NBXP_PACKAGE_VERSION,
    parts
  };
}

export function buildManifestXml(manifest: NbxpManifest): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true
  });

  return builder.build({
    "nbxp:manifest": {
      "@_xmlns:nbxp": "https://tumbfolio.app/schema/nbxp/1.0",
      "@_packageVersion": manifest.packageVersion,
      "nbxp:part": manifest.parts.map((part) => ({
        "@_href": part.href,
        "@_mediaType": part.mediaType,
        "@_required": String(part.required),
        ...(part.sha256 ? { "@_sha256": part.sha256 } : {})
      }))
    }
  });
}

export function buildPresentationXmlSkeleton(input: { id: string; title: string; presentationModelVersion: string }): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true
  });

  return builder.build({
    "nbxp:presentation": {
      "@_xmlns:nbxp": "https://tumbfolio.app/schema/nbxp/1.0",
      "@_version": input.presentationModelVersion,
      "@_id": input.id,
      "@_title": input.title
    }
  });
}
