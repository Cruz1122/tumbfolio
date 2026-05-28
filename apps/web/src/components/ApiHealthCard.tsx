import { getApiHealth } from "@/lib/api-client";

export async function ApiHealthCard() {
  let status: string;

  try {
    const health = await getApiHealth();
    status = `${health.service}: ${health.status}`;
  } catch {
    status = "api: unavailable";
  }

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-gray-800">
      <p className="font-semibold text-orange-700">API health</p>
      <p>{status}</p>
    </div>
  );
}
