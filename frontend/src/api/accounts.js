import api from "./axios";

export const getAccounts = (params = {}) =>
  api.get("/accounts/", { params }).then((response) => response.data);

export const getAccount = (id) =>
  api.get(`/accounts/${id}`).then((response) => response.data);

export const createAccount = (body) =>
  api.post("/accounts/", body).then((response) => response.data);

export const updateAccount = (id, body) =>
  api.put(`/accounts/${id}`, body).then((response) => response.data);

export const archiveAccount = (id) =>
  api.patch(`/accounts/${id}/archive`).then((response) => response.data);