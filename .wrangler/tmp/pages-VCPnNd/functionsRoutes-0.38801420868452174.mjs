import { onRequestDelete as __api_themes__name__ts_onRequestDelete } from "C:\\git\\Resume\\functions\\api\\themes\\[name].ts"
import { onRequestGet as __api_themes__name__ts_onRequestGet } from "C:\\git\\Resume\\functions\\api\\themes\\[name].ts"
import { onRequestPut as __api_themes__name__ts_onRequestPut } from "C:\\git\\Resume\\functions\\api\\themes\\[name].ts"
import { onRequestPost as __api_upload__type__ts_onRequestPost } from "C:\\git\\Resume\\functions\\api\\upload\\[type].ts"
import { onRequestGet as __api_uploads__filename__ts_onRequestGet } from "C:\\git\\Resume\\functions\\api\\uploads\\[filename].ts"
import { onRequestGet as __api_health_ts_onRequestGet } from "C:\\git\\Resume\\functions\\api\\health.ts"
import { onRequestGet as __api_resume_ts_onRequestGet } from "C:\\git\\Resume\\functions\\api\\resume.ts"
import { onRequestPut as __api_resume_ts_onRequestPut } from "C:\\git\\Resume\\functions\\api\\resume.ts"
import { onRequestGet as __api_settings_ts_onRequestGet } from "C:\\git\\Resume\\functions\\api\\settings.ts"
import { onRequestPut as __api_settings_ts_onRequestPut } from "C:\\git\\Resume\\functions\\api\\settings.ts"
import { onRequestGet as __api_themes_index_ts_onRequestGet } from "C:\\git\\Resume\\functions\\api\\themes\\index.ts"
import { onRequestPost as __api_themes_index_ts_onRequestPost } from "C:\\git\\Resume\\functions\\api\\themes\\index.ts"

export const routes = [
    {
      routePath: "/api/themes/:name",
      mountPath: "/api/themes",
      method: "DELETE",
      middlewares: [],
      modules: [__api_themes__name__ts_onRequestDelete],
    },
  {
      routePath: "/api/themes/:name",
      mountPath: "/api/themes",
      method: "GET",
      middlewares: [],
      modules: [__api_themes__name__ts_onRequestGet],
    },
  {
      routePath: "/api/themes/:name",
      mountPath: "/api/themes",
      method: "PUT",
      middlewares: [],
      modules: [__api_themes__name__ts_onRequestPut],
    },
  {
      routePath: "/api/upload/:type",
      mountPath: "/api/upload",
      method: "POST",
      middlewares: [],
      modules: [__api_upload__type__ts_onRequestPost],
    },
  {
      routePath: "/api/uploads/:filename",
      mountPath: "/api/uploads",
      method: "GET",
      middlewares: [],
      modules: [__api_uploads__filename__ts_onRequestGet],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_health_ts_onRequestGet],
    },
  {
      routePath: "/api/resume",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_resume_ts_onRequestGet],
    },
  {
      routePath: "/api/resume",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_resume_ts_onRequestPut],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_settings_ts_onRequestGet],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_settings_ts_onRequestPut],
    },
  {
      routePath: "/api/themes",
      mountPath: "/api/themes",
      method: "GET",
      middlewares: [],
      modules: [__api_themes_index_ts_onRequestGet],
    },
  {
      routePath: "/api/themes",
      mountPath: "/api/themes",
      method: "POST",
      middlewares: [],
      modules: [__api_themes_index_ts_onRequestPost],
    },
  ]