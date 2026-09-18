import api from "./api";

export const openSecureFile = async (url) => {
  const response = await api.get(url, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(response.data);

  window.open(blobUrl, "_blank");

  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 10000);
};