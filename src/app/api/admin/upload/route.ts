import { getCurrentUser } from "@/server/auth/session";
import { storeFile, UploadError } from "@/server/services/storage.service";
import { errorResponse, json, route } from "@/server/http";

export const POST = route(async (req: Request) => {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return errorResponse(403, "FORBIDDEN");
  const form = await req.formData();
  const folder = String(form.get("folder") ?? "misc");
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return errorResponse(400, "NO_FILE");
  try {
    const urls = await Promise.all(files.slice(0, 20).map((f) => storeFile(f, folder)));
    return json({ urls });
  } catch (e) {
    if (e instanceof UploadError) return errorResponse(400, "UPLOAD_REJECTED", e.message);
    throw e;
  }
});
