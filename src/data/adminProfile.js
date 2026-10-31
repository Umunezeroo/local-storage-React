export const ADMIN_PROFILE_PICTURE_KEY = "tableMateAdminProfilePicture";

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 512;

export function getAdminProfilePicture() {
  const picture = window.localStorage.getItem(ADMIN_PROFILE_PICTURE_KEY);
  if (picture === null) return "";
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(picture)) {
    throw new Error("Saved administrator profile picture is invalid.");
  }
  return picture;
}

export function saveAdminProfilePicture(picture) {
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(picture)) {
    throw new Error("Profile picture could not be saved in the expected format.");
  }
  window.localStorage.setItem(ADMIN_PROFILE_PICTURE_KEY, picture);
}

export function removeAdminProfilePicture() {
  window.localStorage.removeItem(ADMIN_PROFILE_PICTURE_KEY);
}

export async function processAdminProfilePicture(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    throw new Error("Choose an image smaller than 10 MB.");
  }
  if (typeof globalThis.createImageBitmap !== "function") {
    throw new Error("This browser cannot process profile pictures. Try a current browser.");
  }

  const bitmap = await globalThis.createImageBitmap(file);
  try {
    if (bitmap.width < 1 || bitmap.height < 1) {
      throw new Error("The selected image is empty or invalid.");
    }

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to process the selected image.");
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    bitmap.close();
  }
}
