const API_PREFIX = "/api";

export const enum ApplicationRoutes {
  TODOS = `${API_PREFIX}/todos`,
}
export const enum TodosRoutes {
  CREATE = "/",
  GET_ALL = "/",
  GET_BY_ID = "/:id",
}
